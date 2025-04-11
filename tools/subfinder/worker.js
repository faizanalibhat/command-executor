const { parentPort } = require('worker_threads');
const dns = require('dns').promises;
const axios = require('axios');
const waf = require("../waf");

// Cache for DNS resolvers
let cachedResolvers = null;
const RESOLVER_CACHE_DURATION = 3600000; // 1 hour
let lastResolverFetch = 0;

// Predefined record types and resolver functions
const ANY_TYPES = ['A', 'AAAA', 'TXT', 'MX', 'CNAME', 'SOA'];
const resolverFunctions = {
    A: dns.resolve4,
    AAAA: dns.resolve6,
    TXT: dns.resolveTxt,
    MX: dns.resolveMx,
    CNAME: dns.resolveCname,
    SOA: dns.resolveSoa
};

const recordFormatters = {
    A: (host, record) => { 
        return ({
            host,
            ttl: '',
            record_class: 'A',
            record_type: 'A',
            value: record.ip,
            ...(record.waf ?? {})
        })
    },
    AAAA: (host, record) => {
        return ({
            host,
            ttl: '',
            record_class: 'AAAA',
            record_type: 'AAAA',
            value: record.ip,
            ...(record.waf ?? {})
        })
    },
    TXT: (host, record) => ({
        host,
        ttl: '',
        record_class: 'TXT',
        record_type: 'TXT',
        value: record?.[0]
    }),
    CNAME: (host, record) => ({
        host,
        ttl: '',
        record_class: 'CNAME',
        record_type: 'CNAME',
        value: record
    }),
    SOA: (host, record) => ({
        host,
        ttl: '',
        record_class: 'SOA',
        record_type: 'SOA',
        value: record?.nsname
    }),
    MX: (host, record) => ({
        host,
        ttl: '',
        record_class: 'MX',
        record_type: 'MX',
        value: record?.exchange
    })
};

async function fetchResolvers() {
    if (cachedResolvers && (Date.now() - lastResolverFetch) < RESOLVER_CACHE_DURATION) {
        return cachedResolvers;
    }

    try {
        const response = await axios.get(
            'https://raw.githubusercontent.com/proabiral/Fresh-Resolvers/refs/heads/master/resolvers.txt',
            { 
                timeout: 5000,
                validateStatus: () => true 
            }
        );

        if (response.status === 200) {
            cachedResolvers = response.data.split('\n').filter(Boolean);
            lastResolverFetch = Date.now();
            return cachedResolvers;
        }
    } catch (error) {
        console.warn('Failed to fetch resolvers, using fallback');
    }
    
    return ['8.8.8.8', '1.1.1.1'];
}

async function resolveRecords(domain) {
    const resolveTypes = ANY_TYPES;
    const promises = resolveTypes.map(async (recordType) => {
        try {
            const resolveFunc = resolverFunctions[recordType];
            if (!resolveFunc) return [];

            const results = await resolveFunc(domain);
            const formatter = recordFormatters[recordType];
            
            if (!formatter || !results) return [];

            // if record type is A | AAAA, check if they are under waf.
            let waf_info = results;
            if (recordType == "A" || recordType == "AAAA") {
                waf_info = await waf(results);
            }
            
            return recordType === 'SOA' 
                ? [formatter(domain, results)]
                : Array.isArray(results) 
                    ? waf_info.map(result => formatter(domain, result))
                    : [formatter(domain, results)];
        } catch (error) {
            return [];
        }
    });

    const results = await Promise.all(promises);
    const flatResults = results.flat();

    return {
        dns_records: flatResults,
        ip_addresses: flatResults.filter(r => r.record_type === "A" || r.record_type === "AAAA")
    };
}

async function processSubdomains(domains) {
    const resolvers = await fetchResolvers();
    dns.setServers(resolvers);

    const results = [];
    for (const domain of domains) {
        try {
            const dnsRecord = await resolveRecords(domain);
            results.push({
                domain,
                dnsRecord
            });
        } catch (error) {
            results.push({
                domain,
                dnsRecord: {
                    dns_records: [],
                    ip_addresses: []
                }
            });
        }
    }

    return results;
}

parentPort.on('message', async (domains) => {
    try {
        const results = await processSubdomains(domains);
        parentPort.postMessage(results);
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
});
