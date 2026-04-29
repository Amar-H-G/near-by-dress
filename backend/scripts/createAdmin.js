const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

// FIX: Force Google/Cloudflare DNS for SRV lookups (matches db.js config)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to MongoDB');

    const User = require('../src/models/User');

    const existing = await User.findOne({ email: 'admin@nearbydress.com' });
    if (existing) {
      console.log('Admin user already exists:', existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'NearByDress Admin',
      email: 'admin@nearbydress.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+919999999999',
    });

    console.log('✅ Admin user created:');
    console.log('   Email:', admin.email);
    console.log('   Password: Admin@123456');
    console.log('   Role:', admin.role);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
