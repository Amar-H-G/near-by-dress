// [ignoring loop detection]
/**
 * PM2 Process Manager Configuration — High Concurrency Cluster mode.
 * Configures the Node.js process to run across all available CPU cores,
 * implementing automatic memory restarts and graceful shutdowns.
 */

module.exports = {
  apps: [
    {
      name: 'nearbydress-api',
      script: 'server.js',
      instances: 'max',       // Run on all CPU cores for linear request scaling
      exec_mode: 'cluster',   // Cluster mode to distribute load
      watch: false,           // Set to false in production to prevent recursive reload spikes
      max_memory_restart: '1G', // Restart automatically if leaks exceed 1GB
      listen_timeout: 10000,    // Wait 10 seconds before forcefully killing process
      kill_timeout: 15000,      // Wait 15 seconds during graceful reload
      graceful_shutdown: true,  // Enable graceful process termination
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
