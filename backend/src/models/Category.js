const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save hook to generate slug if not provided (can be manual too)
categorySchema.pre('validate', function() {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
});

// ── Cache Invalidation Hooks ──
const cacheService = require('../core/cache/cache.service');
const clearSitemapCache = () => {
  cacheService.invalidatePattern('sitemap:*').catch(err => {
    console.error('❌ Failed to clear sitemap cache:', err.message);
  });
};
categorySchema.post('save', clearSitemapCache);
categorySchema.post('remove', clearSitemapCache);
categorySchema.post('updateOne', clearSitemapCache);
categorySchema.pre('findOneAndUpdate', clearSitemapCache);
categorySchema.post('updateMany', clearSitemapCache);

module.exports = mongoose.model('Category', categorySchema);
