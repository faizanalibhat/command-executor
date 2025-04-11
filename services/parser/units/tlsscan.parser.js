const parseTlsscan = (commandResponse) => {
    let tlsscanInfo = [];

    try {
        if (!commandResponse.output) {
            throw new Error("No output data");
        }

        const cert = commandResponse.output;

        // const lines = commandResponse.output.split('\n');
        // let certificate = '';
        // let isInCertBlock = false;

        // // Parse certificate block
        // for (const line of lines) {
        //     if (line.includes('-----BEGIN CERTIFICATE-----')) {
        //         isInCertBlock = true;
        //     }
        //     if (isInCertBlock) {
        //         certificate += line + '\n';
        //     }
        //     if (line.includes('-----END CERTIFICATE-----')) {
        //         isInCertBlock = false;
        //     }
        // }

        // // Parse TLS information
        // let tlsVersions = new Set();
        // let preferredCipher = '';
        // let ip = '';
        // let secureRenego = '';
        
        // for (const line of lines) {
        //     // Get IP
        //     if (line.includes('Connected to')) {
        //         const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
        //         ip = match ? match[1] : '';
        //     }
        //     // Get TLS versions
        //     if (line.includes('enabled')) {
        //         if (line.includes('TLSv1.3')) tlsVersions.add('TLSv1.3');
        //         if (line.includes('TLSv1.2')) tlsVersions.add('TLSv1.2');
        //         if (line.includes('TLSv1.1')) tlsVersions.add('TLSv1.1');
        //         if (line.includes('TLSv1')) tlsVersions.add('TLSv1');
        //     }
        //     // Get preferred cipher
        //     if (line.includes('Preferred') && !preferredCipher) {
        //         const parts = line.replace(/\x1B\[\d+(?:;\d+)*m/g, '').trim().split(/\s+/);
        //         if (parts.length > 3) {
        //             preferredCipher = parts.slice(3).join(' ');
        //         }
        //     }
        //     // Get renegotiation info
        //     if (line.includes('Session renegotiation')) {
        //         secureRenego = line.includes('secure') ? 'secure' : 'insecure';
        //     }
        // }

        // // Get certificate details
        // const getCertValue = (lines, key) => {
        //     const line = lines.find(l => l.includes(key));
        //     return line ? line.split(':').slice(1).join(':').trim() : '';
        // };

        // // Find the second SSL Certificate section which has formatted details
        // const certDetailsStartIndex = lines.findIndex((line, index) => 
        //     line.includes('SSL Certificate:') && 
        //     index > lines.findIndex(l => l.includes('-----END CERTIFICATE-----'))
        // );

        // const certLines = lines.slice(certDetailsStartIndex);

        // const certData = {
        //     serialNumber: getCertValue(certLines, 'Serial Number:'),
        //     signatureAlgorithm: getCertValue(certLines, 'Signature Algorithm:'),
        //     subject: getCertValue(certLines, 'Subject:').replace('DNS:', ''),
        //     altnames: getCertValue(certLines, 'Altnames:').replace('DNS:', ''),
        //     issuer: getCertValue(certLines, 'Issuer:'),
        //     validFrom: getCertValue(certLines, 'Not valid before:'),
        //     validTo: getCertValue(certLines, 'Not valid after:'),
        // };

        tlsscanInfo.push({
            commandId: commandResponse.id,
            status: "success",
            commandType: "tlsscan",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            certificateChain: JSON.stringify([{
                subject: {
                    CN: cert.cn || commandResponse.subdomain
                },
                altnames: cert.SAN,
                issuer: {
                    CN: cert?.issuer?.CN
                },
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                serialNumber: cert.serialNumber,
                // signatureAlgorithm: certData.signatureAlgorithm
            }]),
            // cipher: preferredCipher,
            compression: "None",
            elapsedTime: "",
            expansion: "",
            host: commandResponse.subdomain,
            // ip: ip,
            ocspStapled: "false",
            port: "443",
            // secureRenego: secureRenego,
            sni: commandResponse.subdomain,
            tempPublicKeyAlg: "RSA",
            tempPublicKeySize: "2048",
            // tlsVersion: Array.from(tlsVersions).sort().reverse()[0] || "",
            verifyCertResult: "false",
            verifyHostResult: "",
            type: "2"
        });

    } catch (error) {
        console.log(error);
        tlsscanInfo.push({
            status: "failed",
            commandId: commandResponse.id,
            commandType: "tlsscan",
            domain: commandResponse.domain,
            subdomain: commandResponse.subdomain,
            orgId: commandResponse.orgId,
            scanType: commandResponse.scanType,
            scanId: commandResponse.scanId,
            remarks: "no data in tlsscan!"
        });
    }

    return tlsscanInfo;
};

module.exports = parseTlsscan;
