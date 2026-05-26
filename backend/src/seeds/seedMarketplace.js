// [ignoring loop detection]
/**
 * seedMarketplace.js
 * Complete automated marketplace database seeder for the NearByDress platform.
 * Wipes out existing non-admin data, inserts 20 premium Indian fashion boutiques,
 * generates 200 premium geo-spatial fashion products, and exports credentials.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to DB directly
const connectDB = require('../config/db');

// Import Mongoose Models
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Import Generators
const generateSellers = require('./generators/generateSellers');
const generateShops = require('./generators/generateShops');
const { generateProductsForShop, PRODUCT_TEMPLATES } = require('./generators/generateProducts');

// Default target location: Siliguri, West Bengal
const BASE_LOCATION = {
  city: 'Siliguri',
  state: 'West Bengal',
  pincode: '734001',
  latitude: 26.7271,
  longitude: 88.3953
};

const runSeeder = async () => {
  try {
    console.log('🔄 Connecting to MongoDB database...');
    await connectDB();

    console.log('⚠️  Initiating safe database cleanup...');
    
    // 1. Keep admin accounts, delete all other users
    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(a => a._id);
    console.log(`   - Found ${admins.length} active Admin account(s) to retain.`);
    
    const userDeleteResult = await User.deleteMany({ _id: { $nin: adminIds } });
    console.log(`   - Safely deleted ${userDeleteResult.deletedCount} old non-admin user accounts.`);

    // 2. Wipe other collections safely
    const shopWipe = await Shop.deleteMany({});
    console.log(`   - Cleared ${shopWipe.deletedCount} old boutique shop profiles.`);

    const productWipe = await Product.deleteMany({});
    console.log(`   - Cleared ${productWipe.deletedCount} old product listings.`);

    const categoryWipe = await Category.deleteMany({});
    console.log(`   - Cleared ${categoryWipe.deletedCount} old categories to rebuild pristine structure.`);

    // 3. Seed Fresh Fashion Categories
    console.log('🌱 Creating pristine fashion category mapping...');
    const seededCategories = [];
    for (const temp of PRODUCT_TEMPLATES) {
      // Avoid duplicate creation by using map slug lookups
      let cat = await Category.findOne({ name: temp.categoryName });
      if (!cat) {
        cat = await Category.create({ name: temp.categoryName });
      }
      seededCategories.push(cat);
    }
    
    // Build category map: { name: ID }
    const categoryMap = {};
    seededCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    console.log('   - 10 core premium fashion categories registered.');

    // 4. Generate & Save 20 Boutique Owners (Sellers)
    console.log('👥 Generating 20 realistic Indian boutique owners...');
    const rawSellers = generateSellers();
    const createdSellers = [];
    
    // Save sequentially to trigger the password hashing pre-save hook
    for (const sellerData of rawSellers) {
      const u = new User(sellerData);
      await u.save();
      createdSellers.push(u);
    }
    console.log('   ✔ 20 Unique merchant accounts registered and password-hashed.');

    // 5. Generate & Save 20 Boutique Shops
    console.log('🏢 Locating and deploying 20 localized storefronts...');
    const rawShops = generateShops(createdSellers, BASE_LOCATION);
    const createdShops = [];
    
    for (const shopData of rawShops) {
      const s = await Shop.create(shopData);
      createdShops.push(s);
    }
    console.log('   ✔ 20 Premium boutique profiles verified and geo-indexed within Siliguri radius.');

    // 6. Generate & Save 10 Products for Each Shop (Total 200 Products)
    console.log('🛍️ Seeding 10 highly premium products per boutique storefront (200 Total)...');
    let totalProductsSeeded = 0;
    
    for (let i = 0; i < createdShops.length; i++) {
      const shop = createdShops[i];
      const seller = createdSellers[i];
      
      const shopProducts = generateProductsForShop(shop, seller, categoryMap);
      await Product.insertMany(shopProducts);
      totalProductsSeeded += shopProducts.length;
    }
    console.log(`   ✔ Successfully populated ${totalProductsSeeded} active products.`);

    // 7. Write Credentials and Export Lists
    console.log('📝 Compiling and writing boutique credentials files...');
    const credentials = createdSellers.map((seller, index) => {
      const shop = createdShops[index];
      // Lookup the raw, unhashed password from the generator
      const rawSeller = rawSellers.find(rs => rs.email === seller.email);
      return {
        name: seller.name,
        email: seller.email,
        password: rawSeller ? rawSeller.password : 'PasswordMatched',
        shopName: shop.name,
        phone: seller.phone
      };
    });

    const jsonPath = path.join(__dirname, 'generated-sellers.json');
    const txtPath = path.join(__dirname, 'generated-sellers.txt');

    // JSON file write
    fs.writeFileSync(jsonPath, JSON.stringify(credentials, null, 2), 'utf-8');

    // TXT file write
    let txtContent = `================================================================================\n`;
    txtContent += `NEARBYDRESS SEEDED MARKETPLACE MERCHANTS (20 ACCOUNTS)\n`;
    txtContent += `Base Location: ${BASE_LOCATION.city}, ${BASE_LOCATION.state} (${BASE_LOCATION.pincode})\n`;
    txtContent += `Generated At: ${new Date().toISOString()}\n`;
    txtContent += `================================================================================\n\n`;

    credentials.forEach((c, idx) => {
      txtContent += `${idx + 1}. MERCHANT DETAILS\n`;
      txtContent += `   Name     : ${c.name}\n`;
      txtContent += `   Email    : ${c.email}\n`;
      txtContent += `   Password : ${c.password}\n`;
      txtContent += `   Boutique : ${c.shopName}\n`;
      txtContent += `   Phone    : ${c.phone}\n`;
      txtContent += `--------------------------------------------------------------------------------\n`;
    });

    fs.writeFileSync(txtPath, txtContent, 'utf-8');
    
    console.log(`   - Credentials JSON successfully written to: src/seeds/generated-sellers.json`);
    console.log(`   - Credentials TXT successfully written to: src/seeds/generated-sellers.txt`);

    console.log('\n🌟 Seeding Operation Completed Successfully!');
    console.log('✔ Sellers created successfully.');
    console.log('✔ Shops created successfully.');
    console.log('✔ Products created successfully.');
    console.log('✔ Credentials exported successfully.');
    console.log('✔ Localized Marketplace Ready! 🚀\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding process encountered a fatal error:', err);
    process.exit(1);
  }
};

runSeeder();
