const Shop = require('../models/Shop');
const AppError = require('../utils/AppError');
const { getPagination } = require('../utils/pagination');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

const invalidateShopCache = async () => {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys('shops:*');
    if (keys.length) await redis.del(...keys);
  } catch (_) {}
};

// Public: list approved shops
const getApprovedShops = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { city, category, search } = query;

  const cacheKey = `shops:page:${page}:limit:${limit}:city:${city || ''}:cat:${category || ''}:q:${search || ''}`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const filter = { status: 'approved', isActive: true };
  if (city) filter.city = city.toLowerCase();
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [shops, total] = await Promise.all([
    Shop.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Shop.countDocuments(filter),
  ]);

  const result = { shops, page, limit, total, totalPages: Math.ceil(total / limit) };

  if (redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    } catch (_) {}
  }

  return result;
};

// Admin: list all shops
const getAllShops = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { status, city } = query;

  const filter = {};
  if (status) filter.status = status;
  if (city) filter.city = city.toLowerCase();

  const [shops, total] = await Promise.all([
    Shop.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Shop.countDocuments(filter),
  ]);

  return { shops, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getShopById = async (id) => {
  const redis = getRedis();
  const cacheKey = `shop:${id}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const shop = await Shop.findById(id).populate('owner', 'name email phone');
  if (!shop) throw new AppError('Shop not found', 404);

  if (redis) {
    try {
      await redis.setex(cacheKey, 600, JSON.stringify(shop));
    } catch (_) {}
  }

  return shop;
};

const createShop = async (ownerId, data, files) => {
  const existing = await Shop.findOne({ owner: ownerId });
  if (existing) throw new AppError('You already have a registered shop', 400);

  const shopData = { ...data, owner: ownerId };

  if (files?.logo?.[0]) shopData.logo = files.logo[0].path;
  if (files?.coverImage?.[0]) shopData.coverImage = files.coverImage[0].path;

  const shop = await Shop.create(shopData);
  await invalidateShopCache();
  return shop;
};

const updateShop = async (shopId, userId, role, data, files) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new AppError('Shop not found', 404);

  if (role !== 'admin' && shop.owner.toString() !== userId.toString()) {
    throw new AppError('Not authorized to update this shop', 403);
  }

  if (files?.logo?.[0]) data.logo = files.logo[0].path;
  if (files?.coverImage?.[0]) data.coverImage = files.coverImage[0].path;

  const updated = await Shop.findByIdAndUpdate(shopId, data, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name email phone');

  await invalidateShopCache();
  const redis = getRedis();
  if (redis) {
    try { await redis.del(`shop:${shopId}`); } catch (_) {}
  }

  return updated;
};

const updateShopStatus = async (shopId, { status, rejectionReason }) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new AppError('Shop not found', 404);

  shop.status = status;
  if (status === 'rejected' && rejectionReason) {
    shop.rejectionReason = rejectionReason;
  } else {
    shop.rejectionReason = null;
  }
  await shop.save();

  await invalidateShopCache();
  const redis = getRedis();
  if (redis) {
    try { await redis.del(`shop:${shopId}`); } catch (_) {}
  }

  return shop;
};

const getOwnerShop = async (ownerId) => {
  const shop = await Shop.findOne({ owner: ownerId }).populate('owner', 'name email');
  if (!shop) throw new AppError('No shop found for this account', 404);
  return shop;
};

module.exports = {
  getApprovedShops,
  getAllShops,
  getShopById,
  createShop,
  updateShop,
  updateShopStatus,
  getOwnerShop,
};
