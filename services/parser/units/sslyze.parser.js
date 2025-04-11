
const parseSslyze = (commandResponse) => {
    const sslyzeInfo = [];

    try {
        let parsedOutput = JSON.parse(commandResponse.output);

        sslyzeInfo.push({
            commandId: commandResponse.id,
            status: "success",
            commandType: "sslyze",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            server_scan_results: JSON.stringify(parsedOutput.server_scan_results ?? []),
            date_scans_started: JSON.stringify(parsedOutput.date_scans_started ?? ""),
            date_scans_completed: parsedOutput.date_scans_completed ?? ""
        });
    }
    catch(error) {
        sslyzeInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "sslyze",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            remarks: "No data from sslyze"
        });
    }

    return sslyzeInfo;
}

module.exports = parseSslyze;
