
const parseSubfinder = (commandResponse) => {
    let parsedOutput = [];

    try {
        let loadOutput = commandResponse.output;

        for (let subdomain of loadOutput) {
            parsedOutput.push({
                status: "success",
                state: subdomain.status,
                commandType: "subfinder",
                domain: commandResponse.domain,
                subdomain: subdomain.host,
                headers: subdomain.headers,
                title: subdomain.title,
                statusCode: subdomain.statusCode,
                orgId: commandResponse.orgId,
                scanType: commandResponse.scanType,
                scanId: commandResponse.scanId,
                group: subdomain["group"],
                fullUrl: subdomain["fullUrl"],
                commandId: commandResponse.id
            });
        }
    }
    catch(error) {
        parsedOutput.push({
            status: "failed",
            commandType: "subfinder",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            commandId: commandResponse.id,
            remarks: "No Subfinder Data found!"
        });
    }


    return parsedOutput;
}

module.exports = parseSubfinder;
