// commandFetcher.js
const os = require('os');
const executeCommand = require('../executor/executor');

async function processBatch(commands, batchSize) {
    const promises = [];
    
    for (let i = 0; i < commands.length; i += batchSize) {
        const batch = commands.slice(i, i + batchSize);
        await Promise.all(batch.map(cmd => executeCommand(cmd)));
    }
}

async function fetchCommands(commands) {
	console.log("commands: ", commands);

    try {
        if (!Array.isArray(commands) || commands.length === 0) {
            throw new Error("No Commands Received! Killing the instance.");
        }

        // Calculate optimal batch size based on command types and system resources
        const cpuCount = os.cpus().length;
        const memoryGB = os.totalmem() / 1024 / 1024 / 1024;
        const batchSize = Math.max(
            1,
            Math.min(
                Math.floor(cpuCount * 1.5),
                Math.floor(memoryGB / 2),
                5  // maximum concurrent tasks
            )
        );

        console.log(`Processing ${commands.length} commands in batches of ${batchSize}`);
        await processBatch(commands, batchSize);

    } catch (error) {
        console.error('Error in command processing:', error);
        throw error;
    }
}

module.exports = fetchCommands;
