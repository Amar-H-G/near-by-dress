const sellerService = require('../services/seller.service');
const { sendResponse } = require('../../../utils/response');

exports.getDashboard = async (req, res) => {
  const stats = await sellerService.getDashboardStats(req.user._id);
  sendResponse(res, 200, stats);
};

exports.getProfile = async (req, res) => {
  const profile = await sellerService.getSellerProfile(req.user._id);
  sendResponse(res, 200, { profile });
};

exports.updateProfile = async (req, res) => {
  const profile = await sellerService.upsertSellerProfile(req.user._id, req.body, req.files);
  sendResponse(res, 200, { profile, message: 'Profile updated successfully' });
};

exports.getProducts = async (req, res) => {
  const result = await sellerService.getSellerProducts(req.user._id, req.query);
  sendResponse(res, 200, result);
};

exports.addProduct = async (req, res) => {
  const product = await sellerService.addSellerProduct(req.user._id, req.body, req.files);
  sendResponse(res, 201, { product, message: 'Product added successfully' });
};

exports.updateProduct = async (req, res) => {
  const product = await sellerService.updateSellerProduct(req.user._id, req.params.id, req.body, req.files);
  sendResponse(res, 200, { product, message: 'Product updated successfully' });
};

exports.deleteProduct = async (req, res) => {
  await sellerService.deleteSellerProduct(req.user._id, req.params.id);
  sendResponse(res, 200, null, 'Product deleted successfully');
};
