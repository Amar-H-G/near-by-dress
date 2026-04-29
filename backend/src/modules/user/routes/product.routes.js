/**
 * Used by: user (public read), seller (write), admin (write)
 * Purpose: product API routes — public read is open; write requires auth + role
 */
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../../seller/controllers/product.controller');
const { authenticate, authorize } = require('../../../middleware/auth');
const { validate, createProductSchema, updateProductSchema } = require('../../../middleware/validate');
const { productUpload } = require('../../../middleware/upload');

// ── Public ─────────────────────────────────────────────────────────────────
router.get('/', getProducts);
router.get('/:id', getProduct);

// ── Seller + Admin write ────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('shop_owner', 'admin'),
  productUpload.fields([{ name: 'images', maxCount: 5 }]),
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('shop_owner', 'admin'),
  productUpload.fields([{ name: 'images', maxCount: 5 }]),
  validate(updateProductSchema),
  updateProduct
);

router.delete('/:id', authenticate, authorize('shop_owner', 'admin'), deleteProduct);

module.exports = router;
