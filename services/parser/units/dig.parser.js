
const parseDig = (commandResponse) => {
    let digInfo = [];

    try {
        let parsedOutput = commandResponse.output;

        if (Array.isArray(parsedOutput)) {
            for (let domainRecord of parsedOutput) {
                for (let record of domainRecord.dns_records) {
                    if (record.record_type == "A") {
                        console.log(record);
                    }
                    digInfo.push({
                        commandId: commandResponse.id,
                        status: "success",
                        commandType: "dig",
                        domain: commandResponse.domain,
                        subdomain: commandResponse.subdomain,
                        orgId: commandResponse.orgId,
                        scanId: commandResponse.scanId,
                        scanType: commandResponse.scanType,
                        class: record.record_class,
                        host: record.host,
                        ttl: record.ttl,
                        type: record.record_type,
                        value: record.value,
                        hasWaf: record?.hasWaf,
                        waf: record?.waf,
                    });
                }
            }
        }
        else {
            for (let record of parsedOutput.dns_records) {
                digInfo.push({
                    commandId: commandResponse.id,
                    status: "success",
                    commandType: "dig",
                    domain: commandResponse.domain,
                    subdomain: commandResponse.subdomain,
                    orgId: commandResponse.orgId,
                    scanId: commandResponse.scanId,
                    scanType: commandResponse.scanType,
                    class: record.record_class,
                    host: record.host,
                    ttl: record.ttl,
                    type: record.record_type,
                    value: record.value,
                    hasWaf: record?.hasWaf,
                    waf: record?.waf,
                });
            }
        }
    }
    catch(error) {
        digInfo.push({
            commandId: commandResponse.id,
            status: "failed",
            commandType: "dig",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanId: commandResponse.scanId,
            scanType: commandResponse.scanType,
            remarks: "No data from dig."
        });
    }

    return digInfo;
}

module.exports = parseDig;
