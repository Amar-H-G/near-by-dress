/**
 * generateGeoData.js
 * Generates realistic geospatial offsets and coordinate clusters representing shops localized within a 15 KM boundary.
 */

/**
 * Generates coordinate pins close to a base center.
 * 0.01 degree is ~1.11 KM latitude-wise.
 * 0.01 degree is ~1.0 KM longitude-wise in northern/central India.
 * Thus, an offset range of [-0.08, 0.08] produces perfect spreads within a 10-12 KM radius.
 */
const generateCoordinatesInRadius = (baseLat, baseLng, maxOffsetDeg = 0.08) => {
  const latOffset = (Math.random() * 2 - 1) * maxOffsetDeg;
  const lngOffset = (Math.random() * 2 - 1) * maxOffsetDeg;

  return {
    lat: Number((baseLat + latOffset).toFixed(6)),
    lng: Number((baseLng + lngOffset).toFixed(6)),
  };
};

module.exports = {
  generateCoordinatesInRadius
};
