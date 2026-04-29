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

// ── Public ─────────────────────────────────────────────────────────────────
router.get('/', getShops);
router.get('/my', authenticate, authorize('shop_owner'), getMyShop);
router.get('/:id', getShop);
router.get('/:shopId/products', getProductsByShop);

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
