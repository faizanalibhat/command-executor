const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const os = require('os');
const { Worker } = require('worker_threads');
const http = require('http');
const https = require('https');

// Constants
const SUBFINDER_TIMEOUT = 240000; // 4 mins
const CPU_COUNT = os.cpus().length;
const OPTIMAL_BATCH_SIZE = 20;
const MAX_WORKERS = CPU_COUNT - 1;
const SCAN_PORTS = [80, 443, 8080, 8090, 8443]; // Common web service ports

class WorkerPool {
    constructor(workerPath, numWorkers) {
        this.workerPath = workerPath;
        this.numWorkers = numWorkers;
        this.workers = [];
        this.freeWorkers = [];
        this.queue = [];
        
        this.initialize();
    }

    initialize() {
        for (let i = 0; i < this.numWorkers; i++) {
            const worker = new Worker(this.workerPath);
            this.workers.push(worker);
            
            worker.on('message', (result) => {
                this.handleTaskComplete(worker, result);
            });
            
            worker.on('error', (error) => {
                console.error(`Worker error: ${error}`);
                this.handleTaskComplete(worker, { error: error.message });
            });
            
            this.freeWorkers.push(worker);
        }
    }

    async runTask(data) {
        return new Promise((resolve, reject) => {
            const task = { data, resolve, reject };
            
            if (this.freeWorkers.length > 0) {
                this.runTaskOnWorker(this.freeWorkers.pop(), task);
            } else {
                this.queue.push(task);
            }
        });
    }

    runTaskOnWorker(worker, task) {
        worker.postMessage(task.data);
        worker._currentTask = task;
    }

    handleTaskComplete(worker, result) {
        const task = worker._currentTask;
        
        if (result.error) {
            task.reject(new Error(result.error));
        } else {
            task.resolve(result);
        }

        if (this.queue.length > 0) {
            this.runTaskOnWorker(worker, this.queue.shift());
        } else {
            this.freeWorkers.push(worker);
        }
    }

    async terminate() {
        await Promise.all(this.workers.map(worker => worker.terminate()));
    }
}

// Optimized subdomain resolver with timeout and caching
async function resolveSubdomains(domain) {
    return new Promise((resolve, reject) => {
        const outputPath = path.resolve(`/root/CeAPI/tools/${domain}_subdomains`);
        const args = ['-d', domain, '-o', outputPath, '-t', CPU_COUNT, '-silent'];
        
        const childProcess = spawn('subfinder', args, { 
            cwd: "/root/CeAPI/tools/",
            timeout: SUBFINDER_TIMEOUT 
        });

        const timer = setTimeout(() => {
            childProcess.kill();
            reject(new Error('Subfinder timeout'));
        }, SUBFINDER_TIMEOUT);

        childProcess.on("error", (error) => {
            clearTimeout(timer);
            reject(error);
        });

        childProcess.on("close", async (code) => {
            clearTimeout(timer);
            try {
                const content = await fs.readFile(outputPath, 'utf-8');
                const subdomains = new Set(content.split('\n').filter(Boolean));
                subdomains.add(domain);
                resolve(Array.from(subdomains));
            } catch (error) {
                reject(error);
            }
        });
    });
}

function decideStatusAndGroup(dnsrecord) {
    if (!dnsrecord?.dns_records?.length) {
        return { status: "dead" };
    }

    if (dnsrecord.ip_addresses?.length || 
        dnsrecord.dns_records?.some(record => record.record_type === "CNAME")) {
        return { status: "up", group: "web_servers" };
    }

    return { status: "up", group: "allLive" };
}

// Function to check if a web service is running on a specific host and port
async function checkWebService(host, port) {
    return new Promise(resolve => {
        const protocol = (port === 443 || port === 8443) ? https : http;
        const reqOptions = {
            hostname: host,
            port,
            path: '/',
            method: 'GET',
            timeout: 3000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            rejectUnauthorized: false  // Allow self-signed certificates
        };

        const req = protocol.request(reqOptions, res => {
            let body = '';
            
            res.on('data', chunk => body += chunk.toString());
            res.on('end', () => {
                const titleMatch = body.match(/<title>(.*?)<\/title>/i);
                resolve({
                    host: `${protocol === https ? 'https' : 'http'}://${host}:${port}`,
                    statusCode: res.statusCode,
                    title: titleMatch ? titleMatch[1] : 'N/A',
                    headers: res.headers,
                    status: "up",
                    group: "web_servers"
                });
            });
        });

        req.on('error', () => resolve(null));
        req.on('timeout', () => {
            req.destroy();
            resolve(null);
        });

        req.end();
    });
}

