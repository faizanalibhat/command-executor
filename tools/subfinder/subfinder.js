const subdomainResolver = require('./main');

async function run(domain) {
    try {
        const results = await subdomainResolver(domain);
        console.log(`Found ${results.subdomains.length} subdomains`);
        return results;
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = run;
