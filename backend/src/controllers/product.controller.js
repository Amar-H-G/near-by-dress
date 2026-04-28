const productService = require('../services/product.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const getProducts = async (req, res) => {
  const result = await productService.getProducts(req.query);
  return sendPaginated(res, result.products, result.page, result.limit, result.total);
};

const getAdminProducts = async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  return sendPaginated(res, result.products, result.page, result.limit, result.total);
};

const getProductsByShop = async (req, res) => {
  const result = await productService.getProductsByShop(req.params.shopId, req.query);
  return sendPaginated(res, result.products, result.page, result.limit, result.total);
};

const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, { data: product });
};

const createProduct = async (req, res) => {
  const product = await productService.createProduct(
    req.user._id,
    req.user.role,
    req.body,
    req.files
  );
  return sendSuccess(res, { data: product }, 'Product created successfully', 201);
};

const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.user._id,
    req.user.role,
    req.body,
    req.files
  );
  return sendSuccess(res, { data: product }, 'Product updated successfully');
};

const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user._id, req.user.role);
  return sendSuccess(res, {}, 'Product deleted successfully');
};

module.exports = {
  getProducts,
  getAdminProducts,
  getProductsByShop,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
