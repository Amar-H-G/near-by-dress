/**
 * location.service.js
 * Used by: customer (nearby shops), seller (set location), admin (override location)
 * Purpose: Geo-spatial business logic — reverse geocoding + MongoDB 2dsphere queries
 */

const Shop = require('../../models/Shop');
const Product = require('../../models/Product');
const AppError = require('../../utils/AppError');
const { getPagination } = require('../../utils/pagination');
const { getRedis } = require('../../config/redis');

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = {
  'User-Agent': 'NearByDress/1.0 (contact@nearbydress.com)', // OSM requires a User-Agent
  'Accept-Language': 'en',
};

const GEO_CACHE_TTL = 60 * 60; // 1 hour (coordinates change rarely)

// ─── Reverse Geocoding (OSM Nominatim) ───────────────────────────────────────

/**
 * Convert [lat, lng] → structured address object
 * Returns: { pincode, city, state, country, formattedAddress, suburb, road }
 */
const reverseGeocode = async (lat, lng) => {
  const redis = getRedis();
  const cacheKey = `geo:rev:${parseFloat(lat).toFixed(4)}:${parseFloat(lng).toFixed(4)}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;

  let data;
  try {
    const response = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
    data = await response.json();
  } catch (err) {
    throw new AppError(`Reverse geocoding failed: ${err.message}`, 502);
  }

  if (!data || data.error) {
    throw new AppError('No address found for the provided coordinates', 404);
  }

  const addr = data.address || {};
  const result = {
    pincode: addr.postcode || null,
    city: addr.city || addr.town || addr.village || addr.county || null,
    state: addr.state || null,
    country: addr.country || null,
    suburb: addr.suburb || addr.neighbourhood || null,
    road: addr.road || null,
    formattedAddress: data.display_name || null,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  };

  if (redis) {
    try { await redis.setex(cacheKey, GEO_CACHE_TTL, JSON.stringify(result)); } catch (_) {}
  }

  return result;
};

/**
 * Forward geocode: address string → [lat, lng]
 * Used by admin to geocode a typed address
 */
const forwardGeocode = async (address) => {
  const redis = getRedis();
  const cacheKey = `geo:fwd:${address.toLowerCase().replace(/\s+/g, '+')}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const encoded = encodeURIComponent(address);
  const url = `${NOMINATIM_BASE}/search?q=${encoded}&format=jsonv2&addressdetails=1&limit=1`;

  let data;
  try {
    const response = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
    data = await response.json();
  } catch (err) {
    throw new AppError(`Forward geocoding failed: ${err.message}`, 502);
  }

  if (!data || !data.length) {
    throw new AppError('No location found for the provided address', 404);
  }

  const hit = data[0];
  const addr = hit.address || {};
  const result = {
    lat: parseFloat(hit.lat),
    lng: parseFloat(hit.lon),
    pincode: addr.postcode || null,
    city: addr.city || addr.town || addr.village || addr.county || null,
    state: addr.state || null,
    country: addr.country || null,
    formattedAddress: hit.display_name || null,
  };

  if (redis) {
    try { await redis.setex(cacheKey, GEO_CACHE_TTL, JSON.stringify(result)); } catch (_) {}
  }

  return result;
};

// ─── Shop Location Update ─────────────────────────────────────────────────────

/**
 * Set or update a shop's geo-coordinates and enriched address fields.
 * Called by seller (own shop) or admin (any shop).
 * @param {string} shopId
 * @param {string} requesterId  — userId making the request
 * @param {string} requesterRole
 * @param {{ lat: number, lng: number, serviceRadiusKm?: number }} payload
 */
