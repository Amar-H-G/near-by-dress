const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: null,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    styleTags: {
      type: [String],
      default: [],
    },
    fashionLabels: {
      type: [String],
      default: [],
    },
    customAttributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      default: null,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isSystemProduct: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ shop: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

// ── Cache Invalidation Hooks ──
const cacheService = require('../core/cache/cache.service');
const clearSitemapCache = () => {
  cacheService.invalidatePattern('sitemap:*').catch(err => {
    console.error('❌ Failed to clear sitemap cache:', err.message);
  });
};
productSchema.post('save', clearSitemapCache);
productSchema.post('remove', clearSitemapCache);
productSchema.post('updateOne', clearSitemapCache);
productSchema.post('findOneAndUpdate', clearSitemapCache);
productSchema.post('updateMany', clearSitemapCache);

module.exports = mongoose.model('Product', productSchema);
