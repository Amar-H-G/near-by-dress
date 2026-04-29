/**
 * Used by: seller, admin
 * Purpose: product request/response handlers — delegates all logic to product.service
 */
const productService = require('../services/product.service');
const { sendSuccess, sendPaginated } = require('../../../utils/response');

// ─── Public / User ───────────────────────────────────────────────────────────

/** GET /api/products — public list with filters */
const getProducts = async (req, res) => {
  const result = await productService.getProducts(req.query);
  return sendPaginated(res, result.products, result.page, result.limit, result.total);
};

/** GET /api/shops/:shopId/products — public products by shop */
const getProductsByShop = async (req, res) => {
  const result = await productService.getProductsByShop(req.params.shopId, req.query);
  return sendPaginated(res, result.products, result.page, result.limit, result.total);
};

/** GET /api/products/:id — single product detail */
const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, { data: product });
};

// ─── Admin ───────────────────────────────────────────────────────────────────

/** GET /api/admin/products — all products for admin view */
const getAdminProducts = async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  return sendPaginated(res, result.products, result.page, result.limit, result.total);
};

// ─── Seller / Admin Write ─────────────────────────────────────────────────────

/** POST /api/products — create product (seller or admin) */
const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.user._id, req.user.role, req.body, req.files);
  return sendSuccess(res, { data: product }, 'Product created successfully', 201);
};

/** PUT /api/products/:id — update product (seller owns it, or admin) */
const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.user._id, req.user.role, req.body, req.files);
  return sendSuccess(res, { data: product }, 'Product updated successfully');
};

/** DELETE /api/products/:id — delete product (seller owns it, or admin) */
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
