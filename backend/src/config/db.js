const mongoose = require('mongoose');
const dns = require('dns');

/**
 * FIX: Node.js (libuv) uses the local system DNS resolver by default.
 * Many home/office routers (192.168.x.x) do NOT support DNS SRV record
 * lookups, which mongodb+srv:// relies on to discover replica set members.
 *
 * Setting public DNS servers (Google / Cloudflare) forces Node's DNS client
 * to use resolvers that fully support SRV records.
 *
 * This call must happen BEFORE any mongoose.connect() call.
 */
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // How long the driver waits to find an available server (ms)
      serverSelectionTimeoutMS: 15000,

      // How long to wait for a TCP connection to be established (ms)
      connectTimeoutMS: 10000,

      // How long to wait for a socket operation (ms)
      socketTimeoutMS: 45000,

      // Maximum pool size — adjust based on expected load
      maxPoolSize: 10,

      // Minimum pool size kept alive
      minPoolSize: 2,

      // How long (ms) a connection can remain idle before being closed
      maxIdleTimeMS: 30000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // ── Mongoose connection event listeners ──────────────────────────────────
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);

    // Diagnostic hints
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('   → DNS / SRV lookup failed. Check:');
      console.error('     1. MONGO_URI starts with mongodb+srv://');
      console.error('     2. Atlas cluster name matches URI exactly');
      console.error('     3. Network allows outbound TCP on port 27017');
    }

    if (error.message.includes('authentication failed') || error.message.includes('EAUTH')) {
      console.error('   → Authentication error. Check DB username/password in MONGO_URI');
    }

    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('not authorized')) {
      console.error('   → Your IP is not whitelisted on Atlas. Add 0.0.0.0/0 in Network Access.');
    }

    if (attempt < MAX_RETRIES) {
      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(() => connectDB(attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error(`   Max retries (${MAX_RETRIES}) reached. Please check Atlas configuration.`);
    }
  }
};

module.exports = connectDB;
