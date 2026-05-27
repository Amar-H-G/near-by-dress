const express = require('express');
const router = express.Router();
const ctrl = require('./seo.controller');
const { authenticate, authorize } = require('../../middleware/auth');

// ─── Public SEO and Local Discovery Routes ──────────────────────────────────
router.get('/', ctrl.getSEOMetadata);
router.get('/local', ctrl.getLocalSEOInfo);
router.get('/blogs', ctrl.getBlogPosts);
router.get('/blogs/:slug', ctrl.getBlogPostBySlug);

// ─── Admin SEO Control Routes (Protected) ───────────────────────────────────
router.get('/admin/records', authenticate, authorize('admin'), ctrl.adminGetSEORecords);
router.post('/admin/records', authenticate, authorize('admin'), ctrl.adminUpsertSEORecord);
router.delete('/admin/records/:id', authenticate, authorize('admin'), ctrl.adminDeleteSEORecord);

// ─── Admin Blog Control Routes (Protected) ──────────────────────────────────
router.get('/admin/blogs', authenticate, authorize('admin'), ctrl.adminGetBlogPosts);
router.post('/admin/blogs', authenticate, authorize('admin'), ctrl.adminCreateBlogPost);
router.put('/admin/blogs/:id', authenticate, authorize('admin'), ctrl.adminUpdateBlogPost);
router.delete('/admin/blogs/:id', authenticate, authorize('admin'), ctrl.adminDeleteBlogPost);

module.exports = router;
