/**
 * location.controller.js
 * Used by: public (reverse geocode, nearby shops), seller (set own location), admin (set any location)
 */

const locationService = require('./location.service');
const { sendSuccess, sendPaginated } = require('../../utils/response');

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * GET /api/location/reverse?lat=&lng=
 * Converts coordinates → structured address (pincode, city, state…)
 * Used by customer browser after getting GPS coords from navigator.geolocation
 */
const reverseGeocode = async (req, res) => {
  const { lat, lng } = req.query;
  const result = await locationService.reverseGeocode(parseFloat(lat), parseFloat(lng));
  return sendSuccess(res, { data: result });
};

/**
 * GET /api/location/forward?address=
 * Converts address string → coordinates
 * Used by admin "Find on map" feature
 */
const forwardGeocode = async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ success: false, message: 'address query param is required' });
  }
  const result = await locationService.forwardGeocode(address);
  return sendSuccess(res, { data: result });
};

/**
 * GET /api/location/nearby?lat=&lng=&radiusKm=&page=&limit=
 * Returns approved shops within radius sorted by distance
 * Used by customer "shops near me" feature
 */
const getNearbyShops = async (req, res) => {
  const result = await locationService.getNearbyShops(req.query);
  return sendPaginated(res, result.shops, result.page, result.limit, result.total);
};

// ── Seller / Admin ────────────────────────────────────────────────────────────

/**
 * PATCH /api/location/shops/:shopId
 * Body: { lat, lng, serviceRadiusKm? }
 * Seller can only update their own shop; admin can update any.
 */
const setShopLocation = async (req, res) => {
  const { shopId } = req.params;
  const { lat, lng, serviceRadiusKm } = req.body;

  const result = await locationService.setShopLocation(
    shopId,
    req.user._id,
    req.user.role,
    { lat: parseFloat(lat), lng: parseFloat(lng), serviceRadiusKm: serviceRadiusKm ? parseFloat(serviceRadiusKm) : undefined }
  );

  return sendSuccess(res, { data: result.shop, geoData: result.geoData }, 'Shop location updated successfully');
};

/**
 * GET /api/location/discovery-feed?lat=&lng=&radiusKm=&pincode=
 * Returns optimized proximity feed of shops, products, featured items, and trending items.
 */
const getNearbyDiscoveryFeed = async (req, res) => {
  const result = await locationService.getNearbyDiscoveryFeed(req.query);
  return sendSuccess(res, { data: result });
};

module.exports = {
  reverseGeocode,
  forwardGeocode,
  getNearbyShops,
  setShopLocation,
  getNearbyDiscoveryFeed,
};
