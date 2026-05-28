/**
 * seo.controller.js
 * Advanced Dynamic Enterprise SEO and Google Ranking controller.
 * Handles sitemap.xml, robots.txt, SEO overrides, dynamic blog posts, and dynamic Local SEO.
 */

const SEORecord = require('../../models/SEORecord');
const BlogPost = require('../../models/BlogPost');
const Product = require('../../models/Product');
const Shop = require('../../models/Shop');
const Category = require('../../models/Category');

// ─── Robots.txt Configuration ────────────────────────────────────────────────
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
    'Allow: /blogs/*',
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

// Helper to escape XML special characters
const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Helper to get the latest update date from an array of documents
const getLatestDate = (items, fallback = new Date()) => {
  if (!items || items.length === 0) return fallback.toISOString().split('T')[0];
  const dates = items.map(item => item.updatedAt ? new Date(item.updatedAt) : new Date(0));
  const maxDate = new Date(Math.max(...dates));
  return maxDate.toISOString().split('T')[0];
};

const cacheService = require('../../core/cache/cache.service');

// ─── XML Sitemap Generator ───────────────────────────────────────────────────
exports.getSitemapXml = async (req, res) => {
  try {
    const type = req.params.type; // e.g. "products", "shops", "image" etc
    const host = req.get('host');
    const protocol = req.secure ? 'https' : 'http';
    
    // Auto-resolve production domains appropriately
    const frontendUrl = process.env.CLIENT_URL || `${protocol}://${host.replace('api', 'www')}`;
    const cleanFrontUrl = frontendUrl.replace(/\/$/, '');

    const cacheKey = `sitemap:${type || 'index'}`;
    const cachedXml = await cacheService.get(cacheKey);
    if (cachedXml) {
      res.header('Content-Type', 'application/xml');
      res.header('Cache-Control', 'public, max-age=3600');
      return res.send(cachedXml);
    }

    let xml = '';

    // Helper to format ISO dates to YYYY-MM-DD
    const formatDate = (date) => {
      const d = date ? new Date(date) : new Date();
      return d.toISOString().split('T')[0];
    };

    if (!type) {
      // ─── Sitemap Index ───
      const [products, shops, categories, blogs] = await Promise.all([
        Product.find({ isActive: true }).select('updatedAt').lean(),
        Shop.find({ status: 'approved', isActive: true }).select('updatedAt').lean(),
        Category.find({ isActive: true }).select('updatedAt').lean(),
        BlogPost.find({ isActive: true }).select('updatedAt').lean()
      ]);

      const latestProductDate = getLatestDate(products);
      const latestShopDate = getLatestDate(shops);
      const latestCategoryDate = getLatestDate(categories);
      const latestBlogDate = getLatestDate(blogs);
      const latestCoreDate = getLatestDate([...products, ...shops, ...blogs]);

      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-core.xml</loc>`,
        `    <lastmod>${latestCoreDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-products.xml</loc>`,
        `    <lastmod>${latestProductDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-shops.xml</loc>`,
        `    <lastmod>${latestShopDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-categories.xml</loc>`,
        `    <lastmod>${latestCategoryDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-city.xml</loc>`,
        `    <lastmod>${latestShopDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-pincode.xml</loc>`,
        `    <lastmod>${latestShopDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-nearby.xml</loc>`,
        `    <lastmod>${latestShopDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-blog.xml</loc>`,
        `    <lastmod>${latestBlogDate}</lastmod>`,
        '  </sitemap>',
        '  <sitemap>',
        `    <loc>${cleanFrontUrl}/sitemap-image.xml</loc>`,
        `    <lastmod>${latestProductDate}</lastmod>`,
        '  </sitemap>',
        '</sitemapindex>'
      ].join('\n');

    } else if (type === 'core') {
      // ─── Core Sitemap ───
      const xmlItems = [
        '  <url>',
        `    <loc>${cleanFrontUrl}</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/products</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.9</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/shops</loc>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.8</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/nearby-fashion-shops</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.85</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/fashion-near-me</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.85</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/blogs</loc>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.7</priority>',
        '  </url>'
      ];
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'products') {
      // ─── Products Sitemap ───
      const products = await Product.find({ isActive: true }).select('_id updatedAt').lean();
      const xmlItems = products.map(p => [
        '  <url>',
        `    <loc>${cleanFrontUrl}/products/${p._id}</loc>`,
        `    <lastmod>${formatDate(p.updatedAt)}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.9</priority>',
        '  </url>'
      ].join('\n'));
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'shops') {
      // ─── Shops Sitemap ───
      const shops = await Shop.find({ status: 'approved', isActive: true }).select('_id updatedAt').lean();
      const xmlItems = shops.map(s => [
        '  <url>',
        `    <loc>${cleanFrontUrl}/shops/${s._id}</loc>`,
        `    <lastmod>${formatDate(s.updatedAt)}</lastmod>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.8</priority>',
        '  </url>'
      ].join('\n'));
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'categories') {
      // ─── Categories Sitemap ───
      const categories = await Category.find({ isActive: true }).select('slug updatedAt').lean();
      const xmlItems = categories.map(c => [
        '  <url>',
        `    <loc>${cleanFrontUrl}/categories/${c.slug}</loc>`,
        `    <lastmod>${formatDate(c.updatedAt)}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.8</priority>',
        '  </url>'
      ].join('\n'));
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'city') {
      // ─── City Sitemap ───
      const shops = await Shop.find({ status: 'approved', isActive: true }).select('city updatedAt').lean();
      const cities = [...new Set(shops.map(s => s.city).filter(Boolean).map(c => c.toLowerCase()))];
      const xmlItems = cities.map(city => [
        '  <url>',
        `    <loc>${cleanFrontUrl}/shops/city/${city}</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.75</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/shops/${city}</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.75</priority>',
        '  </url>'
      ].join('\n'));
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'pincode') {
      // ─── Pincode Sitemap ───
      const shops = await Shop.find({ status: 'approved', isActive: true }).select('pincode updatedAt').lean();
      const pincodes = [...new Set(shops.map(s => s.pincode).filter(Boolean))];
      const xmlItems = pincodes.map(pin => [
        '  <url>',
        `    <loc>${cleanFrontUrl}/shops/pincode/${pin}</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.75</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/shops/${pin}</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.75</priority>',
        '  </url>'
      ].join('\n'));
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'nearby') {
      // ─── Nearby Sitemap ───
      const shops = await Shop.find({ status: 'approved', isActive: true }).select('city updatedAt').lean();
      const cities = [...new Set(shops.map(s => s.city).filter(Boolean).map(c => c.toLowerCase()))];
      const xmlItems = cities.map(city => [
        '  <url>',
        `    <loc>${cleanFrontUrl}/nearby-fashion-shops?city=${city}</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.7</priority>',
        '  </url>',
        '  <url>',
        `    <loc>${cleanFrontUrl}/fashion-near-me?city=${city}</loc>`,
        '    <changefreq>daily</changefreq>',
        '    <priority>0.7</priority>',
        '  </url>'
      ].join('\n'));
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'blog') {
      // ─── Blog Sitemap ───
      const blogs = await BlogPost.find({ isActive: true }).select('slug updatedAt').lean();
      const xmlItems = blogs.map(b => [
        '  <url>',
        `    <loc>${cleanFrontUrl}/blogs/${b.slug}</loc>`,
        `    <lastmod>${formatDate(b.updatedAt)}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.8</priority>',
        '  </url>'
      ].join('\n'));
      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else if (type === 'image') {
      // ─── Image Sitemap ───
      const [products, shops] = await Promise.all([
        Product.find({ isActive: true }).select('_id name images').lean(),
        Shop.find({ status: 'approved', isActive: true }).select('_id name logo coverImage').lean()
      ]);

      const xmlItems = [];

      products.forEach(p => {
        if (p.images && p.images.length > 0) {
          const imageXml = p.images.map(img => {
            const url = typeof img === 'object' ? img.url : img;
            if (!url) return '';
            return [
              '    <image:image>',
              `      <image:loc>${url}</image:loc>`,
              `      <image:title>${escapeXml(p.name)}</image:title>`,
              '    </image:image>'
            ].join('\n');
          }).filter(Boolean).join('\n');

          if (imageXml) {
            xmlItems.push([
              '  <url>',
              `    <loc>${cleanFrontUrl}/products/${p._id}</loc>`,
              imageXml,
              '  </url>'
            ].join('\n'));
          }
        }
      });

      shops.forEach(s => {
        const imageUrls = [s.logo, s.coverImage].filter(Boolean);
        if (imageUrls.length > 0) {
          const imageXml = imageUrls.map(url => [
            '    <image:image>',
            `      <image:loc>${url}</image:loc>`,
            `      <image:title>${escapeXml(s.name)}</image:title>`,
            '    </image:image>'
          ].join('\n')).join('\n');

          xmlItems.push([
            '  <url>',
            `    <loc>${cleanFrontUrl}/shops/${s._id}</loc>`,
            imageXml,
            '  </url>'
          ].join('\n'));
        }
      });

      xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        xmlItems.join('\n'),
        '</urlset>'
      ].join('\n');

    } else {
      return res.status(404).send('Sitemap type not found');
    }

    // Save to Cache
    await cacheService.set(cacheKey, xml, 3600);

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  } catch (err) {
    console.error('❌ Sitemap compilation failure:', err.message);
    return res.status(500).send('Error compiling sitemap');
  }
};

// ─── Public SEO Lookup ───────────────────────────────────────────────────────
exports.getSEOMetadata = async (req, res) => {
  try {
    const { targetType, targetId, slug } = req.query;
    
    let seo = null;
    if (slug) {
      seo = await SEORecord.findOne({ slug });
    } else if (targetType && targetId) {
      seo = await SEORecord.findOne({ targetType, targetId });
    }

    if (!seo) {
      // Fallback/Default dynamic templates for products, shops, cities
      if (targetType === 'product' && targetId) {
        const prod = await Product.findById(targetId).lean();
        if (prod) {
          return res.json({
            metaTitle: `${prod.name} | Direct WhatsApp Buying`,
            metaDescription: `${prod.description || 'Premium boutique apparel.'} Buy directly from local vendors via WhatsApp.`,
            keywords: [prod.category, 'clothing', 'boutique', 'fashion'].filter(Boolean),
            robots: 'index, follow',
            canonicalUrl: `/products/${prod._id}`
          });
        }
      } else if (targetType === 'shop' && targetId) {
        const shop = await Shop.findById(targetId).lean();
        if (shop) {
          return res.json({
            metaTitle: `${shop.name} | Verified Boutique in ${shop.city || 'Your City'}`,
            metaDescription: `${shop.description || 'Verified local clothing outlet.'} Located at ${shop.formattedAddress || shop.city}.`,
            keywords: [shop.category, 'dress shop', shop.city, 'fashion boutique'].filter(Boolean),
            robots: 'index, follow',
            canonicalUrl: `/shops/${shop._id}`
          });
        }
      }

      return res.json({
        metaTitle: 'NearByDress — Hyperlocal Fashion Marketplace',
        metaDescription: 'Discover local fashion shops and buy directly via WhatsApp.',
        keywords: ['fashion', 'local shops', 'boutiques'],
        robots: 'index, follow',
        canonicalUrl: '/'
      });
    }

    return res.json(seo);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── Local Geo SEO Generator ──────────────────────────────────────────────────
exports.getLocalSEOInfo = async (req, res) => {
  try {
    const { city, pincode } = req.query;
    let title = '';
    let description = '';
    let query = { status: 'approved', isActive: true };

    if (city) {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
      const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      title = `Best Dress Shops and Boutiques in ${formattedCity} | NearByDress`;
      description = `Discover verified ethnic, western, and traditional designer boutiques in ${formattedCity}. Buy premium clothes directly via WhatsApp.`;
    } else if (pincode) {
      query.pincode = pincode.trim();
      title = `Fashion boutiques & Clothing Stores near Pincode ${pincode} | NearByDress`;
      description = `Find local designer shops and ethnic dress sellers in and around pincode ${pincode}. Contact boutique owners directly.`;
    } else {
      return res.status(400).json({ message: 'City or Pincode is required' });
    }

    const shops = await Shop.find(query).limit(10).select('name logo formattedAddress category').lean();

    return res.json({
      metaTitle: title,
      metaDescription: description,
      shopsCount: shops.length,
      shopsSample: shops,
      entityRichText: `Discover local fashion in your neighborhood. Get instant access to WhatsApp messaging, catalog browsing, and door-step deliveries.`
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── Public Blog API ──────────────────────────────────────────────────────────
exports.getBlogPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ isActive: true }).sort('-createdAt').lean();
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getBlogPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── Admin SEO API ───────────────────────────────────────────────────────────
exports.adminGetSEORecords = async (req, res) => {
  try {
    const records = await SEORecord.find({}).sort('-createdAt').lean();
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.adminUpsertSEORecord = async (req, res) => {
  try {
    const { targetType, targetId, slug } = req.body;
    let filter = {};

    if (slug) {
      filter = { slug };
    } else if (targetType && targetId) {
      filter = { targetType, targetId };
    } else {
      return res.status(400).json({ message: 'TargetType/TargetId or Slug is required' });
    }

    const record = await SEORecord.findOneAndUpdate(
      filter,
      { ...req.body },
      { new: true, upsert: true }
    );

    return res.json({ message: 'SEO Record updated successfully', record });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.adminDeleteSEORecord = async (req, res) => {
  try {
    await SEORecord.findByIdAndDelete(req.params.id);
    return res.json({ message: 'SEO Record deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── Admin Blog API ──────────────────────────────────────────────────────────
exports.adminGetBlogPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({}).sort('-createdAt').lean();
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.adminCreateBlogPost = async (req, res) => {
  try {
    const post = new BlogPost({ ...req.body });
    await post.save();
    return res.status(201).json({ message: 'Blog post created successfully', post });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.adminUpdateBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    return res.json({ message: 'Blog post updated successfully', post });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.adminDeleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    return res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
