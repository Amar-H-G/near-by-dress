const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      maxlength: [100, 'Shop name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    shopNo: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    category: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    openingTime: {
      type: String,
      trim: true,
    },
    closingTime: {
      type: String,
      trim: true,
    },

    // ─── Geolocation ─────────────────────────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]  — GeoJSON standard order
        default: undefined,
      },
    },
    formattedAddress: {
      type: String,
      trim: true,
      default: null,
    },
    serviceRadiusKm: {
      type: Number,
      default: 10,
      min: [1, 'Service radius must be at least 1 km'],
      max: [100, 'Service radius cannot exceed 100 km'],
    },
    // ─── Visibility, Feature & Ranking controls ─────────────────────────────
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    rankingScore: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['public', 'hidden'],
      default: 'public',
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
shopSchema.index({ status: 1, city: 1 });
shopSchema.index({ owner: 1 });
// 2dsphere index — required for $near, $geoWithin, $geoNear queries
shopSchema.index({ location: '2dsphere' }, { sparse: true }); // sparse so docs without location are not indexed

// ── Cache Invalidation Hooks ──
const cacheService = require('../core/cache/cache.service');
const clearSitemapCache = () => {
  cacheService.invalidatePattern('sitemap:*').catch(err => {
    console.error('❌ Failed to clear sitemap cache:', err.message);
  });
};
shopSchema.post('save', clearSitemapCache);
shopSchema.post('remove', clearSitemapCache);
shopSchema.post('updateOne', clearSitemapCache);
shopSchema.post('findOneAndUpdate', clearSitemapCache);
shopSchema.post('updateMany', clearSitemapCache);

module.exports = mongoose.model('Shop', shopSchema);
