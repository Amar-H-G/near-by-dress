const Redis = require('ioredis');

let redis;

const connectRedis = () => {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('connect', () => console.log('✅ Redis Connected'));
    redis.on('error', (err) => console.error('❌ Redis Error:', err.message));
  } catch (error) {
    console.error('❌ Redis Init Failed:', error.message);
  }
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