const setShopLocation = async (shopId, requesterId, requesterRole, { lat, lng, serviceRadiusKm }) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new AppError('lat and lng must be numbers', 400);
  }
  if (lat < -90 || lat > 90) throw new AppError('lat must be between -90 and 90', 400);
  if (lng < -180 || lng > 180) throw new AppError('lng must be between -180 and 180', 400);

  const shop = await Shop.findById(shopId);
  if (!shop) throw new AppError('Shop not found', 404);

  if (requesterRole !== 'admin' && shop.owner.toString() !== requesterId.toString()) {
    throw new AppError('Not authorised to update this shop location', 403);
  }

  // Reverse geocode to enrich address fields
  let geoData = {};
  try {
    geoData = await reverseGeocode(lat, lng);
  } catch (_) {
    // Non-fatal — still save coordinates even if reverse geocode fails
  }

  const updatePayload = {
    location: { type: 'Point', coordinates: [lng, lat] }, // GeoJSON: [lng, lat]
    formattedAddress: geoData.formattedAddress || shop.formattedAddress,
  };

  // Only overwrite address fields if the shop doesn't already have them or admin is forcing
  if (geoData.city && (!shop.city || requesterRole === 'admin')) {
    updatePayload.city = geoData.city.toLowerCase();
  }
  if (geoData.state && (!shop.state || requesterRole === 'admin')) {
    updatePayload.state = geoData.state;
  }
  if (geoData.pincode && (!shop.pincode || requesterRole === 'admin')) {
    updatePayload.pincode = geoData.pincode;
  }
  if (typeof serviceRadiusKm === 'number') {
    updatePayload.serviceRadiusKm = serviceRadiusKm;
  }

  const updated = await Shop.findByIdAndUpdate(shopId, updatePayload, { new: true, runValidators: true });

  // Bust caches
  const redis = getRedis();
  if (redis) {
    try {
      const keys = await redis.keys('shops:*');
      if (keys.length) await redis.del(...keys);
      await redis.del(`shop:${shopId}`);
    } catch (_) {}
  }

  return { shop: updated, geoData };
};

// ─── Nearby Shops Query ───────────────────────────────────────────────────────

/**
 * Find approved+active shops within `radiusKm` of [lat, lng] sorted by distance.
 * Falls back to all approved shops if no geo-indexed shops are nearby.
 */
const getNearbyShops = async (query) => {
  const { lat, lng, radiusKm = 20, page, limit, skip } = (() => {
    const p = getPagination(query);
    return { ...p, lat: parseFloat(query.lat), lng: parseFloat(query.lng), radiusKm: parseFloat(query.radiusKm) || 20 };
  })();

  if (isNaN(lat) || isNaN(lng)) {
    throw new AppError('lat and lng query params are required for nearby search', 400);
  }

  const radiusMeters = radiusKm * 1000;

  // $geoNear requires a geo-indexed field — only shops WITH coordinates are returned
  const geoFilter = {
    status: 'approved',
    isActive: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  };

  const [shops, total] = await Promise.all([
    Shop.find(geoFilter)
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit),
    Shop.countDocuments(geoFilter),
  ]);

  return { shops, page, limit, total, totalPages: Math.ceil(total / limit), radiusKm };
};

/**
 * Highly optimized geospatial discovery feed pipeline.
 * Fetches nearby shops, products, featured items, and trending items.
 * Uses 2dsphere indexing and sub-queries to prevent slow Cartesian geo-joins.
 */
const getNearbyDiscoveryFeed = async (query) => {
  const lat = parseFloat(query.lat);
  const lng = parseFloat(query.lng);
  const radiusKm = parseFloat(query.radiusKm) || 15; // default 15 KM!
  const pincode = query.pincode;

  let geoFilter = { status: 'approved', isActive: true };

  // If coordinates are provided, perform 2dsphere proximity search
  if (!isNaN(lat) && !isNaN(lng)) {
    const radiusMeters = radiusKm * 1000;
    geoFilter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    };
  } else if (pincode) {
    // Fallback to pincode filtering if coordinates are not available
    geoFilter.pincode = pincode;
  } else {
    // Return early if no search bounds are specified to prevent massive scans
    return {
      shops: [],
      products: [],
      featuredItems: [],
      trendingProducts: [],
      radiusKm,
    };
  }

  // 1. Fetch nearby shops (fast index matching)
  const shops = await Shop.find(geoFilter).limit(30);
  const shopIds = shops.map(s => s._id);

  if (!shopIds.length) {
    return {
      shops: [],
      products: [],
      featuredItems: [],
      trendingProducts: [],
      radiusKm,
    };
  }

  // 2. Fetch products, featured items, and trending items from these shops in parallel
  const [products, featuredItems, trendingProducts] = await Promise.all([
    // Active products in the nearby area (latest first)
    Product.find({ shop: { $in: shopIds }, isActive: true })
      .populate('shop', 'name logo city')
      .sort({ createdAt: -1 })
      .limit(20),

    // Featured items in the nearby area
    Product.find({ shop: { $in: shopIds }, isActive: true, isFeatured: true })
      .populate('shop', 'name logo city')
      .sort({ createdAt: -1 })
      .limit(10),

    // Trending products in the nearby area
    Product.find({ shop: { $in: shopIds }, isActive: true, isTrending: true })
      .populate('shop', 'name logo city')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return {
    shops,
    products,
    featuredItems,
    trendingProducts,
    radiusKm,
  };
};

module.exports = {
  reverseGeocode,
  forwardGeocode,
  setShopLocation,
  getNearbyShops,
  getNearbyDiscoveryFeed,
};
