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

// ─── XML Sitemap Generator ───────────────────────────────────────────────────
exports.getSitemapXml = async (req, res) => {
  try {
    const host = req.get('host');
    const protocol = req.secure ? 'https' : 'http';
    const frontendUrl = process.env.CLIENT_URL || `${protocol}://${host.replace('api', 'www')}`;
    const cleanFrontUrl = frontendUrl.replace(/\/$/, '');

    const [products, shops, categories, blogs] = await Promise.all([
      Product.find({ isActive: true }).select('_id updatedAt').lean(),
      Shop.find({ status: 'approved', isActive: true }).select('_id updatedAt city pincode').lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
      BlogPost.find({ isActive: true }).select('slug updatedAt').lean()
    ]);

    const xmlItems = [];

    // 1. Static/Core pages
    const corePages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/products', priority: '0.9', changefreq: 'daily' },
      { path: '/shops', priority: '0.8', changefreq: 'weekly' },
      { path: '/blogs', priority: '0.7', changefreq: 'weekly' }
    ];

    corePages.forEach(p => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
    });

    // 2. Categories
    categories.forEach(c => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/products?category=${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    // 3. Shops & Local landing pages
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

    // City pages
    uniqueCities.forEach(city => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/shops/city/${city}</loc>
    <changefreq>daily</changefreq>
    <priority>0.75</priority>
  </url>`);
    });

    // Pincode pages
    uniquePincodes.forEach(pin => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/shops/pincode/${pin}</loc>
    <changefreq>daily</changefreq>
    <priority>0.75</priority>
  </url>`);
    });

    // 4. Products
    products.forEach(p => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/products/${p._id}</loc>
    <lastmod>${p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
    });

    // 5. Blogs
    blogs.forEach(b => {
      xmlItems.push(`  <url>
    <loc>${cleanFrontUrl}/blogs/${b.slug}</loc>
    <lastmod>${b.updatedAt ? b.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
