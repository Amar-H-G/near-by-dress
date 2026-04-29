/**
 * Used by: admin only
 * Purpose: admin-specific business logic — platform stats, seller listing, user deletion
 */
const User = require('../../../models/User');
const Shop = require('../../../models/Shop');
const Product = require('../../../models/Product');
const AppError = require('../../../utils/AppError');
const { getPagination } = require('../../../utils/pagination');

/**
 * Aggregate platform statistics for the admin dashboard
 */
const getPlatformStats = async () => {
  const [totalUsers, totalShops, pendingShops, approvedShops, rejectedShops, totalProducts, totalSellers] =
    await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      Shop.countDocuments({ status: 'pending' }),
      Shop.countDocuments({ status: 'approved' }),
      Shop.countDocuments({ status: 'rejected' }),
      Product.countDocuments(),
      User.countDocuments({ role: 'shop_owner' }),
    ]);

  return { totalUsers, totalShops, pendingShops, approvedShops, rejectedShops, totalProducts, totalSellers };
};

/**
 * List all sellers (shop_owner role) enriched with their shop data
 */
const getSellers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { search, status } = query;

  const filter = { role: 'shop_owner' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [sellers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  const sellerIds = sellers.map((s) => s._id);
  const shopQuery = { owner: { $in: sellerIds } };
  if (status) shopQuery.status = status;

  const shops = await Shop.find(shopQuery).lean();
  const shopMap = {};
  shops.forEach((sh) => { shopMap[sh.owner.toString()] = sh; });

  const enriched = sellers.map((s) => ({ ...s, shop: shopMap[s._id.toString()] || null }));
  return { sellers: enriched, page, limit, total, totalPages: Math.ceil(total / limit) };
};

/**
 * List all users with optional role + search filter
 */
const getUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { role, search } = query;

  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, page, limit, total, totalPages: Math.ceil(total / limit) };
};

/**
 * Delete a user — cannot delete another admin
 */
const deleteUser = async (userId) => {
  const target = await User.findById(userId);
  if (!target) throw new AppError('User not found', 404);
  if (target.role === 'admin') throw new AppError('Cannot delete an admin account', 403);
  await User.findByIdAndDelete(userId);
};

/**
 * Admin creates a shop + seller account directly
 */
const registerShopByAdmin = async (data) => {
  const { 
    shopName, ownerName, email, password, phone, 
    address, city, state, pincode,
    shopNo, description, openingTime, closingTime
  } = data;

  // 1. Validate email uniqueness
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new AppError('A user with this email already exists', 400);

  // 2. Create User (password hashing is handled by User model pre-save hook)
  const user = await User.create({
    name: ownerName,
    email: email.toLowerCase(),
    password,
    phone,
    role: 'shop_owner'
  });

  // 3. Create Shop linked to the new user
  const shop = await Shop.create({
    name: shopName,
    owner: user._id,
    whatsappNumber: phone,
    address,
    city,
    state,
    pincode,
    shopNo,
    description,
    openingTime,
    closingTime,
    status: 'approved',
    isActive: true
  });

  return { user, shop };
};

module.exports = { getPlatformStats, getSellers, getUsers, deleteUser, registerShopByAdmin };
