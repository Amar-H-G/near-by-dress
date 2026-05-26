/**
 * Used by: admin, user, seller (shared domain service)
 * Purpose: product business logic — CRUD, caching, role-based access enforcement
 */
const Product = require('../../../models/Product');
const Shop = require('../../../models/Shop');
const mongoose = require('mongoose');
const AppError = require('../../../utils/AppError');
const { getPagination } = require('../../../utils/pagination');
const { getRedis } = require('../../../config/redis');
const cloudinary = require('../../../config/cloudinary');

const CACHE_TTL = 300; // 5 minutes

/** Invalidate all product list cache keys */
const invalidateProductCache = async () => {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys('products:*');
    if (keys.length) await redis.del(...keys);
  } catch (_) {}
};

// ─── Public / User ───────────────────────────────────────────────────────────

/** Public: list active products with optional filters + Redis cache */
const getProducts = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { category, shop, search, minPrice, maxPrice, lat, lng, radiusKm, pincode } = query;

  const cacheKey = `products:page:${page}:limit:${limit}:cat:${category || ''}:shop:${shop || ''}:q:${search || ''}:min:${minPrice || ''}:max:${maxPrice || ''}:lat:${lat || ''}:lng:${lng || ''}:rad:${radiusKm || ''}:pin:${pincode || ''}`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const filter = { isActive: true };
  if (category) {
    const Category = require('../../../models/Category');
    const foundCat = await Category.findOne({ 
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(category) ? category : null },
        { slug: category }
      ]
    });
    if (foundCat) filter.category = foundCat._id;
    else filter.category = null; // Forces empty result if category doesn't exist
  }

  // Location filter overrides (optimized sub-queries using indexes)
  if (shop) {
    filter.shop = shop;
  } else if (lat && lng) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedRadius = parseFloat(radiusKm) || 15; // Standard 15 KM!
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      const radiusMeters = parsedRadius * 1000;
      const nearbyShops = await Shop.find({
        status: 'approved',
        isActive: true,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parsedLng, parsedLat] },
            $maxDistance: radiusMeters,
          },
        },
      }).select('_id');
      const shopIds = nearbyShops.map(s => s._id);
      filter.shop = { $in: shopIds };
    }
  } else if (pincode) {
    const pincodeShops = await Shop.find({
      status: 'approved',
      isActive: true,
      pincode: pincode
    }).select('_id');
    const shopIds = pincodeShops.map(s => s._id);
    filter.shop = { $in: shopIds };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) filter.$text = { $search: search };

  // Dynamic Filters Integration
  const standardParams = ['page', 'limit', 'category', 'shop', 'search', 'minPrice', 'maxPrice', 'sort', 'lat', 'lng', 'radiusKm', 'pincode'];
  Object.keys(query).forEach(key => {
    if (!standardParams.includes(key)) {
      const val = query[key];
      if (!val) return;

      // Map common singular keys to plural schema fields if needed
      let dbKey = key;
      if (key === 'color') dbKey = 'colors';
      if (key === 'size') dbKey = 'sizes';

      // Handle multi-select (comma separated)
      if (typeof val === 'string' && val.includes(',')) {
        filter[dbKey] = { $in: val.split(',') };
      } else {
        filter[dbKey] = val;
      }
    }
  });

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate({ path: 'shop', select: 'name city whatsappNumber logo status' })
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  const result = { products, page, limit, total, totalPages: Math.ceil(total / limit) };

  if (redis) {
    try { await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)); } catch (_) {}
  }

  return result;
};

