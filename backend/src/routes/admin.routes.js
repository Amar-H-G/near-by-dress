const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate, shopStatusSchema } = require('../middleware/validate');
const { getAdminShops, updateShopStatus } = require('../controllers/shop.controller');
const { getAdminProducts } = require('../controllers/product.controller');
const User = require('../models/User');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { getPagination } = require('../utils/pagination');

// All admin routes are protected
router.use(authenticate, authorize('admin'));

// Shop management
router.get('/shops', getAdminShops);
router.patch('/shops/:id/status', validate(shopStatusSchema), updateShopStatus);

// Product management
router.get('/products', getAdminProducts);

// User management
router.get('/users', async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return sendPaginated(res, users, page, limit, total);
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  const Shop = require('../models/Shop');
  const Product = require('../models/Product');
  const [totalUsers, totalShops, pendingShops, approvedShops, totalProducts] = await Promise.all([
    User.countDocuments(),
    Shop.countDocuments(),
    Shop.countDocuments({ status: 'pending' }),
    Shop.countDocuments({ status: 'approved' }),
    Product.countDocuments(),
  ]);
  return sendSuccess(res, {
    data: { totalUsers, totalShops, pendingShops, approvedShops, totalProducts },
  });
});

module.exports = router;
