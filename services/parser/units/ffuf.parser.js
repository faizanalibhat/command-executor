
const parseFfuf = (commandResponse) => {
    let ffufInfo = [];

    let lines = commandResponse.output.split("\n");
    let found = false;

    for (let line of lines) {
        line = line.replace(/\x1b\[(\d+[a-zA-Z]+)/g, '', line);

        if (line.includes("Status:")) {
            let parts = line.trim().split(" ");
            let path = null;
            let statusCode = null;

            let index = 0;

            while (index < parts.length) {
                let part = parts[index];

                if (part == "[Status:") {
                    let statusPartLength = parts[index + 1].length - 1;
                    statusCode = parseInt(parts[index + 1].substring(0, statusPartLength - 1));
                }
                else if (part.startsWith("/" && !path)) {
                    path = part;
                }
            }

            if (path && statusCode) {
                ffufInfo.push({
                    status: "success",
                    commandId: commandResponse.id,
                    commandType: "ffuf",
                    domain: commandResponse.domain,
                    subdomain: commandResponse.subdomain,
                    orgId: commandResponse.orgId,
                    path: commandResponse.path,
                    scanId: commandResponse.scanId,
                    scanType: commandResponse.scanType,
                    status_code: statusCode
                });
                found = true;
            }

        }
    }

    if (!found) {
        ffufInfo.push({
            status: "failed",
            commandType: "ffuf",
            commandId: commandResponse.id,
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            remarks: "No Endpoints found in FFUF"
        });
    }

    return ffufInfo;
}

module.exports = parseFfuf;
