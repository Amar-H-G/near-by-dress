// [ignoring loop detection]
/**
 * cacheKeys.js
 * Centralized registry and generator system for all Redis cache keys.
 * Ensures consistent namespace segmentation, making targeted invalidation simple.
 */

const KEYS = {
  SETTINGS: 'settings:global',
  CATEGORIES: 'categories:list',
  FILTERS: 'filters:list',
  HOMEPAGE: 'homepage:collections'
};

const getShopListKey = (query) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const status = query.status || 'approved';
  const city = query.city || 'all';
  const pincode = query.pincode || 'all';
  const search = query.search || 'none';
  return `shops:list:p_${page}:l_${limit}:s_${status}:c_${city}:pin_${pincode}:q_${search}`;
};

const getProductDetailKey = (productId) => {
  return `products:detail:${productId}`;
};

const getNearbyShopsKey = (lat, lng, radius, pincode) => {
  // Rounded coordinates to 3 decimals (~110 meters precision) to allow effective caching
  const roundLat = Number(lat).toFixed(3);
  const roundLng = Number(lng).toFixed(3);
  return `shops:nearby:lat_${roundLat}:lng_${roundLng}:r_${radius}:pin_${pincode || 'none'}`;
};

const getNearbyProductsKey = (lat, lng, radius, pincode, page = 1, limit = 12) => {
  const roundLat = Number(lat).toFixed(3);
  const roundLng = Number(lng).toFixed(3);
  return `products:nearby:lat_${roundLat}:lng_${roundLng}:r_${radius}:pin_${pincode || 'none'}:p_${page}:l_${limit}`;
};

module.exports = {
  KEYS,
  getShopListKey,
  getProductDetailKey,
  getNearbyShopsKey,
  getNearbyProductsKey
};
