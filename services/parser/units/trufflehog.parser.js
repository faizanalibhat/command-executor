
const parseTrufflehog = (commandResponse) => {
    let trufflehogInfo = [];

    if (!commandResponse.output) {
        trufflehogInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "trufflehog",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            remarks: "No trufflehog info fetched!"
        });

        return trufflehogInfo;
    }


    try {
        let lines = commandResponse.output.split("\n");

        for (let line of lines) {
            let parsedOutput = JSON.parse(line);

            if (parsedOutput) {
                trufflehogInfo.push({
                    commandId: commandResponse.id,
                    status: "success",
                    commandType: "trufflehog",
                    domain: commandResponse.domain,
                    subdomain: commandResponse.subdomain,
                    orgId: commandResponse.orgId,
                    scanType: commandResponse.scanType,
                    scanId: commandResponse.scanId,
                    trufflehog: parsedOutput
                });
            }
            else {
                trufflehogInfo.push({
                    commandId: commandResponse.id,
                    status: "failed",
                    commandType: "trufflehog",
                    domain: commandResponse.domain,
                    subdomain: commandResponse.subdomain,
                    orgId: commandResponse.orgId,
                    scanType: commandResponse.scanType,
                    scanId: commandResponse.scanId,
                    remarks: "No trufflehog info fetched"
                });
            }
        }
    }
    catch(error) {
        trufflehogInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "trufflehog",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            remarks: "No trufflehog info fetched"
        });
    }

    return trufflehogInfo;
}

module.exports = parseTrufflehog;
