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
  max: 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
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

// ─── API Routes ──────────────────────────────────────────────────────────────
const sellerRoutes  = require('./src/modules/seller/routes/seller.routes');
const settingsCtrl  = require('./src/modules/admin/controllers/settings.controller');
const categoryCtrl  = require('./src/modules/admin/controllers/category.controller');
const filterCtrl    = require('./src/modules/admin/controllers/filter.controller');

app.get('/api/settings', settingsCtrl.getSettings);
app.get('/api/categories', categoryCtrl.getCategories);
app.get('/api/filters', filterCtrl.getFilters);

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);

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
