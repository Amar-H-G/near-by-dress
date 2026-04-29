const sellerService = require('../services/seller.service');
const { sendSuccess } = require('../../../utils/response');

exports.getDashboard = async (req, res) => {
  const stats = await sellerService.getDashboardStats(req.user._id);
  sendSuccess(res, { data: stats });
};

exports.getProfile = async (req, res) => {
  const profile = await sellerService.getSellerProfile(req.user._id);
  sendSuccess(res, { data: { profile } });
};

exports.updateProfile = async (req, res) => {
  const profile = await sellerService.upsertSellerProfile(req.user._id, req.body, req.files);
  sendSuccess(res, { data: { profile } }, 'Profile updated successfully');
};

exports.getProducts = async (req, res) => {
  const result = await sellerService.getSellerProducts(req.user._id, req.query);
  sendSuccess(res, { data: result });
};

exports.addProduct = async (req, res) => {
  const product = await sellerService.addSellerProduct(req.user._id, req.body, req.files);
  sendSuccess(res, { data: { product } }, 'Product added successfully', 201);
};

exports.updateProduct = async (req, res) => {
  const product = await sellerService.updateSellerProduct(req.user._id, req.params.id, req.body, req.files);
  sendSuccess(res, { data: { product } }, 'Product updated successfully');
};

exports.deleteProduct = async (req, res) => {
  await sellerService.deleteSellerProduct(req.user._id, req.params.id);
  sendSuccess(res, null, 'Product deleted successfully');
};
