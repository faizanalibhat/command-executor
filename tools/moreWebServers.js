#!/usr/bin/env node
const http = require('http');
const https = require('https');

const host = 'snapsec.co';
const ports = [8080, 8090, 443, 8443];

const checkWebService = (host, port) =>
  new Promise(resolve => {
    const protocol = port === 443 ? https : http;
    protocol.get({ hostname: host, port, timeout: 3000 }, res => {
      let body = '';
      
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const titleMatch = body.match(/<title>(.*?)<\/title>/i);
        resolve({
          target: `${protocol === https ? 'https' : 'http'}://${host}:${port}`,
          statusCode: res.statusCode,
          title: titleMatch ? titleMatch[1] : 'N/A',
          headers: res.headers
        });
      });
    }).on('error', () => resolve(null));
  });

Promise.all(ports.map(port => checkWebService(host, port)))
  .then(results => console.log(JSON.stringify(results.filter(Boolean), null, 2)))
  .catch(console.error);
