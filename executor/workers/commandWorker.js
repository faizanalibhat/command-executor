// commandWorker.js
const { parentPort } = require('worker_threads');
const dns = require("../../tools/dns");
const certGrabber = require("../../tools/certGrabber");
const wappalyzer = require("../../tools/wappalyzer");
const subfinder = require("../../tools/subfinder");
const { APIDetector } = require("../../tools/api-detector");
const { spawn } = require("child_process");
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const getOutput = require("../../helpers/getOutput");

const CPU_COUNT = os.cpus().length;
const MAX_WORKERS = CPU_COUNT - 1;

async function executeToolCommand(commandObj) {
    switch (commandObj.commandType) {
        case "subfinder":
            return handleSubfinder(commandObj);
        case "httpx":
            return handleHttpx(commandObj);
        case "dig":
            return handleDig(commandObj);
        case "tlsscan":
            return handleTlsScan(commandObj);
        case "api":
            return handleApiScan(commandObj);
        default:
            return handleGenericCommand(commandObj);
    }
}


async function handleSubfinder(commandObj) {
    const { subdomains, dnsrecords, activeDomains } = await subfinder(commandObj.subdomain);

    const parsedDomains = await getOutput(commandObj, subdomains);
    const parsedDns = await getOutput({ ...commandObj, commandType: "dig" }, dnsrecords);

    return { type: "subfinder", parsedDomains, parsedDns, activeDomains };
}


async function handleHttpx(commandObj) {
    const technologies = await wappalyzer(commandObj.subdomain);

    const results = await getOutput(commandObj, technologies);

    return { type: "httpx", results };
}


async function handleDig(commandObj) {
    const result = await dns(commandObj.subdomain, "ANY");

    const results = await getOutput(commandObj, result);

    return { type: "dig", results };
}


async function handleTlsScan(commandObj) {
    const cert = await certGrabber(commandObj.subdomain);

    const results = await getOutput(commandObj, cert);

    return { type: "tlsscan", results };
}



async function handleApiScan(commandObj) {
    const apiDetector = new APIDetector(MAX_WORKERS);
    const apis = await apiDetector.detectAPIs(commandObj.subdomains);

    const results = await getOutput({ ...commandObj, commandType: "api" }, apis);

    return { type: "api", results };
}


async function handleGenericCommand(commandObj) {
    return new Promise((resolve, reject) => {
        const cmd = commandObj.command.split('>');
        const actualCommand = cmd[0].trim().match(/(?:[^\s"]+|"[^"]*")+/g)
            .map(arg => arg.replace(/^['"]|['"]$/g, ''));
        const outputFile = cmd.length > 1 ? cmd[1].trim() : null;

        console.log("[+] EXECUTING " + actualCommand);

        const child = spawn(actualCommand[0], actualCommand.slice(1), {
            cwd: process.env.TOOLS_DIR,
            env: { ...process.env, PYTHONUNBUFFERED: '1' },
            stdio: ['inherit', 'pipe', 'pipe']
        });

        let output = '';
        let errorData = '';

        child.stdout.on('data', (data) => output += data);
        child.stderr.on('data', (data) => errorData += data);

        const timeoutId = setTimeout(() => child.kill('SIGTERM'), 180000);

        child.on('close', async (code) => {
            clearTimeout(timeoutId);
            try {
                if (output && outputFile) {
                    await fs.writeFile(
                        path.join(process.env.TOOLS_DIR, outputFile),
                        output
                    );
                }

                // get parsed output
                const results = await getOutput(commandObj);
                
                resolve({ type: commandObj.commandType, results });
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });

        child.on('error', (error) => { console.log(error); reject(error); });
    });
}



parentPort.on('message', async (commandObj) => {
    try {
        const result = await executeToolCommand(commandObj);
        parentPort.postMessage(result);
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
});