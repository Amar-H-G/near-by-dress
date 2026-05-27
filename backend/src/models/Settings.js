const mongoose = require('mongoose');

// ── Reusable sub-schemas ──────────────────────────────────────────────────────

const SocialLinksSchema = new mongoose.Schema({
  facebook:  { type: String, default: '' },
  instagram: { type: String, default: '' },
  twitter:   { type: String, default: '' },
  youtube:   { type: String, default: '' },
  pinterest: { type: String, default: '' },
}, { _id: false });

const SEOSchema = new mongoose.Schema({
  homeTitle:       { type: String, default: 'NearByDress — Hyperlocal Fashion Marketplace' },
  homeDescription: { type: String, default: 'Discover local fashion shops near you and shop directly via WhatsApp.' },
  homeKeywords:    { type: String, default: 'fashion, local shops, marketplace, boutique, ethnic wear, western wear' },
  ogImage:         { type: String, default: '' },
  
  // Twitter Cards
  twitterCard:     { type: String, default: 'summary_large_image' },
  twitterSite:     { type: String, default: '@nearbydress' },
  twitterCreator:  { type: String, default: '@nearbydress' },

  // Page Specific Meta
  productsTitle:   { type: String, default: 'Premium Fashion Collection | NearByDress' },
  productsDescription: { type: String, default: 'Browse local clothing, ethnic wear, western wear and accessories from trusted boutiques.' },
  shopsTitle:      { type: String, default: 'Verified Local Fashion Boutiques | NearByDress' },
  shopsDescription: { type: String, default: 'Find the best clothing shops, design houses, and fashion outlets in your area.' },

  // Structured Data / Schema Markup Configuration
  organizationName: { type: String, default: 'NearByDress' },
  organizationLogo: { type: String, default: '' },
  organizationSameAs: { type: [String], default: [] },

  // Geo / Local SEO Defaults
  localBusinessStreetAddress: { type: String, default: '' },
  localBusinessLocality:      { type: String, default: '' },
  localBusinessRegion:        { type: String, default: '' },
  localBusinessPostalCode:    { type: String, default: '' },
  localBusinessCountry:       { type: String, default: 'IN' },
}, { _id: false });

const WhatsAppSchema = new mongoose.Schema({
  adminNumber:    { type: String, default: '' }, // E.164, digits only e.g. 918167827523
  supportMessage: { type: String, default: "Hi Support, I'm reaching out about NBD." },
  orderPrefix:    { type: String, default: '🛍️ New Order via NearByDress' },
  orderIntro:     { type: String, default: 'Hello NearByDress Admin Team,' },
  orderOutro:     { type: String, default: 'Please confirm availability.' },
}, { _id: false });

const CMSPageSchema = new mongoose.Schema({
  slug:    { type: String, required: true },
  title:   { type: String, required: true },
  content: { type: String, required: true },
  isActive:{ type: Boolean, default: true }
});

const HeroBannerSchema = new mongoose.Schema({
  eyebrow:    { type: String, default: 'Curated multi-vendor fashion' },
  title:      { type: String, default: 'Your city.\nYour new wardrobe.' },
  subtitle:   { type: String, default: 'Find verified local boutiques, fresh drops, and seasonal campaigns in one premium marketplace.' },
  ctaPrimary: { type: String, default: 'Shop the edit' },
  ctaSecondary:{ type: String, default: 'Discover shops' },
  stats:      { type: [{ value: String, label: String }], default: [
    { value: '500+', label: 'Local shops' },
    { value: '10K+', label: 'Fashion finds' },
    { value: '50+',  label: 'Cities served' },
  ]},
}, { _id: false });

const CampaignItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  copy:  { type: String, default: '' },
  image: { type: String, default: '' },
  to:    { type: String, default: '/products' },
}, { _id: false });

const AnnouncementBarSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  text:    { type: String, default: '' },
  color:   { type: String, default: '#7c3aed' }, // bg color
  link:    { type: String, default: '' },
}, { _id: false });

