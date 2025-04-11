// worker.js
const { parentPort } = require('worker_threads');
const dns = require("./dns");

// Worker process to handle DNS resolution
parentPort.on('message', async (domains) => {
    try {
        const results = await Promise.all(
            domains.map(async domain => ({
                domain,
                dnsRecord: await dns(domain)
            }))
        );
        parentPort.postMessage(results);
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
});