const Shop = require('../../../models/Shop');
const Product = require('../../../models/Product');
const AppError = require('../../../utils/AppError');
const { getPagination } = require('../../../utils/pagination');

// ─── Dashboard Stats ────────────────────────────────────────────────────────
const getDashboardStats = async (userId) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) {
    return { totalProducts: 0, totalViews: 0, recentProducts: [] };
  }

  const [totalProducts, recentProducts] = await Promise.all([
    Product.countDocuments({ shop: shop._id }),
    Product.find({ shop: shop._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price discountPrice images stock isActive createdAt'),
  ]);

  // Aggregate views from Cloudinary could go here, for now mocked at 0 or aggregate field if available
  return {
    totalProducts,
    totalViews: totalProducts * 12, // Placeholder
    recentProducts,
  };
};

// ─── Profile (Shop) ─────────────────────────────────────────────────────────
const getSellerProfile = async (userId) => {
  const shop = await Shop.findOne({ owner: userId });
  return shop || null;
};

const upsertSellerProfile = async (userId, data, files) => {
  let shop = await Shop.findOne({ owner: userId });

  let parsedLocation;
  if (data.location) {
    try {
      parsedLocation = typeof data.location === 'string' ? JSON.parse(data.location) : data.location;
    } catch (_) {}
  }

  const shopData = {
    name: data.name || data.shopName,
    whatsappNumber: data.whatsappNumber || data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    shopNo: data.shopNo,
    description: data.description,
    openingTime: data.openingTime,
    closingTime: data.closingTime,
    owner: userId,
  };

  if (parsedLocation && parsedLocation.coordinates && parsedLocation.coordinates.length === 2) {
    shopData.location = parsedLocation;
  }

  if (files?.logo?.[0]) shopData.logo = files.logo[0].path;
  if (files?.coverImage?.[0]) shopData.coverImage = files.coverImage[0].path;

  if (shop) {
    // Update existing
    shop = await Shop.findByIdAndUpdate(shop._id, shopData, { new: true, runValidators: true });
  } else {
    // Create new (will be 'pending' by default)
    shop = await Shop.create(shopData);
  }

  return shop;
};

// ─── Products ───────────────────────────────────────────────────────────────
const getSellerProducts = async (userId, query) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) {
    return { products: [], page: 1, limit: 10, total: 0, totalPages: 0 };
  }

  const { page, limit, skip } = getPagination(query);
  const filter = { shop: shop._id };

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return { products, page, limit, total, totalPages: Math.ceil(total / limit) };
};


module.exports = {
  getDashboardStats,
  getSellerProfile,
  upsertSellerProfile,
  getSellerProducts,
};
