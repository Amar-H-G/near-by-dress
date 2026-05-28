const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: 'NearByDress Stylist',
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Dynamic SEO Fields inside BlogPost
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
  },
  { timestamps: true }
);

// ── Cache Invalidation Hooks ──
const cacheService = require('../core/cache/cache.service');
const clearSitemapCache = () => {
  cacheService.invalidatePattern('sitemap:*').catch(err => {
    console.error('❌ Failed to clear sitemap cache:', err.message);
  });
};
blogPostSchema.post('save', clearSitemapCache);
blogPostSchema.post('remove', clearSitemapCache);
blogPostSchema.post('updateOne', clearSitemapCache);
blogPostSchema.post('findOneAndUpdate', clearSitemapCache);
blogPostSchema.post('updateMany', clearSitemapCache);

module.exports = mongoose.model('BlogPost', blogPostSchema);
