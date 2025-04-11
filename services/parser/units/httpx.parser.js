
const parseHttpx = (commandResponse) => {
    let parsedOutput = [];

    try {
        let loadOutput = commandResponse.output;

        parsedOutput.push({
            commandId: commandResponse.id,
            status: "success",
            commandType: "httpx",
            // scheme: loadOutput.scheme,
            // status: loadOutput.status,
            // port: loadOutput.port,
            tech: loadOutput.tech,
            // DNS: loadOutput.a,
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            // headers: loadOutput.raw_header,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId
        })
    }
    catch(err) {
        parsedOutput.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "httpx",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            remarks: "No HTTPx info available"
        });
    }

    return parsedOutput;
}

module.exports = parseHttpx;
