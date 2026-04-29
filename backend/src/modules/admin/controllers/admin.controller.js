/**
 * Used by: admin only
 * Purpose: admin request/response handlers — stats, users, sellers, shops, products
 */
const adminService = require('../services/admin.service');
const { getAdminShops, updateShopStatus, getShop, updateShop } = require('../../seller/controllers/shop.controller');
const { getAdminProducts } = require('../../seller/controllers/product.controller');
const { sendSuccess, sendPaginated } = require('../../../utils/response');

// Re-export these for use in routes (they already handle res directly)
module.exports.getAdminShops = getAdminShops;
module.exports.updateShopStatus = updateShopStatus;
module.exports.getShop = getShop;
module.exports.updateShop = updateShop;
module.exports.getAdminProducts = getAdminProducts;

/** GET /api/admin/stats */
module.exports.getStats = async (req, res) => {
  const data = await adminService.getPlatformStats();
  return sendSuccess(res, { data });
};

/** GET /api/admin/users */
module.exports.getUsers = async (req, res) => {
  const result = await adminService.getUsers(req.query);
  return sendPaginated(res, result.users, result.page, result.limit, result.total);
};

/** DELETE /api/admin/users/:id */
module.exports.deleteUser = async (req, res) => {
  await adminService.deleteUser(req.params.id);
  return sendSuccess(res, {}, 'User deleted successfully');
};

/** GET /api/admin/sellers */
module.exports.getSellers = async (req, res) => {
  const result = await adminService.getSellers(req.query);
  return sendPaginated(res, result.sellers, result.page, result.limit, result.total);
};

/** PUT /api/admin/products/:id/feature */
module.exports.toggleProductFeature = async (req, res) => {
  const { isFeatured, isTrending } = req.body;
  const Product = require('../../../models/Product');
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: { isFeatured, isTrending } },
    { new: true, runValidators: true }
  );

  if (!product) {
    return sendSuccess(res, null, 'Product not found', 404);
  }

  return sendSuccess(res, { data: product }, 'Product feature status updated');
};
 
/** POST /api/admin/shops */
module.exports.createShop = async (req, res) => {
  const result = await adminService.registerShopByAdmin(req.body);
  return sendSuccess(res, result, 'Shop and seller account created successfully', 201);
};
