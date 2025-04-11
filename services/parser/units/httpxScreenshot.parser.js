

const parseHttpxScreenshot = (commandResponse) => {
    let httpxScreenshotInfo = [];

    if (commandResponse.output) {
        httpxScreenshotInfo.push({
            commandId: commandResponse.id,
            status: "success",
            commandType: "httpx_screenshot",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            screenshot: commandResponse.output
        });
    }
    else {
        httpxScreenshotInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "httpx_screenshot",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            screenshot: "No screenshot captured."
        });
    }

    return httpxScreenshotInfo;
}

module.exports = parseHttpxScreenshot;
