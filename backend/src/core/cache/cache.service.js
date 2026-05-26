// [ignoring loop detection]
/**
 * cache.service.js
 * Core caching services with robust TTL, background caching (stale-while-revalidate),
 * and pattern-based invalidate selectors.
 */

const { getClient } = require('./redisClient');

/**
 * Gets cached data by key.
 */
const get = async (key) => {
  const redis = getClient();
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`❌ Cache get error for key [${key}]:`, error.message);
    return null;
  }
};

/**
 * Sets data in cache with an optional TTL (seconds).
 */
const set = async (key, value, ttlSeconds = 300) => {
  const redis = getClient();
  if (!redis) return false;
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error(`❌ Cache set error for key [${key}]:`, error.message);
    return false;
  }
};

/**
 * Removes individual key.
 */
const del = async (key) => {
  const redis = getClient();
  if (!redis) return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`❌ Cache delete error for key [${key}]:`, error.message);
    return false;
  }
};

/**
 * Deletes keys matching a wildcard pattern.
 * Uses high-speed SCAN instead of blocking KEYS in production.
 */
const invalidatePattern = async (pattern) => {
  const redis = getClient();
  if (!redis) return false;
  try {
    let cursor = '0';
    let deletedCount = 0;
    
    do {
      const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = reply[0];
      const keys = reply[1];
      
      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');

    if (deletedCount > 0) {
      console.log(`🧹 Invalidation Pattern [${pattern}]: Deleted ${deletedCount} cached entries.`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Cache scan/invalidation error for pattern [${pattern}]:`, error.message);
    return false;
  }
};

/**
 * Stale-While-Revalidate caching helper.
 * If data exists in cache, return it instantly. If the data is stale, trigger an async revalidation.
 */
const staleWhileRevalidate = async (key, fetchFn, ttlSeconds = 300) => {
  const cached = await get(key);
  if (cached) {
    // Perform background async revalidation to refresh cache
    fetchFn().then((freshData) => {
      set(key, freshData, ttlSeconds);
    }).catch((err) => {
      console.warn(`⚠️  Background revalidation failed for [${key}]:`, err.message);
    });
    return cached;
  }

  // Cache miss: execute fetch synchronously
  const freshData = await fetchFn();
  await set(key, freshData, ttlSeconds);
  return freshData;
};

module.exports = {
  get,
  set,
  del,
  invalidatePattern,
  staleWhileRevalidate
};
