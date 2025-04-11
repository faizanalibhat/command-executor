const sslCertificate = require('get-ssl-certificate');


async function getCertificateWithRetry(domain, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const certificate = await sslCertificate.get(domain);
      const cert = {
        domain: domain,
        cn: certificate.subject.CN,
        SAN: certificate.subjectaltname,
        issuer: certificate.issuer,
        valid_from: certificate.valid_from,
        valid_to: certificate.valid_to,
        serialNumber: certificate.serialNumber
      };
      return cert;
    } catch (error) {
      if (attempt < retries) {
        console.log(`Attempt ${attempt} failed, retrying...`);
      } else {
        console.error(`Failed after ${retries} attempts:`, error);
      }
    }
  }
}

module.exports = getCertificateWithRetry;