
const parseNmap = (commandResponse) => {
    const parsedInfo = [];

    const pattern = /(\d+\/\w+)\s+(\w+)\s+(.*)/g;

    const allMatches = commandResponse.output.matchAll(pattern);

    if (!commandResponse.output || allMatches.length == 0) {
        parsedInfo.push({
            commandId: commandResponse.id,
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            status: "failed",
            commandType: "nmap",
            remarks: "No Nmap info fetched!"
        });

        console.log("nmap result: ", parsedInfo);

        return parsedInfo;
    }

    for (let match of allMatches) {
        parsedInfo.push({
            commandId: commandResponse.id,
            port: match[1],
            state: match[2],
            service: match[0].replace(/ +/g, ' ')?.split(" ")?.slice(2)?.at(0),
            version: match[0].replace(/ +/g, ' ')?.split(" ")?.slice(3)?.join(" "),
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            status: "success",
            commandType: "nmap"
        });
    }

    console.log("nmap result: ", parsedInfo);

    return parsedInfo;
}

module.exports = parseNmap;