/** Public: get products belonging to a specific shop */
const getProductsByShop = async (shopId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { shop: shopId, isActive: true };
  const [products, total] = await Promise.all([
    Product.find(filter).populate('addedBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { products, page, limit, total, totalPages: Math.ceil(total / limit) };
};

/** Public/Shared: get single product by ID with Redis cache */
const getProductById = async (id) => {
  const redis = getRedis();
  const cacheKey = `product:${id}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const product = await Product.findById(id)
    .populate({ path: 'shop', select: 'name city whatsappNumber logo address' })
    .populate('addedBy', 'name');

  if (!product) throw new AppError('Product not found', 404);

  if (redis) {
    try { await redis.setex(cacheKey, 600, JSON.stringify(product)); } catch (_) {}
  }

  return product;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

/** Admin: get ALL products (including inactive) */
const getAllProducts = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { category, shop, isActive } = query;

  const filter = {};
  if (category) {
    const Category = require('../../../models/Category');
    const foundCat = await Category.findOne({ 
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(category) ? category : null },
        { slug: category }
      ]
    });
    if (foundCat) filter.category = foundCat._id;
    else filter.category = null;
  }
  if (shop) filter.shop = shop;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate({ path: 'shop', select: 'name city' })
      .populate('addedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { products, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// ─── Seller / Admin Write ─────────────────────────────────────────────────────

/** Create a product — role-enforced shop ownership check */
const createProduct = async (userId, userRole, data, files) => {
  let shopId = data.shop;

  if (userRole === 'shop_owner') {
    // For sellers, auto-assign their own shop
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) throw new AppError('You do not have a shop registered', 403);
    if (shop.status !== 'approved') throw new AppError('Your shop must be approved to add products', 403);
    shopId = shop._id;
  } else if (userRole === 'admin') {
    // For admins, accept shopId from data if provided, or allow system product
    if (shopId) {
      const shop = await Shop.findById(shopId);
      if (!shop) throw new AppError('Target shop not found', 404);
    }
  } else {
    throw new AppError('Not authorized to create products', 403);
  }

  const productData = { 
    ...data, 
    shop: shopId, 
    addedBy: userId,
    isSystemProduct: userRole === 'admin' && !shopId 
  };

  if (files?.images?.length) {
    productData.images = files.images.map((f) => ({
      url: f.path,
      public_id: f.filename,
    }));
  }

  const product = await Product.create(productData);
  await invalidateProductCache();
  return product;
};

/** Update a product — role-enforced ownership check */
const updateProduct = async (productId, userId, userRole, data, files) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  if (userRole === 'shop_owner') {
    const shop = await Shop.findOne({ _id: product.shop, owner: userId });
    if (!shop) throw new AppError('Not authorized to update this product', 403);
  }

  const { removedImages, existingImages, ...updateData } = data;

  // 1. Delete from Cloudinary
  if (removedImages) {
    const idsToDelete = Array.isArray(removedImages) ? removedImages : [removedImages];
    for (const public_id of idsToDelete) {
      if (public_id) {
        await cloudinary.uploader.destroy(public_id).catch(err => {
          console.error(`Failed to delete image ${public_id} from Cloudinary:`, err);
        });
      }
    }
  }

  // 2. Prepare images array
  let updatedImages = [];

  // Add existing images to keep
  if (existingImages) {
    const existing = Array.isArray(existingImages) ? existingImages : [existingImages];
    updatedImages = existing
      .filter(img => img && img !== '')
      .map(img => {
        try {
          const parsed = typeof img === 'string' ? JSON.parse(img) : img;
          if (typeof parsed === 'string') return { url: parsed, public_id: 'legacy' };
          return parsed;
        } catch (e) {
          return typeof img === 'string' && img.startsWith('http') ? { url: img, public_id: 'legacy' } : null;
        }
      })
      .filter(Boolean);
  }

  // Add new uploaded images
  if (files?.images?.length) {
    const newImages = files.images.map((f) => ({
      url: f.path,
      public_id: f.filename,
    }));
    updatedImages = [...updatedImages, ...newImages];
  }

  updateData.images = updatedImages;

  const updated = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true })
    .populate('shop', 'name city')
    .populate('addedBy', 'name');

  await invalidateProductCache();
  const redis = getRedis();
  if (redis) { try { await redis.del(`product:${productId}`); } catch (_) {} }

  return updated;
};

/** Delete a product — role-enforced ownership check */
const deleteProduct = async (productId, userId, userRole) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  if (userRole === 'shop_owner') {
    const shop = await Shop.findOne({ _id: product.shop, owner: userId });
    if (!shop) throw new AppError('Not authorized to delete this product', 403);
  }

  await product.deleteOne();
  await invalidateProductCache();
  const redis = getRedis();
  if (redis) { try { await redis.del(`product:${productId}`); } catch (_) {} }
};

module.exports = {
  getProducts,
  getAllProducts,
  getProductsByShop,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
