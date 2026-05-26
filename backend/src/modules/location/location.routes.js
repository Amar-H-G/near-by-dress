/**
 * location.routes.js
 * Mounted at: /api/location  (see server.js)
 *
 * Public:
 *   GET  /api/location/reverse?lat=&lng=
 *   GET  /api/location/forward?address=
 *   GET  /api/location/nearby?lat=&lng=&radiusKm=&page=&limit=
 *
 * Protected (seller or admin):
 *   PATCH /api/location/shops/:shopId   { lat, lng, serviceRadiusKm? }
 */

const express = require('express');
const router = express.Router();

const ctrl = require('./location.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const {
  setShopLocationSchema,
  nearbyQuerySchema,
  discoveryQuerySchema,
  validateBody,
  validateQuery,
} = require('./location.validation');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/reverse', ctrl.reverseGeocode);
router.get('/forward', ctrl.forwardGeocode);
router.get('/nearby', validateQuery(nearbyQuerySchema), ctrl.getNearbyShops);
router.get('/discovery-feed', validateQuery(discoveryQuerySchema), ctrl.getNearbyDiscoveryFeed);

// ── Protected ─────────────────────────────────────────────────────────────────
router.patch(
  '/shops/:shopId',
  authenticate,
  authorize('shop_owner', 'admin'),
  validateBody(setShopLocationSchema),
  ctrl.setShopLocation
);

module.exports = router;
