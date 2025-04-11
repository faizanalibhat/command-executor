

const parseNuclei = (commandResponse) => {
    let nucleiInfo = [];

    if (commandResponse.output) {
        try {
            let parsedOutput = JSON.parse(commandResponse.output);

            if (parsedOutput.length) {
                for (let vuln of parsedOutput) {
                    suppressed = false;

                    if (vuln.info.severity == "info") {
                        suppressed = true
                    }
                    nucleiInfo.push({
                        commandId: commandResponse.id,
                        status: "success",
                        commandType: "nuclei",
                        "domain": commandResponse.domain,
                        "subdomain": commandResponse.subdomain,
                        "orgId": commandResponse.orgId,
                        "scanId": commandResponse.scanId,
                        "supressed": commandResponse.supressed,
                        "scanType": commandResponse.scanType,
                        "template-id": vuln["template-id"] ?? "",
                        "name": vuln["info"]["name"] ?? "",
                        "tags": vuln["info"]["tags"] ?? [],
                        "description": vuln["info"]["description"] ?? "",
                        "severity": vuln["info"]["severity"] ?? "medium",
                        "type": vuln["type"] ?? "",
                        "host": vuln["host"] ?? "",
                        "matched-at": vuln["matched-at"] ?? "",
                        "ip": vuln["ip"] ?? "",
                        "timestamp": vuln["timestamp"] ?? '',
                        "matcher-status": vuln["matcher-status"] ?? false,
                        "matcher-name": vuln["matcher-name"] ?? ""
                    });
                }
            }
            else {
                nucleiInfo.push({
                    commandId: commandResponse.id,
                    domain: commandResponse.domain,
                    status: "failed",
                    commandType: "nuclei",
                    subdomain: commandResponse.subdomain,
                    orgId: commandResponse.orgId,
                    scanId: commandResponse.scanId,
                    scanType: commandResponse.scanType,
                    remarks: "No data from nuclei"
                });
            }
        }
        catch(error) {
            nucleiInfo.push({
                commandId: commandResponse.id,
                status: "failed",
                commandType: "nuclei",
                domain: commandResponse.domain,
                subdomain: commandResponse.subdomain,
                orgId: commandResponse.orgId,
                scanId: commandResponse.scanId,
                scanType: commandResponse.scanType,
                remarks: "No data from nuclei"
            });
        }
    }
    else {
        nucleiInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "nuclei",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            remarks: "No data from nuclei"
        });
    }

    return nucleiInfo;
} 

module.exports = parseNuclei;
