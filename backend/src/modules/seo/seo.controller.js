// [ignoring loop detection]
/**
 * seo.controller.js
 * High-performance controller to dynamically build search-engine-ready XML sitemaps
 * and robots.txt based on active database entities (Shops, Products, Categories).
 */

const Product = require('../../models/Product');
const Shop = require('../../models/Shop');
const Category = require('../../models/Category');

/**
 * Serves a professional robots.txt to crawl indexable directories
 * and restrict private admin/seller pipelines.
 */
exports.getRobotsTxt = (req, res) => {
  const host = req.get('host');
  const protocol = req.secure ? 'https' : 'http';
  const siteUrl = `${protocol}://${host}`;

  const robots = [
    'User-agent: *',
    'Allow: /',
    'Allow: /products/*',
    'Allow: /shops/*',
    'Allow: /categories/*',
    'Allow: /nearby/*',
    'Disallow: /admin/',
    'Disallow: /seller/',
    'Disallow: /api/admin/',
    'Disallow: /api/seller/',
    'Disallow: /login',
    'Disallow: /register',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join('\n');

  res.header('Content-Type', 'text/plain');
  return res.send(robots);
};

/**
 * Serves a dynamic, high-speed XML sitemap featuring all active categories,
 * registered shops, and active products with metadata.
 */
exports.getSitemapXml = async (req, res) => {
  try {
    const host = req.get('host');
    const protocol = req.secure ? 'https' : 'http';
    
    // Fallback to production front-end URL if request host is backend
    const frontendUrl = process.env.CLIENT_URL || `${protocol}://${host.replace('api', 'www')}`;
    const cleanFrontUrl = frontendUrl.replace(/\/$/, '');

    const [products, shops, categories] = await Promise.all([
      Product.find({ isActive: true }).select('_id updatedAt').lean(),
      Shop.find({ status: 'approved', isActive: true }).select('_id updatedAt city pincode').lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean()
    ]);

    const xmlItems = [];

    // 1. Static Core Pages
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/products', priority: '0.9', changefreq: 'daily' },
      { path: '/shops', priority: '0.8', changefreq: 'weekly' }
    ];

    staticPages.forEach(p => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
    });

    // 2. Dynamic Categories
    categories.forEach(c => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/products?category=${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // 3. Dynamic Shops (including City / Pincode Landing URL mapping)
    const uniqueCities = new Set();
    const uniquePincodes = new Set();

    shops.forEach(s => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/shops/${s._id}</loc>
    <lastmod>${s.updatedAt ? s.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);

      if (s.city) uniqueCities.add(s.city.toLowerCase());
      if (s.pincode) uniquePincodes.add(s.pincode);
    });

    // City landing pages
    uniqueCities.forEach(city => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/shops?city=${city}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
    });

    // Pincode landing pages
    uniquePincodes.forEach(pin => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/shops?pincode=${pin}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
    });

    // 4. Dynamic Products
    products.forEach(p => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/products/${p._id}</loc>
    <lastmod>${p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    });

    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      xmlItems.join('\n'),
      '</urlset>'
    ].join('\n');

    res.header('Content-Type', 'application/xml');
    return res.send(sitemap);
  } catch (err) {
    console.error('❌ Sitemap compilation failure:', err.message);
    return res.status(500).send('Error generating sitemap');
  }
};
