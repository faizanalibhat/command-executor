const fetchCommands = require("../helpers/fetchCommands");
const resultService = require("../services/results.service");

var timeoutId;

const getResults = async (req, res) => {
    const results = await resultService.get();

    return res.json(results);
}

const storeCommands = async (req, res) => {
    const commands = req.body;

    res.json({ status: "success", message: "commands recieved." });

    if (timeoutId) clearInterval(timeoutId);
    
    // done executing.
    await fetchCommands(commands.commands);

    if (await resultService.isempty()) {
        process.exit(0);
    }

	console.log("FINISHED EXECUTION: kill in 5MINS");

    timeoutId = setTimeout(() => {
        process.exit(0);
    }, 1000*60*59);

    return;
};


module.exports = {
    storeCommands,
    getResults
}
