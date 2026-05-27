const mongoose = require('mongoose');

const seoRecordSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['page', 'product', 'category', 'shop', 'city', 'pincode', 'geo'],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: null,
      index: true,
    },
    slug: {
      type: String,
      default: '',
      index: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    ogTitle: {
      type: String,
      trim: true,
      default: '',
    },
    ogDescription: {
      type: String,
      trim: true,
      default: '',
    },
    ogImage: {
      type: String,
      trim: true,
      default: '',
    },
    twitterCard: {
      type: String,
      default: 'summary_large_image',
    },
    robots: {
      type: String,
      default: 'index, follow',
    },
    schemaMarkup: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Unique compound index so we have exactly one configuration record per page/slug/target
seoRecordSchema.index({ targetType: 1, targetId: 1 }, { unique: true, sparse: true });
seoRecordSchema.index({ slug: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('SEORecord', seoRecordSchema);
