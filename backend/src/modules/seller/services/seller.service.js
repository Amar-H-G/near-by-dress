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

  const shopData = {
    name: data.shopName || data.name,
    whatsappNumber: data.phone || data.whatsappNumber,
    address: data.address,
    city: data.city,
    description: data.description,
    owner: userId,
  };

  if (files?.logo?.[0]) shopData.logo = files.logo[0].path;

  if (shop) {
    // Update existing
    shop = await Shop.findByIdAndUpdate(shop._id, shopData, { new: true, runValidators: true });
  } else {
    // Create new
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

const addSellerProduct = async (userId, data, files) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) throw new AppError('Complete your shop profile first', 400);
  if (shop.status !== 'approved') throw new AppError('Shop must be approved to add products', 403);

  const productData = {
    ...data,
    shop: shop._id,
    addedBy: userId,
  };

  if (files?.images?.length) productData.images = files.images.map((f) => f.path);

  const product = await Product.create(productData);
  return product;
};

const updateSellerProduct = async (userId, productId, data, files) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) throw new AppError('Shop profile required', 400);

  const product = await Product.findOne({ _id: productId, shop: shop._id });
  if (!product) throw new AppError('Product not found or not authorized', 404);

  if (files?.images?.length) {
    data.images = [...(product.images || []), ...files.images.map((f) => f.path)];
  }

  const updated = await Product.findByIdAndUpdate(productId, data, { new: true, runValidators: true });
  return updated;
};

const deleteSellerProduct = async (userId, productId) => {
  const shop = await Shop.findOne({ owner: userId });
  if (!shop) throw new AppError('Shop profile required', 400);

  const product = await Product.findOneAndDelete({ _id: productId, shop: shop._id });
  if (!product) throw new AppError('Product not found or not authorized', 404);
  return product;
};

module.exports = {
  getDashboardStats,
  getSellerProfile,
  upsertSellerProfile,
  getSellerProducts,
  addSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
};
