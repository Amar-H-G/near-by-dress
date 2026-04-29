const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate, shopStatusSchema } = require('../middleware/validate');
const { getAdminShops, updateShopStatus } = require('../controllers/shop.controller');
const { getAdminProducts } = require('../controllers/product.controller');
const User = require('../models/User');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { getPagination } = require('../utils/pagination');
const AppError = require('../utils/AppError');

// All admin routes are protected
router.use(authenticate, authorize('admin'));

// ─── Shop Management ─────────────────────────────────────────────────────────
router.get('/shops', getAdminShops);
router.patch('/shops/:id/status', validate(shopStatusSchema), updateShopStatus);

// ─── Product Management ──────────────────────────────────────────────────────
router.get('/products', getAdminProducts);

// ─── Sellers (shop owners with shop info) ────────────────────────────────────
router.get('/sellers', async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, status } = req.query;
  const filter = { role: 'shop_owner' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const Shop = require('../models/Shop');
  const [sellers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  // Attach shop info to each seller
  const sellerIds = sellers.map((s) => s._id);
  const shopQuery = { owner: { $in: sellerIds } };
  if (status) shopQuery.status = status;
  const shops = await Shop.find(shopQuery).lean();
  const shopMap = {};
  shops.forEach((sh) => { shopMap[sh.owner.toString()] = sh; });
  const enriched = sellers.map((s) => ({ ...s, shop: shopMap[s._id.toString()] || null }));
  return sendPaginated(res, enriched, page, limit, total);
});

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, search } = req.query;
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
  return sendPaginated(res, users, page, limit, total);
});

// Delete a user (cannot delete another admin)
router.delete('/users/:id', async (req, res, next) => {
  const target = await User.findById(req.params.id);
  if (!target) return next(new AppError('User not found', 404));
  if (target.role === 'admin') return next(new AppError('Cannot delete an admin account', 403));
  await User.findByIdAndDelete(req.params.id);
  return sendSuccess(res, {}, 'User deleted successfully');
});

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  const Shop = require('../models/Shop');
  const Product = require('../models/Product');
  const [totalUsers, totalShops, pendingShops, approvedShops, totalProducts, totalSellers] = await Promise.all([
    User.countDocuments(),
    Shop.countDocuments(),
    Shop.countDocuments({ status: 'pending' }),
    Shop.countDocuments({ status: 'approved' }),
    Product.countDocuments(),
    User.countDocuments({ role: 'shop_owner' }),
  ]);
  return sendSuccess(res, {
    data: { totalUsers, totalShops, pendingShops, approvedShops, totalProducts, totalSellers },
  });
});

module.exports = router;
