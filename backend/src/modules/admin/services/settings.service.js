/**
 * settings.service.js
 * Encapsulates all Settings DB operations with cache invalidation.
 */
const Settings = require('../../../models/Settings');
const cacheService = require('../../../core/cache/cache.service');
const { KEYS } = require('../../../core/cache/cacheKeys');

/**
 * Get or auto-create the singleton settings document.
 */
const getSettings = async () => {
  let settings = await Settings.findOne().lean();
  if (!settings) {
    settings = await Settings.create({});
    settings = settings.toObject();
  }
  return settings;
};

/**
 * Apply a partial update to the settings document and invalidate Redis cache.
 * @param {Object} patch - Plain object with fields to update (supports nested dot-paths via $set)
 * @param {Object} files - Optional files from multer (logo, favicon)
 * @returns {Object} Updated settings document
 */
const updateSettings = async (patch, files = {}) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  // ── Top-level scalar fields ─────────────────────────────────────────────────
  const scalarFields = [
    'siteName', 'siteTagline', 'siteDescriptor',
    'primaryColor', 'secondaryColor', 'accentColor',
    'contactEmail', 'contactPhone', 'supportLabel', 'address',
    'footerTagline', 'footerCopyright',
    'typographyFont', 'loadingText', 'loadingBgColor', 'hoverColor',
  ];
  scalarFields.forEach((field) => {
    if (patch[field] !== undefined) settings[field] = patch[field];
  });

  // ── Uploaded files ─────────────────────────────────────────────────────────
  if (files?.logo?.[0]) settings.logo = files.logo[0].path;
  if (files?.favicon?.[0]) settings.favicon = files.favicon[0].path;

  // ── Nested JSON objects (sent as stringified JSON from multipart forms) ─────
  const nestedFields = [
    'socialLinks', 'seo', 'whatsapp', 'heroBanner',
    'campaigns', 'announcementBar', 'locationDefaults',
    'homepageSectionsOrder', 'homepageSections', 'sellerCta',
    'featuredProductsHeader', 'newArrivalsHeader', 'featuredShopsHeader',
    'categoriesHeader', 'moodSection', 'featuresSection',
    'testimonials', 'offers', 'customPages'
  ];

  nestedFields.forEach((field) => {
    if (patch[field] !== undefined) {
      const val = patch[field];
      try {
        // Parse if it arrived as a string (multipart form)
        settings[field] = typeof val === 'string' ? JSON.parse(val) : val;
      } catch (_) {
        // Skip malformed JSON silently
      }
    }
  });

  await settings.save();

  // ── Invalidate Redis cache so next public GET fetches fresh data ────────────
  await cacheService.del(KEYS.SETTINGS);

  return settings.toObject();
};

module.exports = { getSettings, updateSettings };
