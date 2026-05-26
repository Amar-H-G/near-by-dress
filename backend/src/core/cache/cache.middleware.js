// [ignoring loop detection]
/**
 * cache.middleware.js
 * Express caching middleware to intercept public GET API requests,
 * serving cache hits instantly with latency statistics.
 */

const cacheService = require('./cache.service');

/**
 * High-performance intercept middleware.
 * @param {Function|String} keyOrBuilder - A static key string or a builder function (req) => String
 * @param {Number} ttlSeconds - Duration of key storage in seconds
 */
const cacheMiddleware = (keyOrBuilder, ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only intercept safe GET requests
    if (req.method !== 'GET') return next();

    const redis = require('./redisClient').getClient();
    if (!redis) return next();

    const start = process.hrtime();

    // Dynamically build key name
    let key;
    try {
      key = typeof keyOrBuilder === 'function' ? keyOrBuilder(req) : keyOrBuilder;
    } catch (err) {
      console.error('⚠️  Failed to generate cache key name in middleware:', err.message);
      return next();
    }

    try {
      const cachedResponse = await cacheService.get(key);
      if (cachedResponse) {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        
        // Append response optimization stats
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Server-Timing', `cache;dur=${durationMs};desc="Redis Cache hit"`);
        res.setHeader('Content-Type', 'application/json');
        
        return res.send(cachedResponse);
      }

      // Intercept original send method to capture JSON response on cache miss
      const originalSend = res.send;
      res.send = function (body) {
        res.setHeader('X-Cache', 'MISS');
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        res.setHeader('Server-Timing', `db;dur=${durationMs};desc="Database fetch"`);
        
        // Cache response asynchronously to prevent blocking response latency
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Body can be parsed object or JSON string
            const dataToCache = typeof body === 'string' ? JSON.parse(body) : body;
            cacheService.set(key, dataToCache, ttlSeconds);
          }
        } catch (cacheErr) {
          console.warn(`⚠️  Failed to save JSON to cache for [${key}]:`, cacheErr.message);
        }

        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      console.error(`❌ Cache middleware error for key [${key}]:`, error.message);
      next();
    }
  };
};

module.exports = cacheMiddleware;
