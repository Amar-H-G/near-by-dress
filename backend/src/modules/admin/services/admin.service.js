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

module.exports = { getPlatformStats, getSellers, getUsers, deleteUser };
