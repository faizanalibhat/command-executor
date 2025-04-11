const axios = require("axios");

const SERVICE_KEY = process.env.SERVICE_KEY;

const webhook = axios.create({
    headers: {
        'service-api-key': SERVICE_KEY
    },
    validateStatus: () => true
});


module.exports = webhook;
