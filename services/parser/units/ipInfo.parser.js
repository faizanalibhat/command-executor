

const parseIpInfo = (commandResponse) => {
    let ipInfo = [];

    if (!commandResponse.output) {
        ipInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "ip_info",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            orgId: commandResponse.orgId,
            remarks: "No ipinfo fetched!"
        });

        return ipInfo;
    }

    try {
        let parsedOutput = Object.values(JSON.parse(commandResponse.output));

        for (let ipData of parsedOutput) {
            ipInfo.push({
                commandId: commandResponse.id,
                status: "success",
                commandType: "ip_info",
                domain: commandResponse.domain,
                subdomain: commandResponse.subdomain,
                scanId: commandResponse.scanId,
                scanType: commandResponse.scanType,
                orgId: commandResponse.orgId,
                ip: ipData.ip,
		hostname: ipData.hostname,
                city: ipData.city,
                region: ipData.region,
                country: ipData.country,
                loc: ipData.loc,
                org: ipData.org,
                timezone: ipData.timezone,
		postal: ipData.postal
            });
        }
    }
    catch(error) {
        ipInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "ip_info",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            orgId: commandResponse.orgId,
            remarks: "No ipinfo fetched!"
        });

        return ipInfo;
    }

    return ipInfo;
}


module.exports = parseIpInfo;
