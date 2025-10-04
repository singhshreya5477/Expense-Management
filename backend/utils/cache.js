const NodeCache = require('node-cache');

// Cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

module.exports = cache;
