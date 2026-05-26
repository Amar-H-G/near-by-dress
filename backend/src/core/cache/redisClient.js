// [ignoring loop detection]
/**
 * redisClient.js
 * Provides unified access to the core Redis connection instance.
 * Gracefully degrades with warning logs if Redis goes offline, preventing server crashes.
 */

const { getRedis } = require('../../config/redis');

const getClient = () => {
  const client = getRedis();
  if (!client) {
    console.warn('⚠️  Redis Client is not initialized or offline. Caching features will be bypassed.');
  }
  return client;
};

module.exports = {
  getClient
};
