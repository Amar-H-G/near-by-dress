const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    // Do not exit — retry will happen on next DB operation
    // In production, set up a retry mechanism
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
