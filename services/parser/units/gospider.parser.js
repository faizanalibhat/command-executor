
const parseGospider = (commandResponse) => {
    let goSipderInfo = [];

    if (commandResponse.output) {
        let outputs = commandResponse.output.split("\n");

        for (let entry of outputs) {
            try {
                let parsedOutput = JSON.parse(entry);

                goSipderInfo.push({
                    status: "success",
                    commandType: "gospider",
                    domain: commandResponse.domain,
                    subdomain: commandResponse.subdomain,
                    orgId: commandResponse.orgId,
                    scanId: commandResponse.scanId,
                    scanType: commandResponse.scanType,
                    source: parsedOutput.source,
                    type: parsedOutput.type,
                    output: parsedOutput.output,
                    status: parsedOutput.status,
                    commandId: commandResponse.id
                });
            }
            catch(error) {
                continue;
            }
        }
    }
    else {
        goSipderInfo.push({
            status: "failed",
            commandType: "gospider",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            remarks: "No data from goSpider",
            commandId: commandResponse.id
        });
    }
}

module.exports = parseGospider;
