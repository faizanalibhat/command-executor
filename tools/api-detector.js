const axios = require('axios');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path');

// Common API paths to check
const API_PATHS = [
    '/api/',
    '/v1/',
    '/v2/',
    '/swagger.json',
    '/openapi.json',
    '/graphql'
];

// Function to check a single URL for API endpoints
async function checkUrl(url) {
    try {
        console.log(`[~] Probing ${url}`);
        const response = await axios.get(url, {
            timeout: 5000,
            validateStatus: function (status) {
                return status < 500;
            }
        });

        const contentType = response.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
            return { apiDetected: true, technique: 'JSON Content-Type' };
        }

        if (response.data && typeof response.data === 'string') {
            if (response.data.includes('swagger') || response.data.includes('openapi')) {
                return { apiDetected: true, technique: 'Swagger/OpenAPI Documentation' };
            }
        }

        return { apiDetected: false };
    } catch (error) {
        return { apiDetected: false };
    }
}

// Worker thread code
if (!isMainThread) {
    const scanSubdomains = async () => {
        const results = [];
        const subdomains = workerData?.subdomains || [];

        for (const subdomain of subdomains) {
            for (const apiPath of API_PATHS) {
                const url = `https://${subdomain?.replace(/^https?:\/\//, '')}${apiPath}`;
                const result = await checkUrl(url);
                if (result.apiDetected) {
                    results.push({
                        subdomain,
                        url,
                        technique: result.technique
                    });
                }
            }
        }
        
        parentPort.postMessage(results);
    };

    scanSubdomains().catch(error => {
        console.error('Worker error:', error);
        parentPort.postMessage([]);
    });
}

class APIDetector {
    constructor(numWorkers = 10) {
        this.numWorkers = numWorkers;
        this.workers = new Set();
    }

    async detectAPIs(domains) {
        if (!Array.isArray(domains) || domains.length === 0) {
            throw new Error('Domains must be a non-empty array');
        }

        // Ensure reasonable number of workers
        const effectiveWorkers = Math.min(this.numWorkers, domains.length);
        const chunkSize = Math.ceil(domains.length / effectiveWorkers);
        const chunks = [];

        // Split domains into chunks
        for (let i = 0; i < domains.length; i += chunkSize) {
            chunks.push(domains.slice(i, i + chunkSize));
        }

        try {
            // Create and run workers with proper cleanup
            const workerPromises = chunks.map(chunk => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker(__filename, {
                        workerData: { subdomains: chunk }
                    });

                    this.workers.add(worker);

                    worker.on('message', (result) => {
                        this.workers.delete(worker);
                        resolve(result);
                    });

                    worker.on('error', (error) => {
                        this.workers.delete(worker);
                        console.error('Worker error:', error);
                        resolve([]);
                    });

                    worker.on('exit', (code) => {
                        this.workers.delete(worker);
                        if (code !== 0) {
                            console.warn(`Worker stopped with exit code ${code}`);
                        }
                    });
                });
            });

            // Wait for all workers to complete
            const results = await Promise.all(workerPromises);

            console.log("apis detected: ", results);

            return results.flat();
        } catch (error) {
            console.error('Error in detectAPIs:', error);
            return [];
        } finally {
            // Ensure all workers are terminated
            await this.cleanup();
        }
    }

    async cleanup() {
        const terminationPromises = Array.from(this.workers).map(worker => {
            return new Promise((resolve) => {
                worker.once('exit', () => resolve());
                worker.terminate();
            });
        });

        await Promise.all(terminationPromises);
        this.workers.clear();
    }
}

// Export the APIDetector class
module.exports = { APIDetector };