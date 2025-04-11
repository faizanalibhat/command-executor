const https = require('https');
const ipRangeCheck = require('ip-range-check');

// URLs for Cloudflare and CloudFront ranges
const CLOUDFLARE_IPS_URL = 'https://www.cloudflare.com/ips-v4';
const CLOUDFLARE_IPS_V6_URL = 'https://www.cloudflare.com/ips-v6';
const AWS_IP_RANGES_URL = 'https://ip-ranges.amazonaws.com/ip-ranges.json';


function fetchCloudflareIPs(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data.trim().split('\n')); // Split by newline into an array
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fetch CloudFront IP ranges from AWS
function fetchCloudFrontIPs() {
  return new Promise((resolve, reject) => {
    https.get(AWS_IP_RANGES_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const cloudFrontRanges = json.prefixes
            .filter((entry) => entry.service === 'CLOUDFRONT') // Filter for CloudFront ranges
            .map((entry) => entry.ip_prefix); // Extract the CIDR block
          resolve(cloudFrontRanges);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to check if an IP belongs to Cloudflare or CloudFront
async function checkIPs(ipList) {
  try {
    const cloudflareIPv4Ranges = await fetchCloudflareIPs(CLOUDFLARE_IPS_URL);
    const cloudflareIPv6Ranges = await fetchCloudflareIPs(CLOUDFLARE_IPS_V6_URL);

    const cloudFrontRanges = await fetchCloudFrontIPs();

    const results = ipList.map((ip) => {
      const isCloudflare =
        ipRangeCheck(ip, cloudflareIPv4Ranges) || ipRangeCheck(ip, cloudflareIPv6Ranges);
      const isCloudFront = ipRangeCheck(ip, cloudFrontRanges);

      return {
        ip: ip,
        waf: { 
          hasWaf: isCloudFront || isCloudflare,
          waf: {
            cloudflare: isCloudflare,
            cloudfront: isCloudFront
          },
        }
      }
    });

    return results;
  } catch (error) {
    console.error('An error occurred:', error);
    return [];
  }
}

// checkIPs(ipList);

module.exports = checkIPs;