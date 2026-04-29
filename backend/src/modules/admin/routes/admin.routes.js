/**
 * Used by: admin only
 * Purpose: admin API routes — all protected by JWT + admin role
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../../middleware/auth');
const { validate, shopStatusSchema } = require('../../../middleware/validate');
const ctrl = require('../controllers/admin.controller');

// All routes require valid JWT with role === 'admin'
router.use(authenticate, authorize('admin'));

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

module.exports = router;
