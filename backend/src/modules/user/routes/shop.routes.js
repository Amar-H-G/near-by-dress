/**
 * Used by: user (public read), seller (write)
 * Purpose: shop API routes — public read is open; create/update requires seller auth
 */
const express = require('express');
const router = express.Router();
const {
  getShops,
  getShop,
  createShop,
  updateShop,
  getMyShop,
} = require('../../seller/controllers/shop.controller');
const { getProductsByShop } = require('../../seller/controllers/product.controller');
const { authenticate, authorize } = require('../../../middleware/auth');
const { validate, createShopSchema, updateShopSchema } = require('../../../middleware/validate');
const { shopUpload } = require('../../../middleware/upload');

// Cache Middleware Setup
const cacheMiddleware = require('../../../core/cache/cache.middleware');
const { getNearbyShopsKey, getShopListKey } = require('../../../core/cache/cacheKeys');

// ── Public ─────────────────────────────────────────────────────────────────
router.get(
  '/',
  cacheMiddleware((req) => {
    const { latitude, longitude, radius, pincode } = req.query;
    if (latitude && longitude) {
      return getNearbyShopsKey(latitude, longitude, radius || 15, pincode);
    }
    return getShopListKey(req.query);
  }, 120), // Cache for 2 minutes (highly responsive)
  getShops
);

router.get('/my', authenticate, authorize('shop_owner'), getMyShop);

router.get(
  '/:id',
  cacheMiddleware((req) => `shops:detail:${req.params.id}`, 600), // Cache detail for 10 minutes
  getShop
);

router.get(
  '/:shopId/products',
  cacheMiddleware((req) => `shops:products:${req.params.shopId}:p_${req.query.page || 1}:l_${req.query.limit || 10}`, 300), // Cache shop products for 5 minutes
  getProductsByShop
);

// ── Seller write ────────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('shop_owner'),
  shopUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  validate(createShopSchema),
  createShop
);

router.put(
  '/:id',
  authenticate,
  authorize('shop_owner', 'admin'),
  shopUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  validate(updateShopSchema),
  updateShop
);

module.exports = router;
