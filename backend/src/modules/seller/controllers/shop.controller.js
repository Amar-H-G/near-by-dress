/**
 * Used by: seller, admin, user (public read)
 * Purpose: shop request/response handlers — delegates all logic to shop.service
 */
const shopService = require('../services/shop.service');
const { sendSuccess, sendPaginated } = require('../../../utils/response');

// ─── Public / User ───────────────────────────────────────────────────────────

/** GET /api/shops — public approved shops */
const getShops = async (req, res) => {
  const result = await shopService.getApprovedShops(req.query);
  return sendPaginated(res, result.shops, result.page, result.limit, result.total);
};

/** GET /api/shops/:id — single shop detail */
const getShop = async (req, res) => {
  const shop = await shopService.getShopById(req.params.id);
  return sendSuccess(res, { data: shop });
};

// ─── Admin ───────────────────────────────────────────────────────────────────

/** GET /api/admin/shops — all shops for admin */
const getAdminShops = async (req, res) => {
  const result = await shopService.getAllShops(req.query);
  return sendPaginated(res, result.shops, result.page, result.limit, result.total);
};

/** PATCH /api/admin/shops/:id/status — approve or reject a shop */
const updateShopStatus = async (req, res) => {
  const shop = await shopService.updateShopStatus(req.params.id, req.body);
  return sendSuccess(res, { data: shop }, `Shop ${req.body.status} successfully`);
};

// ─── Seller ───────────────────────────────────────────────────────────────────

/** GET /api/shops/my — seller fetches own shop */
const getMyShop = async (req, res) => {
  const shop = await shopService.getOwnerShop(req.user._id);
  return sendSuccess(res, { data: shop });
};

/** POST /api/shops — seller creates a new shop */
const createShop = async (req, res) => {
  const shop = await shopService.createShop(req.user._id, req.body, req.files);
  return sendSuccess(res, { data: shop }, 'Shop created. Awaiting admin approval.', 201);
};

/** PUT /api/shops/:id — seller or admin updates shop */
const updateShop = async (req, res) => {
  const shop = await shopService.updateShop(req.params.id, req.user._id, req.user.role, req.body, req.files);
  return sendSuccess(res, { data: shop }, 'Shop updated');
};

module.exports = { getShops, getAdminShops, getShop, createShop, updateShop, updateShopStatus, getMyShop };
