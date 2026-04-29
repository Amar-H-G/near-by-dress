const sellerService = require('../services/seller.service');
const { sendSuccess } = require('../../../utils/response');

const getDashboard = async (req, res) => {
  const stats = await sellerService.getDashboardStats(req.user._id);
  sendSuccess(res, { data: stats });
};

const getProfile = async (req, res) => {
  const profile = await sellerService.getSellerProfile(req.user._id);
  sendSuccess(res, { data: { profile } });
};

const updateProfile = async (req, res) => {
  const profile = await sellerService.upsertSellerProfile(req.user._id, req.body, req.files);
  sendSuccess(res, { data: { profile } }, 'Profile updated successfully');
};

const getProducts = async (req, res) => {
  const result = await sellerService.getSellerProducts(req.user._id, req.query);
  sendSuccess(res, { data: result });
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  getProducts,
};
