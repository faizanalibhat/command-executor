const fetchCommands = require("../helpers/fetchCommands");
const resultService = require("../services/results.service");

const getResults = async (req, res) => {
    const results = await resultService.get();

    return res.json(results);
}

const storeCommands = async (req, res) => {
    const commands = req.body;

    res.json({ status: "success", message: "commands recieved." });
    
    // done executing.
    await fetchCommands(commands.commands);
};


module.exports = {
    storeCommands,
    getResults
}
