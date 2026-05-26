/**
 * locationService.js
 * Thin API wrapper for all location-related backend calls
 */

import API from '../../../core/api/client';

// ── Geocoding ─────────────────────────────────────────────────────────────────

/**
 * Reverse geocode coordinates → address object
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ pincode, city, state, country, formattedAddress, lat, lng }>}
 */
export const reverseGeocode = (lat, lng) =>
  API.get('/location/reverse', { params: { lat, lng } }).then((r) => r.data.data);

/**
 * Forward geocode an address string → coordinates
 * @param {string} address
 * @returns {Promise<{ lat, lng, city, state, pincode, formattedAddress }>}
 */
export const forwardGeocode = (address) =>
  API.get('/location/forward', { params: { address } }).then((r) => r.data.data);

// ── Nearby shops ─────────────────────────────────────────────────────────────

/**
 * Fetch shops near a location
 * @param {{ lat, lng, radiusKm?, page?, limit? }} params
 */
export const getNearbyShops = (params) =>
  API.get('/location/nearby', { params }).then((r) => r.data);

// ── Shop location update (seller / admin) ────────────────────────────────────

/**
 * Set a shop's geo-coordinates
 * @param {string} shopId
 * @param {{ lat: number, lng: number, serviceRadiusKm?: number }} payload
 */
export const setShopLocation = (shopId, payload) =>
  API.patch(`/location/shops/${shopId}`, payload).then((r) => r.data);

/**
 * Fetch optimized nearby discovery feed containing shops, products, featured, and trending lists
 * @param {{ lat?: number, lng?: number, radiusKm?: number, pincode?: string }} params
 */
export const getNearbyDiscoveryFeed = (params) =>
  API.get('/location/discovery-feed', { params }).then((r) => r.data.data);
