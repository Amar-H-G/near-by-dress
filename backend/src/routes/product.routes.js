const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, createProductSchema, updateProductSchema } = require('../middleware/validate');
const { productUpload } = require('../middleware/upload');

// Public
router.get('/', getProducts);
router.get('/:id', getProduct);

// Shop owner & admin
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
