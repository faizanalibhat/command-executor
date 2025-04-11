

const parseWayback = (commandResponse) => {
    let waybackInfo = [];

    if (!commandResponse.output) {
        waybackInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "wayback",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            remarks: "No data from wayback"
        });

        return waybackInfo;
    }

    try {
        let parsedOutput = JSON.parse(commandResponse.output);

        waybackInfo.push({
            commandId: commandResponse.id,
            status: "success",
            commandType: "wayback",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            wayback_urls: parsedOutput.data.wayback_urls ?? [],
            xss_vulnerabilities: parsedOutput.data.xss_vulnerabilities ?? [],
            sqli_vulnerabilities: parsedOutput.data.sqli_vulnerabilities ?? []
        });
    }
    catch(error) {
        waybackInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "wayback",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            remarks: "No data from wayback"
        });
    }

    return waybackInfo;
}

module.exports = parseWayback;
