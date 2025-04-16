// executor.js
const path = require('path');
const os = require('node:os');
const WorkerPool = require('./workers/workerPool');
const resultService = require("../services/results.service");

const workerPool = new WorkerPool(
    path.resolve('executor/workers/commandWorker.js'),
    Math.max(2, os.cpus().length - 1)
);

async function processResult(result) {
    if (!result) return;

    switch (result.type) {
        case 'subfinder':
            await resultService.store(result.parsedDomains);
            await resultService.store(result.parsedDns);
            break;
        case "api":
        case 'httpx':
        case 'dig':
        case 'tlsscan':
        case 'nmap':
        case 'ip_info':
            await resultService.store(result.results);
            break;
    }
}

async function executeCommand(commandObj) {
    try {
        console.log("[+] EXECUTING ", commandObj.command);

        const result = await workerPool.runTask(commandObj);
        await processResult(result);

        // if result type is subfinder, process domains, dns and start processing apis
        if (result.type == "subfinder") {
            const apis = await workerPool.runTask({ ...commandObj, subdomains: result.activeDomains || [], commandType: "api" });
            await processResult(apis);
        }
    } catch (error) {
        console.error(`Error executing command: ${commandObj.commandType}`, error);
    }
}

module.exports = executeCommand;