const LocationDefaultsSchema = new mongoose.Schema({
  defaultPincode: { type: String, default: '' },
  defaultCity:    { type: String, default: '' },
  defaultState:   { type: String, default: '' },
  defaultRadius:  { type: Number, default: 10 },   // km
  maxRadius:      { type: Number, default: 50 },    // km
  serviceableCities: {
    type: [{
      name:     { type: String, required: true },
      pincodes: { type: [String], default: [] },
      isActive: { type: Boolean, default: true }
    }],
    default: [
      { name: 'kolkata', pincodes: ['700001', '700016', '700019'], isActive: true },
      { name: 'mumbai', pincodes: ['400001', '400002'], isActive: true }
    ]
  }
}, { _id: false });

const TestimonialSchema = new mongoose.Schema({
  quote:  { type: String, required: true },
  author: { type: String, required: true },
  role:   { type: String, default: 'Fashion Enthusiast' },
  avatar: { type: String, default: '' },
}, { _id: false });

const OfferSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  copy:     { type: String, default: '' },
  code:     { type: String, default: '' },
  discount: { type: String, default: '' },
  bgImage:  { type: String, default: '' },
  link:     { type: String, default: '/products' },
}, { _id: false });

// ── Root settings schema ──────────────────────────────────────────────────────

const settingsSchema = new mongoose.Schema(
  {
    // ── Branding ───────────────────────────────────────────────────────────
    siteName:        { type: String, default: 'NearByDress' },
    siteTagline:     { type: String, default: 'Fashion Marketplace' },
    siteDescriptor:  { type: String, default: 'Hyperlocal Fashion Marketplace' },
    logo:            { type: String, default: null },
    favicon:         { type: String, default: null },

    // ── Colors ─────────────────────────────────────────────────────────────
    primaryColor:    { type: String, default: '#7c3aed' },
    secondaryColor:  { type: String, default: '#10B981' },
    accentColor:     { type: String, default: '#f59e0b' },

    // ── Contact / Support ─────────────────────────────────────────────────
    contactEmail:    { type: String, default: 'support@nearbydress.com' },
    contactPhone:    { type: String, default: '' },
    supportLabel:    { type: String, default: 'Contact Support' },
    address:         { type: String, default: '' },

    // ── Footer ─────────────────────────────────────────────────────────────
    footerTagline:   { type: String, default: 'Premium local fashion discovery, verified shops, and direct buying in one marketplace.' },
    footerCopyright: { type: String, default: '' }, // empty = auto year

    // ── Social Links ───────────────────────────────────────────────────────
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },

    // ── SEO ────────────────────────────────────────────────────────────────
    seo: { type: SEOSchema, default: () => ({}) },

    // ── WhatsApp ───────────────────────────────────────────────────────────
    whatsapp: { type: WhatsAppSchema, default: () => ({}) },

    // ── Hero Banner ────────────────────────────────────────────────────────
    heroBanner: { type: HeroBannerSchema, default: () => ({}) },

    // ── Campaigns (max 6) ──────────────────────────────────────────────────
    campaigns: { type: [CampaignItemSchema], default: [
      {
        title: 'Weekend statement pieces',
        copy:  'Elevated dresses, party-ready textures, and local boutique edits made for plans after sunset.',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=82',
        to:    '/products?search=party',
      },
      {
        title: 'Everyday essentials',
        copy:  'Clean layers, soft tailoring, and refined casuals from shops around you.',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=82',
        to:    '/products?search=casual',
      },
    ]},

    // ── Announcement Bar ───────────────────────────────────────────────────
    announcementBar: { type: AnnouncementBarSchema, default: () => ({}) },

    // ── Location defaults ──────────────────────────────────────────────────
    locationDefaults: { type: LocationDefaultsSchema, default: () => ({}) },

    // ── Homepage Builder Sections Order & Config ───────────────────────────
    homepageSectionsOrder: {
      type: [String],
      default: [
        'hero',
        'features',
        'campaigns',
        'featuredProducts',
        'categories',
        'newArrivals',
        'mood',
        'featuredShops',
        'nearbyShops',
        'nearbyDiscovery',
        'testimonials',
        'offers',
        'sellerCta'
      ]
    },

    // ── Homepage Sections Visibility ───────────────────────────────────────
    homepageSections: {
      type: {
        showHero:         { type: Boolean, default: true },
        showFeatures:     { type: Boolean, default: true },
        showCampaigns:    { type: Boolean, default: true },
        showMoodSection:  { type: Boolean, default: true },
        showSellerCta:    { type: Boolean, default: true },
        showNewArrivals:  { type: Boolean, default: true },
        showFeatured:     { type: Boolean, default: true },
        showFeaturedShops:{ type: Boolean, default: true },
        showNearbyShops:  { type: Boolean, default: true },
        showNearbyFeed:   { type: Boolean, default: true },
        showTestimonials: { type: Boolean, default: true },
        showOffers:       { type: Boolean, default: true },
      },
      default: () => ({}),
    },

    // ── Homepage Headers Configuration ────────────────────────────────────
    featuredProductsHeader: {
      type: {
        eyebrow: { type: String, default: "Editor's rail" },
        title:   { type: String, default: "Featured by local stylists" },
        copy:    { type: String, default: "Fresh pieces from verified boutiques, presented like a premium fashion floor." }
      },
      default: () => ({})
    },

    newArrivalsHeader: {
      type: {
        eyebrow: { type: String, default: "Just dropped" },
        title:   { type: String, default: "New arrivals worth opening first" },
        copy:    { type: String, default: "Recently added fashion from shops around you, ready for direct WhatsApp buying." }
      },
      default: () => ({})
    },

    featuredShopsHeader: {
      type: {
        eyebrow: { type: String, default: "Boutique discovery" },
        title:   { type: String, default: "Meet the shops behind the look" },
        copy:    { type: String, default: "Every storefront gets a premium brand moment so multi-vendor browsing feels polished and trusted." }
      },
      default: () => ({})
    },

    categoriesHeader: {
      type: {
        eyebrow: { type: String, default: "Shop by category" },
        title:   { type: String, default: "Find the rail that fits your mood" }
      },
      default: () => ({})
    },

    // ── Mood / Collections Section ─────────────────────────────────────────
    moodSection: {
      type: {
        kicker:       { type: String, default: 'Limited-time marketplace edit' },
        title:        { type: String, default: 'Build a full look from shops near you.' },
        copy:         { type: String, default: 'Discover fashion by mood, then message the seller directly to confirm sizing, availability, and styling details.' },
        buttonLabel:  { type: String, default: 'Shop collections' },
        buttonLink:   { type: String, default: '/products?search=collection' },
        moods: {
          type: [{
            icon: { type: String, default: 'Sparkles' },
            title: { type: String, default: '' },
            copy: { type: String, default: '' },
            to: { type: String, default: '' },
          }],
          default: [
            { icon: 'Sparkles', title: 'Occasion ready', copy: 'Party looks, statement dresses, and festive accents.', to: '/products?search=occasion' },
            { icon: 'BriefcaseBusiness', title: 'Work polish', copy: 'Smart layers and clean fits for weekdays.', to: '/products?search=formal' },
            { icon: 'Sun', title: 'Weekend ease', copy: 'Relaxed silhouettes for brunch, errands, and travel.', to: '/products?search=casual' },
            { icon: 'Heart', title: 'Giftable finds', copy: 'Accessories and standout pieces worth sharing.', to: '/products?search=gift' },
          ]
        }
      },
      default: () => ({})
    },

    // ── Features Section ───────────────────────────────────────────────────
    featuresSection: {
      type: {
        eyebrow: { type: String, default: 'Why shoppers stay' },
        title:   { type: String, default: 'A marketplace that feels like a fashion house' },
        features: {
          type: [{
            icon: { type: String, default: 'Sparkles' },
            title: { type: String, default: '' },
            desc: { type: String, default: '' }
          }],
          default: [
            { icon: 'Sparkles', title: 'Curated discovery', desc: 'Browse trend-led edits instead of endless unstyled product grids.' },
            { icon: 'BadgeCheck', title: 'Verified shops', desc: 'Approved sellers help every storefront feel reliable and real.' },
            { icon: 'MessageCircle', title: 'Direct buying', desc: 'Talk to boutiques instantly on WhatsApp before you buy.' },
            { icon: 'ShieldCheck', title: 'Local trust', desc: 'Shop fashion from nearby sellers with visible identity and details.' },
          ]
        }
      },
      default: () => ({})
    },

    // ── Testimonials (NEW dynamic section) ──────────────────────────────────
    testimonials: {
      type: [TestimonialSchema],
      default: [
        { quote: "Finding local ethnic boutique designs online was so tough until I found this platform. WhatsApp ordering is incredibly convenient!", author: "Priya Sharma", role: "Verified Shopper" },
        { quote: "As a boutique owner, this marketplace has given my shop a premium stage. Traffic has doubled and orders are direct and fast.", author: "Anjali Mehta", role: "Boutique Owner" }
      ]
    },

    // ── Offers (NEW dynamic section) ────────────────────────────────────────
    offers: {
      type: [OfferSchema],
      default: [
        { title: "First Order Discount", copy: "Get an extra discount on your very first booking", code: "WELCOME10", discount: "10% OFF", bgImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80", link: "/products" },
        { title: "Weekend Boutique Deal", copy: "Special curated designer picks from verified nearby stores", code: "WEEKEND15", discount: "15% OFF", bgImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", link: "/products" }
      ]
    },

    // ── Seller CTA Section ─────────────────────────────────────────────────
    sellerCta: {
      type: {
        eyebrow:  { type: String, default: 'For sellers' },
        title:    { type: String, default: 'Turn your shop into a premium digital storefront.' },
        copy:     { type: String, default: 'Upload products, build trust with a branded profile, and let shoppers contact you directly on WhatsApp.' },
        ctaLabel: { type: String, default: 'Register your shop' },
      },
      default: () => ({}),
    },

    // ── Custom Dynamic Branding Extensions ──────────────────────────────────
    typographyFont: { type: String, default: 'Outfit' },
    loadingText:    { type: String, default: 'Loading Curated Fashion...' },
    loadingBgColor: { type: String, default: '#ffffff' },
    hoverColor:     { type: String, default: '#6d28d9' },

    // ── Dynamic CMS Custom Pages ────────────────────────────────────────────
    customPages: {
      type: [CMSPageSchema],
      default: [
        {
          slug: 'about',
          title: 'About Us',
          content: 'Welcome to NearByDress, your premium destination for local boutique fashion. We connect independent fashion designers and local boutique owners directly with shoppers in their neighborhood.',
          isActive: true
        },
        {
          slug: 'privacy',
          title: 'Privacy Policy',
          content: 'At NearByDress, we respect your privacy. This policy outlines how we collect, store, and utilize your personal data to deliver highly optimized local shopping experiences safely.',
          isActive: true
        },
        {
          slug: 'terms',
          title: 'Terms of Service',
          content: 'By accessing or using the NearByDress platform, you agree to comply with our Terms of Service, which govern the relationship between customers, boutique sellers, and our hosting systems.',
          isActive: true
        },
        {
          slug: 'faq',
          title: 'Frequently Asked Questions (FAQ)',
          content: 'Find answers to common questions about ordering via WhatsApp, locating nearby boutiques, shipping radius verification, and seller registration guidelines.',
          isActive: true
        },
        {
          slug: 'help',
          title: 'Help & Support Center',
          content: 'Need assistance? Reach out to our dedicated support channels or browse our self-help guides for prompt answers to order tracking, shop approval, or registration issues.',
          isActive: true
        }
      ]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
