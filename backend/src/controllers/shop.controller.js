const shopService = require('../services/shop.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const getShops = async (req, res) => {
  const result = await shopService.getApprovedShops(req.query);
  return sendPaginated(res, result.shops, result.page, result.limit, result.total);
};

const getAdminShops = async (req, res) => {
  const result = await shopService.getAllShops(req.query);
  return sendPaginated(res, result.shops, result.page, result.limit, result.total);
};

const getShop = async (req, res) => {
  const shop = await shopService.getShopById(req.params.id);
  return sendSuccess(res, { data: shop });
};

const createShop = async (req, res) => {
  const shop = await shopService.createShop(req.user._id, req.body, req.files);
  return sendSuccess(res, { data: shop }, 'Shop created. Awaiting admin approval.', 201);
};

const updateShop = async (req, res) => {
  const shop = await shopService.updateShop(
    req.params.id,
    req.user._id,
    req.user.role,
    req.body,
    req.files
  );
  return sendSuccess(res, { data: shop }, 'Shop updated');
};

const updateShopStatus = async (req, res) => {
  const shop = await shopService.updateShopStatus(req.params.id, req.body);
  return sendSuccess(res, { data: shop }, `Shop ${req.body.status} successfully`);
};

const getMyShop = async (req, res) => {
  const shop = await shopService.getOwnerShop(req.user._id);
  return sendSuccess(res, { data: shop });
};

module.exports = { getShops, getAdminShops, getShop, createShop, updateShop, updateShopStatus, getMyShop };