// Function to scan all active domains for web services on different ports
async function scanWebServices(domains, workerPool) {
    const batchSize = 10; // Process domains in batches to avoid overwhelming the system
    const results = [];
    
    console.log(`[+] Scanning ${domains.length} active domains for web services on ports ${SCAN_PORTS.join(', ')}`);
    
    for (let i = 0; i < domains.length; i += batchSize) {
        const domainBatch = domains.slice(i, i + batchSize);
        const batchPromises = domainBatch.flatMap(domain => 
            SCAN_PORTS.map(port => checkWebService(domain, port))
        );
        
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(Boolean);
        results.push(...validResults);
        
        console.log(`[+] Scanned batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(domains.length/batchSize)}, found ${validResults.length} services`);
    }
    
    return results;
}

async function main(domain) {
    const startTime = Date.now();
    const workerPool = new WorkerPool(
        path.resolve(__dirname, 'worker.js'), 
        MAX_WORKERS
    );

    try {
        console.log(`[+] Starting subdomain discovery for ${domain}`);
        const subdomains = await resolveSubdomains(domain);
        console.log(`[+] Found ${subdomains.length} subdomains in ${(Date.now() - startTime) / 1000}s`);

        if (!subdomains.length) {
            return null;
        }

        // Create optimally-sized batches
        const batches = [];
        for (let i = 0; i < subdomains.length; i += OPTIMAL_BATCH_SIZE) {
            batches.push(subdomains.slice(i, i + OPTIMAL_BATCH_SIZE));
        }

        console.log(`[+] Processing ${batches.length} batches with ${MAX_WORKERS} workers`);
        
        // Process batches in parallel using worker pool
        const batchStartTime = Date.now();
        const batchResults = await Promise.all(
            batches.map(async (batch, index) => {
                const result = await workerPool.runTask(batch);
                console.log(`[+] Batch ${index + 1}/${batches.length} completed`);
                return result;
            })
        );

        console.log(`[+] DNS resolution completed in ${(Date.now() - batchStartTime) / 1000}s`);

        // Transform results
        const results = batchResults.flat();
        const subdomainObjects = [];
        const dnsRecordList = [];

        for (const { domain, dnsRecord } of results) {
            subdomainObjects.push({
                host: domain,
                ...decideStatusAndGroup(dnsRecord)
            });
            dnsRecordList.push(dnsRecord);
        }

        // Find active domains for additional scanning
        const activeDomains = subdomainObjects
            .filter(domain => domain.status === "up" && 
                             (domain.group === "web_servers" || domain.group === "allLive"))
            .map(domain => domain.host);

        console.log(`[+] Found ${activeDomains.length} active domains for web service scanning`);
        
        // Perform additional scanning on active domains
        const webServiceStartTime = Date.now();
        const webServices = await scanWebServices(activeDomains, workerPool);
        console.log(`[+] Web service scanning completed in ${(Date.now() - webServiceStartTime) / 1000}s`);
        console.log(`[+] Found ${webServices.length} web services`);

        // Cleanup
        await fs.unlink(path.resolve(`/root/CeAPI/tools/${domain}_subdomains`))
            .catch(console.error);
        await workerPool.terminate();

        console.log("[+] FOUND THE FOLLOWING: ", { subdomains: [...subdomainObjects, ...webServices],  dnsrecords: dnsRecordList, activeDomains });

        return { 
            subdomains: [...subdomainObjects, ...webServices], 
            dnsrecords: dnsRecordList,
            activeDomains,
            // webServices
        };

    } catch (error) {
        await workerPool.terminate();
        console.error('Error in processing:', error);
        throw error;
    }
}

module.exports = main;