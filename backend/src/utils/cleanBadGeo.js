const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

// Configure environment first
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Set custom DNS resolvers to avoid Node SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const Shop = require('../models/Shop');

const cleanAndIndex = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env environment variables');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected. Inspecting shops for malformed location objects...');

    const shops = await Shop.find({});
    console.log(`ℹ️ Found ${shops.length} total shops in database.`);

    let cleanedCount = 0;
    for (const shop of shops) {
      const loc = shop.location;
      
      // If location is defined, validate coordinates
      if (loc && loc.type === 'Point') {
        const hasCoords = Array.isArray(loc.coordinates) && loc.coordinates.length === 2;
        const coordsAreNumbers = hasCoords && typeof loc.coordinates[0] === 'number' && typeof loc.coordinates[1] === 'number';

        if (!hasCoords || !coordsAreNumbers) {
          console.log(`⚠️ Cleaning invalid coordinates for shop: "${shop.name}" (${shop._id})`);
          // Remove invalid geo fields completely
          shop.location = undefined;
          await shop.save();
          cleanedCount++;
        }
      }
    }

    console.log(`✅ Cleaned up ${cleanedCount} shops with malformed coordinates.`);

    console.log('🔄 Dropping old indexes on the location field if any exist...');
    try {
      await Shop.collection.dropIndex('location_2dsphere');
      console.log('✅ Dropped index location_2dsphere.');
    } catch (_) {
      console.log('ℹ️ No location_2dsphere index found to drop.');
    }

    console.log('🔄 Explicitly creating clean 2dsphere index on location field...');
    await Shop.collection.createIndex({ location: '2dsphere' }, { sparse: true });
    console.log('🚀 Successfully built 2dsphere index!');

    console.log('🎉 DB repair complete! Closing database connection...');
    await mongoose.connection.close();
    console.log('👋 Database connection closed.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Fatal error during repair script:', err);
    process.exit(1);
  }
};

cleanAndIndex();
