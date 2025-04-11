
const parseApis = (commandResponse) => {
    let parsedOutput = [];

    try {
        let loadOutput = commandResponse.output;

        for (let api of loadOutput) {
            console.log(api);
            parsedOutput.push({
                status: "success",
                commandType: "api",
                domain: commandResponse.domain,
                subdomain: api.subdomain,
                orgId: commandResponse.orgId,
                scanType: commandResponse.scanType,
                scanId: commandResponse.scanId,
                url: api.url,
                technique: api.technique,
                commandId: commandResponse.id
            });
        }
    }
    catch(error) {
        parsedOutput.push({
            status: "failed",
            commandType: "api",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            commandId: commandResponse.id,
            remarks: "No APIs Found!"
        });
    }


    return parsedOutput;
}

module.exports = parseApis;
