/**
 * geoUtils.js
 * Pure geo math utilities — no side effects, fully testable
 */

// ─── Distance calculation ─────────────────────────────────────────────────────

/**
 * Haversine formula — great-circle distance between two lat/lng points
 * @returns distance in kilometres
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Format distance for display
 * @param {number} km
 * @returns {string}  e.g. "850 m" or "12.4 km"
 */
export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// ─── Coordinate validation ────────────────────────────────────────────────────

export const isValidLat = (v) => typeof v === 'number' && !isNaN(v) && v >= -90 && v <= 90;
export const isValidLng = (v) => typeof v === 'number' && !isNaN(v) && v >= -180 && v <= 180;
export const isValidCoords = (lat, lng) => isValidLat(lat) && isValidLng(lng);

// ─── GeoJSON helpers ──────────────────────────────────────────────────────────

/** Convert a GeoJSON Point coordinates array [lng, lat] → { lat, lng } */
export const geoJsonToLatLng = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lng, lat] = coordinates;
  if (!isValidCoords(lat, lng)) return null;
  return { lat, lng };
};

/** Convert { lat, lng } → GeoJSON Point */
export const latLngToGeoJson = (lat, lng) => ({
  type: 'Point',
  coordinates: [lng, lat], // GeoJSON order: [longitude, latitude]
});

// ─── Bounding box ─────────────────────────────────────────────────────────────

/**
 * Create a bounding box around a point for quick UI display
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusKm
 * @returns {{ sw: [lat,lng], ne: [lat,lng] }}
 */
export const getBoundingBox = (lat, lng, radiusKm) => {
  const latDelta = radiusKm / 111; // ~111 km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos(toRad(lat)));
  return {
    sw: [lat - latDelta, lng - lngDelta],
    ne: [lat + latDelta, lng + lngDelta],
  };
};

// ─── OSM tile URL builder ─────────────────────────────────────────────────────

/** Standard OpenStreetMap tile URL template */
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';
