const dns = require('dns').promises;
const axios = require('axios');

// Cache for DNS resolvers
let cachedResolvers = null;
const RESOLVER_CACHE_DURATION = 3600000; // 1 hour in milliseconds
let lastResolverFetch = 0;

async function fetchResolvers() {
    // Return cached resolvers if they're still valid
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
        console.warn('Failed to fetch resolvers, using fallback:', error.message);
    }
    
    return ['8.8.8.8', '1.1.1.1'];
}

// Predefined record types for ANY query
const ANY_TYPES = ['A', 'AAAA', 'TXT', 'MX', 'CNAME', 'SOA'];

// DNS resolver functions map
const resolverFunctions = {
    A: dns.resolve4,
    AAAA: dns.resolve6,
    TXT: dns.resolveTxt,
    MX: dns.resolveMx,
    CNAME: dns.resolveCname,
    SOA: dns.resolveSoa
};

// Record formatter map for better performance
const recordFormatters = {
    A: (host, record) => ({
        host,
        ttl: '',
        record_class: 'A',
        record_type: 'A',
        value: record
    }),
    AAAA: (host, record) => ({
        host,
        ttl: '',
        record_class: 'AAAA',
        record_type: 'AAAA',
        value: record
    }),
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

async function resolveRecords(domain, resolvers, type = "ANY") {
    dns.setServers(resolvers);

    const records = await resolver(domain, type);

    return {
        dns_records: records,
        ip_addresses: records.filter(r => r.record_type === "A" || r.record_type === "AAAA")
    };
}

async function resolver(domain, type = "ANY") {
    const resolveTypes = type === "ANY" ? ANY_TYPES : [type];
    const promises = resolveTypes.map(async (recordType) => {
        try {
            const resolveFunc = resolverFunctions[recordType];
            if (!resolveFunc) return [];

            const results = await resolveFunc(domain);
            const formatter = recordFormatters[recordType];
            
            if (!formatter || !results) return [];
            
            return recordType === 'SOA' 
                ? [formatter(domain, results)]
                : Array.isArray(results) 
                    ? results.map(result => formatter(domain, result))
                    : [formatter(domain, results)];
        } catch (error) {
            return [];
        }
    });

    const results = await Promise.all(promises);
    return results.flat();
}

async function main(domain, type = "ANY") {
    const resolvers = await fetchResolvers();
    return resolveRecords(domain, resolvers, type);
}

module.exports = main;