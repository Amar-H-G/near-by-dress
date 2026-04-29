/**
 * Used by: admin only
 * Purpose: admin API routes — all protected by JWT + admin role
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const { validate, shopStatusSchema } = require('../../../middleware/validate');
const ctrl = require('../controllers/admin.controller');

const settingsCtrl = require('../controllers/settings.controller');
const categoryCtrl = require('../controllers/category.controller');
const filterCtrl = require('../controllers/filter.controller');
const { shopUpload } = require('../../../middleware/upload');

// All routes require valid JWT with role === 'admin'
router.use(authenticate, authorize('admin'));

// ── Global Settings & Categories ────────────────────────────────────────────
router.put('/settings', shopUpload.fields([{ name: 'logo', maxCount: 1 }]), settingsCtrl.updateSettings);
router.get('/categories', categoryCtrl.getAdminCategories);
router.post('/categories', categoryCtrl.createCategory);
router.put('/categories/:id', categoryCtrl.updateCategory);
router.delete('/categories/:id', categoryCtrl.deleteCategory);

// ── Filter Management ─────────────────────────────────────────────────────────
router.get('/filters', filterCtrl.getAdminFilters);
router.post('/filters', filterCtrl.createFilter);
router.put('/filters/:id', filterCtrl.updateFilter);
router.patch('/filters/:id/toggle', filterCtrl.toggleFilter);
router.delete('/filters/:id', filterCtrl.deleteFilter);

// ── Dashboard Stats ─────────────────────────────────────────────────────────
router.get('/stats', ctrl.getStats);

// ── User Management ─────────────────────────────────────────────────────────
router.get('/users', ctrl.getUsers);
router.delete('/users/:id', ctrl.deleteUser);

// ── Seller Management ────────────────────────────────────────────────────────
router.get('/sellers', ctrl.getSellers);

// ── Shop Management ─────────────────────────────────────────────────────────
router.get('/shops', ctrl.getAdminShops);
router.patch('/shops/:id/status', validate(shopStatusSchema), ctrl.updateShopStatus);

// ── Product Management ───────────────────────────────────────────────────────
router.get('/products', ctrl.getAdminProducts);
router.put('/products/:id/feature', ctrl.toggleProductFeature);

module.exports = router;
