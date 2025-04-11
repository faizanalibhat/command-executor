const parseNmap = require("./units/nmap.parser");
const parseSubfinder = require("./units/subfinder.parser");
const parseHttpx = require("./units/httpx.parser");
const parseTlsscan = require("./units/tlsscan.parser");
const parseIpInfo = require("./units/ipInfo.parser");
const parseDig = require("./units/dig.parser");
const parseApis = require("./units/api.parser");


const parserMap = {
    "nmap": parseNmap,
    "dig": parseDig,
    "subfinder": parseSubfinder,
    "httpx": parseHttpx,
    "tlsscan": parseTlsscan,
    "ip_info": parseIpInfo,
    "api": parseApis
}


const parseOutput = (commandResponse) => {
    let type = commandResponse.commandType;

    const parser = parserMap[type];

    let parsedInfo = parser(commandResponse);

    return parsedInfo;
}

module.exports = { parseOutput };