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

// Cache Middleware Setup
const cacheMiddleware = require('../../../core/cache/cache.middleware');
const { getNearbyProductsKey, getProductDetailKey } = require('../../../core/cache/cacheKeys');

// ── Public ─────────────────────────────────────────────────────────────────
router.get(
  '/',
  cacheMiddleware((req) => {
    const { lat, lng, radiusKm, pincode, page, limit, category, shop, search } = req.query;
    if (lat && lng) {
      return getNearbyProductsKey(lat, lng, radiusKm || 15, pincode, page || 1, limit || 12);
    }
    // Default search cache key
    return `products:list:p_${page || 1}:l_${limit || 12}:c_${category || ''}:s_${shop || ''}:q_${search || ''}`;
  }, 120), // Cache for 2 minutes (highly responsive)
  getProducts
);

router.get(
  '/:id',
  cacheMiddleware((req) => getProductDetailKey(req.params.id), 600), // Cache detail for 10 minutes
  getProduct
);

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
