const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/seller.controller');
const { authenticate, authorize } = require('../../../middleware/auth');
const { shopUpload, productUpload } = require('../../../middleware/upload');

// Require authentication and 'shop_owner' role for all seller routes
router.use(authenticate);
router.use(authorize('shop_owner'));

// Dashboard Stats
router.get('/dashboard', sellerController.getDashboard);

// Profile (Shop)
router.get('/profile', sellerController.getProfile);
router.put('/profile', shopUpload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), sellerController.updateProfile);

// Products
router.route('/products')
  .get(sellerController.getProducts)
  .post(productUpload.fields([{ name: 'images', maxCount: 5 }]), sellerController.addProduct);

router.route('/products/:id')
  .put(productUpload.fields([{ name: 'images', maxCount: 5 }]), sellerController.updateProduct)
  .delete(sellerController.deleteProduct);

module.exports = router;
