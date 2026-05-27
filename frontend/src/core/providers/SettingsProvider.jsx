/**
 * SettingsProvider.jsx
 * Global settings provider — fetches ALL platform settings, categories, and filters
 * from the backend on mount and exposes them via SettingsContext.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api/client';
import { SettingsContext } from '../contexts/settings-context';
import NBDLogo from '../../shared/components/NBDLogo';

// ── Fallback defaults (mirrors DB schema defaults) ─────────────────────────────
const DEFAULT_SETTINGS = {
  siteName:       'NearByDress',
  siteTagline:    'Fashion Marketplace',
  siteDescriptor: 'Hyperlocal Fashion Marketplace',
  logo:           null,
  favicon:        null,

  primaryColor:   '#7c3aed',
  secondaryColor: '#10B981',
  accentColor:    '#f59e0b',
  typographyFont: 'Outfit',
  loadingText:    'Loading Curated Fashion...',
  loadingBgColor: '#ffffff',
  hoverColor:     '#6d28d9',

  contactEmail:   'support@nearbydress.com',
  contactPhone:   '',
  supportLabel:   'Contact Support',
  address:        '',

  footerTagline:  'Premium local fashion discovery, verified shops, and direct buying in one marketplace.',
  footerCopyright:'',

  socialLinks: { facebook: '', instagram: '', twitter: '', youtube: '', pinterest: '' },

  seo: {
    homeTitle:       'NearByDress — Hyperlocal Fashion Marketplace',
    homeDescription: 'Discover local fashion shops near you and shop directly via WhatsApp.',
    homeKeywords:    'fashion, local shops, marketplace, boutique, ethnic wear, western wear',
    ogImage:         '',
  },

  whatsapp: {
    adminNumber:    '',
    supportMessage: "Hi Support, I'm reaching out about NBD.",
    orderPrefix:    '🛍️ New Order via NearByDress',
    orderIntro:     'Hello NearByDress Admin Team,',
    orderOutro:     'Please confirm availability.',
  },

  heroBanner: {
    eyebrow:     'Curated multi-vendor fashion',
    title:       'Your city.\nYour new wardrobe.',
    subtitle:    'Find verified local boutiques, fresh drops, and seasonal campaigns in one premium marketplace.',
    ctaPrimary:  'Shop the edit',
    ctaSecondary:'Discover shops',
    stats: [
      { value: '500+', label: 'Local shops' },
      { value: '10K+', label: 'Fashion finds' },
      { value: '50+',  label: 'Cities served' },
    ],
  },

  campaigns: [
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
  ],

  announcementBar: { enabled: false, text: '', color: '#7c3aed', link: '' },

  locationDefaults: {
    defaultPincode: '',
    defaultCity:    '',
    defaultState:   '',
    defaultRadius:  10,
    maxRadius:      50,
  },

  homepageSectionsOrder: [
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
  ],

  homepageSections: {
    showHero:         true,
    showFeatures:     true,
    showCampaigns:    true,
    showMoodSection:  true,
    showSellerCta:    true,
    showNewArrivals:  true,
    showFeatured:     true,
    showFeaturedShops:true,
    showNearbyShops:  true,
    showNearbyFeed:   true,
    showTestimonials: true,
    showOffers:       true,
  },

  featuredProductsHeader: {
    eyebrow: "Editor's rail",
    title:   "Featured by local stylists",
    copy:    "Fresh pieces from verified boutiques, presented like a premium fashion floor."
  },

  newArrivalsHeader: {
    eyebrow: "Just dropped",
    title:   "New arrivals worth opening first",
    copy:    "Recently added fashion from shops around you, ready for direct WhatsApp buying."
  },

  featuredShopsHeader: {
    eyebrow: "Boutique discovery",
    title:   "Meet the shops behind the look",
    copy:    "Every storefront gets a premium brand moment so multi-vendor browsing feels polished and trusted."
  },

  categoriesHeader: {
    eyebrow: "Shop by category",
    title:   "Find the rail that fits your mood"
  },

  moodSection: {
    kicker:       'Limited-time marketplace edit',
    title:        'Build a full look from shops near you.',
    copy:         'Discover fashion by mood, then message the seller directly to confirm sizing, availability, and styling details.',
    buttonLabel:  'Shop collections',
    buttonLink:   '/products?search=collection',
    moods: [
      { icon: 'Sparkles', title: 'Occasion ready', copy: 'Party looks, statement dresses, and festive accents.', to: '/products?search=occasion' },
      { icon: 'BriefcaseBusiness', title: 'Work polish', copy: 'Smart layers and clean fits for weekdays.', to: '/products?search=formal' },
      { icon: 'Sun', title: 'Weekend ease', copy: 'Relaxed silhouettes for brunch, errands, and travel.', to: '/products?search=casual' },
      { icon: 'Heart', title: 'Giftable finds', copy: 'Accessories and standout pieces worth sharing.', to: '/products?search=gift' }
    ]
  },

  featuresSection: {
    eyebrow: 'Why shoppers stay',
    title:   'A marketplace that feels like a fashion house',
    features: [
      { icon: 'Sparkles', title: 'Curated discovery', desc: 'Browse trend-led edits instead of endless unstyled product grids.' },
      { icon: 'BadgeCheck', title: 'Verified shops', desc: 'Approved sellers help every storefront feel reliable and real.' },
      { icon: 'MessageCircle', title: 'Direct buying', desc: 'Talk to boutiques instantly on WhatsApp before you buy.' },
      { icon: 'ShieldCheck', title: 'Local trust', desc: 'Shop fashion from nearby sellers with visible identity and details.' }
    ]
  },

  testimonials: [
    { quote: "Finding local ethnic boutique designs online was so tough until I found this platform. WhatsApp ordering is incredibly convenient!", author: "Priya Sharma", role: "Verified Shopper" },
    { quote: "As a boutique owner, this marketplace has given my shop a premium stage. Traffic has doubled and orders are direct and fast.", author: "Anjali Mehta", role: "Boutique Owner" }
  ],

  offers: [
    { title: "First Order Discount", copy: "Get an extra discount on your very first booking", code: "WELCOME10", discount: "10% OFF", bgImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80", link: "/products" },
    { title: "Weekend Boutique Deal", copy: "Special curated designer picks from verified nearby stores", code: "WEEKEND15", discount: "15% OFF", bgImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80", link: "/products" }
  ],

  sellerCta: {
    eyebrow:  'For sellers',
    title:    'Turn your shop into a premium digital storefront.',
    copy:     'Upload products, build trust with a branded profile, and let shoppers contact you directly on WhatsApp.',
    ctaLabel: 'Register your shop',
  },
  customPages: [
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
};

// ── CSS custom property injection ──────────────────────────────────────────────
const applyTypographyFont = (fontName) => {
  if (!fontName) return;
  const formatted = fontName.replace(/\s+/g, '+');
  let el = document.getElementById('nbd-dynamic-font');
  if (!el) {
    el = document.createElement('link');
    el.id = 'nbd-dynamic-font';
    el.rel = 'stylesheet';
    document.head.appendChild(el);
  }
  el.href = `https://fonts.googleapis.com/css2?family=${formatted}:wght@300;400;500;600;700;800&display=swap`;
  document.documentElement.style.setProperty('--font-family', `"${fontName}", sans-serif`);
};

const applyThemeColors = (s) => {
  if (s.primaryColor)   document.documentElement.style.setProperty('--primary', s.primaryColor);
  if (s.secondaryColor) document.documentElement.style.setProperty('--accent',  s.secondaryColor);
  if (s.accentColor)    document.documentElement.style.setProperty('--accent2', s.accentColor);
  if (s.hoverColor)     document.documentElement.style.setProperty('--primary-hover', s.hoverColor);
  if (s.typographyFont) applyTypographyFont(s.typographyFont);
};

// ── Dynamic favicon injection ──────────────────────────────────────────────────
const applyFavicon = (faviconUrl) => {
  if (!faviconUrl) return;
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
};

// ── Dynamic document title ─────────────────────────────────────────────────────
const applyDocumentTitle = (s) => {
  if (s.seo?.homeTitle) {
    document.title = s.seo.homeTitle;
  } else if (s.siteName) {
    document.title = `${s.siteName} — ${s.siteDescriptor || 'Local Fashion Marketplace'}`;
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings]   = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters]     = useState([]);
  const [loading, setLoading]     = useState(true);

  const applyAll = (data) => {
    applyThemeColors(data);
    applyFavicon(data.favicon);
    applyDocumentTitle(data);
  };

  useEffect(() => {
    let mounted = true;

    const fetchGlobalData = async () => {
      try {
        const [settingsRes, categoriesRes, filtersRes] = await Promise.all([
          API.get('/settings'),
          API.get('/categories'),
          API.get('/filters'),
        ]);

        if (!mounted) return;
        const settingsData = settingsRes.data.data;
        setSettings(settingsData);
        setCategories(categoriesRes.data.data);
        setFilters(filtersRes.data.data || []);
        applyAll(settingsData);
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to load global settings', error);
        setSettings(DEFAULT_SETTINGS);
        applyAll(DEFAULT_SETTINGS);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchGlobalData();
    return () => { mounted = false; };
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const { data } = await API.get('/settings');
      setSettings(data.data);
      applyAll(data.data);
    } catch (err) {
      console.error('Failed to refresh settings', err);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch (err) {
      console.error('Failed to refresh categories', err);
    }
  }, []);

  const refreshFilters = useCallback(async () => {
    try {
      const { data } = await API.get('/filters');
      setFilters(data.data || []);
    } catch (err) {
      console.error('Failed to refresh filters', err);
    }
  }, []);

  // Merge DB settings with in-memory defaults so consumers always get a full object
  const mergedSettings = useMemo(() => {
    if (!settings) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      seo:                   { ...DEFAULT_SETTINGS.seo,                   ...(settings.seo || {}) },
      whatsapp:              { ...DEFAULT_SETTINGS.whatsapp,              ...(settings.whatsapp || {}) },
      heroBanner:            { ...DEFAULT_SETTINGS.heroBanner,            ...(settings.heroBanner || {}) },
      socialLinks:           { ...DEFAULT_SETTINGS.socialLinks,           ...(settings.socialLinks || {}) },
      announcementBar:       { ...DEFAULT_SETTINGS.announcementBar,       ...(settings.announcementBar || {}) },
      locationDefaults:      { ...DEFAULT_SETTINGS.locationDefaults,      ...(settings.locationDefaults || {}) },
      homepageSectionsOrder: settings.homepageSectionsOrder?.length ? settings.homepageSectionsOrder : DEFAULT_SETTINGS.homepageSectionsOrder,
      homepageSections:      { ...DEFAULT_SETTINGS.homepageSections,      ...(settings.homepageSections || {}) },
      featuredProductsHeader:{ ...DEFAULT_SETTINGS.featuredProductsHeader,...(settings.featuredProductsHeader || {}) },
      newArrivalsHeader:     { ...DEFAULT_SETTINGS.newArrivalsHeader,     ...(settings.newArrivalsHeader || {}) },
      featuredShopsHeader:   { ...DEFAULT_SETTINGS.featuredShopsHeader,   ...(settings.featuredShopsHeader || {}) },
      categoriesHeader:      { ...DEFAULT_SETTINGS.categoriesHeader,      ...(settings.categoriesHeader || {}) },
      moodSection:           {
        ...DEFAULT_SETTINGS.moodSection,
        ...(settings.moodSection || {}),
        moods: settings.moodSection?.moods?.length ? settings.moodSection.moods : DEFAULT_SETTINGS.moodSection.moods
      },
      featuresSection:       {
        ...DEFAULT_SETTINGS.featuresSection,
        ...(settings.featuresSection || {}),
        features: settings.featuresSection?.features?.length ? settings.featuresSection.features : DEFAULT_SETTINGS.featuresSection.features
      },
      testimonials:          settings.testimonials?.length ? settings.testimonials : DEFAULT_SETTINGS.testimonials,
      offers:                settings.offers?.length ? settings.offers : DEFAULT_SETTINGS.offers,
      sellerCta:             { ...DEFAULT_SETTINGS.sellerCta,             ...(settings.sellerCta || {}) },
      campaigns:             settings.campaigns?.length ? settings.campaigns : DEFAULT_SETTINGS.campaigns,
      customPages:           settings.customPages?.length ? settings.customPages : DEFAULT_SETTINGS.customPages,
    };
  }, [settings]);

  const value = useMemo(
    () => ({
      settings: mergedSettings,
      categories,
      filters,
      refreshSettings,
      refreshCategories,
      refreshFilters,
      // Convenience aliases
      DEFAULT_SETTINGS,
    }),
    [mergedSettings, categories, filters, refreshSettings, refreshCategories, refreshFilters]
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: mergedSettings.loadingBgColor || '#ffffff',
        gap: '24px'
      }}>
        <div style={{ animation: 'pulseLogo 2.5s infinite ease-in-out' }}>
          <NBDLogo variant="loading" noLink />
        </div>
        <div style={{
          width: '28px',
          height: '28px',
          border: '1.5px solid rgba(0, 0, 0, 0.06)',
          borderTopColor: mergedSettings.primaryColor || '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }} />
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'rgba(0, 0, 0, 0.65)',
          fontFamily: mergedSettings.typographyFont ? `"${mergedSettings.typographyFont}", sans-serif` : 'inherit'
        }}>
          {mergedSettings.loadingText || 'Loading Curated Fashion...'}
        </span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseLogo {
            0%, 100% { opacity: 0.8; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
