require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
require('./src/config/cloudinary'); // initialize cloudinary

// ── Modular role-based routes ────────────────────────────────────────────────
// Used by: user module (auth, public product/shop read)
const authRoutes    = require('./src/modules/user/routes/auth.routes');
const shopRoutes    = require('./src/modules/user/routes/shop.routes');
const productRoutes = require('./src/modules/user/routes/product.routes');
// Used by: admin module
const adminRoutes   = require('./src/modules/admin/routes/admin.routes');
const errorHandler  = require('./src/middleware/errorHandler');
const { sendError } = require('./src/utils/response');

const app = express();

// ─── Connect Services ───────────────────────────────────────────────────────
connectDB();
connectRedis();

// ─── Security ───────────────────────────────────────────────────────────────
app.use(helmet());

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 2000 : 200, // relaxed in dev
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // completely skip in dev
});
app.use('/api', limiter);

// ─── CORS ───────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://near-dress.onrender.com',     // production frontend
  'https://near-by-dress.onrender.com',  // backend itself
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(u => u.trim().replace(/\/$/, '')) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (ALLOWED_ORIGINS.includes(cleanOrigin)) {
        return callback(null, true);
      }
      callback(null, false); // Reject naturally without crashing Express
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ─── Root SEO crawlers ───────────────────────────────────────────────────────
const seoCtrl = require('./src/modules/seo/seo.controller');
app.get('/robots.txt', seoCtrl.getRobotsTxt);
app.get('/sitemap.xml', seoCtrl.getSitemapXml);

// ─── API Routes ──────────────────────────────────────────────────────────────
const sellerRoutes   = require('./src/modules/seller/routes/seller.routes');
const locationRoutes = require('./src/modules/location/location.routes');
const settingsCtrl   = require('./src/modules/admin/controllers/settings.controller');
const categoryCtrl   = require('./src/modules/admin/controllers/category.controller');
const filterCtrl     = require('./src/modules/admin/controllers/filter.controller');

// Mount Caching Middleware for settings, categories, and filters
const cacheMiddleware = require('./src/core/cache/cache.middleware');
const { KEYS } = require('./src/core/cache/cacheKeys');

app.get('/api/settings', cacheMiddleware(KEYS.SETTINGS, 1800), settingsCtrl.getSettings);
app.get('/api/categories', cacheMiddleware(KEYS.CATEGORIES, 1800), categoryCtrl.getCategories);
app.get('/api/filters', cacheMiddleware(KEYS.FILTERS, 1800), filterCtrl.getFilters);

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/location', locationRoutes); // Geolocation module
const profileRoutes = require('./src/modules/profile/profile.routes');
app.use('/api/profile', profileRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 NearByDress Backend running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
