/**
 * Used by: admin only
 * Purpose: admin request/response handlers — stats, users, sellers, shops, products
 */
const adminService = require('../services/admin.service');
const { getAdminShops, updateShopStatus } = require('../../seller/controllers/shop.controller');
const { getAdminProducts } = require('../../seller/controllers/product.controller');
const { sendSuccess, sendPaginated } = require('../../../utils/response');

// Re-export these for use in routes (they already handle res directly)
module.exports.getAdminShops = getAdminShops;
module.exports.updateShopStatus = updateShopStatus;
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
