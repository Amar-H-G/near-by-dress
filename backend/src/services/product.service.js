const Product = require('../models/Product');
const Shop = require('../models/Shop');
const AppError = require('../utils/AppError');
const cloudinary = require('../config/cloudinary');
const { getPagination } = require('../utils/pagination');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300;

const invalidateProductCache = async () => {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys('products:*');
    if (keys.length) await redis.del(...keys);
  } catch (_) {}
};

// Public: list active products
const getProducts = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { category, shop, search, minPrice, maxPrice } = query;

  const cacheKey = `products:page:${page}:limit:${limit}:cat:${category || ''}:shop:${shop || ''}:q:${search || ''}:min:${minPrice || ''}:max:${maxPrice || ''}`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const filter = { isActive: true };
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (shop) filter.shop = shop;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) filter.$text = { $search: search };

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
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    } catch (_) {}
  }

  return result;
};

// Admin: get all products
const getAllProducts = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { category, shop, isActive } = query;

  const filter = {};
  if (category) filter.category = { $regex: category, $options: 'i' };
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

// Products by shop
const getProductsByShop = async (shopId, query) => {
  const { page, limit, skip } = getPagination(query);

  const filter = { shop: shopId, isActive: true };
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return { products, page, limit, total, totalPages: Math.ceil(total / limit) };
};

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
    try {
      await redis.setex(cacheKey, 600, JSON.stringify(product));
    } catch (_) {}
  }

  return product;
};

const createProduct = async (userId, userRole, data, files) => {
  const { shop: shopId, isSystemProduct } = data;

  // Shop owner must assign to their own shop
  if (userRole === 'shop_owner') {
    if (!shopId) throw new AppError('Shop ID is required for shop owners', 400);
    const shop = await Shop.findOne({ _id: shopId, owner: userId });
    if (!shop) throw new AppError('Shop not found or not owned by you', 403);
    if (shop.status !== 'approved') throw new AppError('Your shop must be approved to add products', 403);
  }

  // Admin can assign to any shop or create system product
  if (userRole === 'admin' && shopId) {
    const shop = await Shop.findById(shopId);
    if (!shop) throw new AppError('Target shop not found', 404);
  }

  const productData = { ...data, addedBy: userId };

  // Collect Cloudinary URLs from uploaded files
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

  const updated = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('shop', 'name city')
    .populate('addedBy', 'name');

  await invalidateProductCache();
  const redis = getRedis();
  if (redis) {
    try { await redis.del(`product:${productId}`); } catch (_) {}
  }

  return updated;
};

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
  if (redis) {
    try { await redis.del(`product:${productId}`); } catch (_) {}
  }
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
