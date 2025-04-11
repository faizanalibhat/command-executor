const parseExternalLinks = (commandResponse) => {
    let externalLinksInfo = [];

    try {
        let parsedOutput = JSON.parse(commandResponse.output);

        externalLinksInfo.push({
            status: "success",
            commandType: "external_links",
            commandId: commandResponse.id,
            css: parsedOutput.css,
            js: parsedOutput.js,
            images: parsedOutput.images,
            other: parsedOutput.other,
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            orgId: commandResponse.orgId
        });
    }
    catch(error) {
        externalLinksInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "external_links",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            remarks: "Not data available from external Links"
        });
    }

    return externalLinksInfo;
}

module.exports = parseExternalLinks;
