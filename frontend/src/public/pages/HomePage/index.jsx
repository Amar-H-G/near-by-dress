import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../../../core/contexts/useSettings';
import { getProducts } from '../../services/product.service';
import { getShops } from '../../../shared/services/shop.service';
import { usePageTransition } from '../../../shared/animations/usePageTransition';

// SEO — small, keep eager
import SEO from '../../../shared/seo/SEO';
import SchemaMarkup from '../../../shared/seo/SchemaMarkup';

// ── Eager imports for critical sections to maintain LCP ──
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CampaignSection from './CampaignSection';

// ── Below-fold sections — lazy-loaded ──
const FeaturedProducts    = lazy(() => import('./FeaturedProducts'));
const CategoriesSection   = lazy(() => import('./CategoriesSection'));
const MoodSection         = lazy(() => import('./MoodSection'));
const FeaturedShopsSection = lazy(() => import('./FeaturedShopsSection'));
const NearbyDiscoveryFeed = lazy(() => import('./NearbyDiscoveryFeed'));
const NearbyShopsSection  = lazy(() => import('./NearbyShopsSection'));
const SellerCtaSection    = lazy(() => import('./SellerCtaSection'));
const FooterSection       = lazy(() => import('./FooterSection'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));
const OffersSection       = lazy(() => import('./OffersSection'));

// ── Intersection-observer lazy mount ──
const LazySection = memo(({ children, fallback = null, rootMargin = '200px' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {visible ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
});
LazySection.displayName = 'LazySection';

const normalizeList = (payload, nestedKey) => {
  const data = payload?.data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[nestedKey])) return data[nestedKey];
  return [];
};

const HomePage = () => {
  const pageRef = usePageTransition();
  const { settings, categories } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchHomeData = async () => {
      const [featuredRes, arrivalsRes, shopsRes] = await Promise.allSettled([
        getProducts({ isFeatured: true, limit: 8 }),
        getProducts({ limit: 8, sort: 'latest' }),
        getShops({ limit: 6, status: 'approved' }),
      ]);

      if (!mounted) return;
      if (featuredRes.status === 'fulfilled') setFeaturedProducts(normalizeList(featuredRes.value, 'products'));
      if (arrivalsRes.status === 'fulfilled') setNewArrivals(normalizeList(arrivalsRes.value, 'products'));
      if (shopsRes.status === 'fulfilled') setFeaturedShops(normalizeList(shopsRes.value, 'shops'));
    };

    void fetchHomeData();
    return () => { mounted = false; };
  }, []);

  const pageKeywords = categories?.map(c => c.name).join(', ') || 'sarees, kurtis, boutiques, nearby fashion';

  // ── Builder Configs ──
  const sec = settings?.homepageSections || {};
  const order = settings?.homepageSectionsOrder || [
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
  ];

  // Headers configs
  const fHeader = settings?.featuredProductsHeader || {};
  const nHeader = settings?.newArrivalsHeader || {};

  // Render maps
  const renderSection = (key) => {
    switch (key) {
      case 'hero':
        return sec.showHero !== false ? <HeroSection key="hero" /> : null;

      case 'features':
        return sec.showFeatures !== false ? <FeaturesSection key="features" /> : null;

      case 'campaigns':
        return sec.showCampaigns !== false ? <CampaignSection key="campaigns" /> : null;

      case 'featuredProducts':
        return sec.showFeatured !== false ? (
          <LazySection key="featuredProducts">
            <FeaturedProducts
              products={featuredProducts}
              eyebrow={fHeader.eyebrow || "Editor's rail"}
              title={fHeader.title || "Featured by local stylists"}
              copy={fHeader.copy || "Fresh pieces from verified boutiques, presented like a premium fashion floor."}
            />
          </LazySection>
        ) : null;

      case 'categories':
        return (
          <LazySection key="categories">
            <CategoriesSection categories={categories} />
          </LazySection>
        );

      case 'newArrivals':
        return sec.showNewArrivals !== false ? (
          <LazySection key="newArrivals">
            <FeaturedProducts
              products={newArrivals}
              eyebrow={nHeader.eyebrow || "Just dropped"}
              title={nHeader.title || "New arrivals worth opening first"}
              copy={nHeader.copy || "Recently added fashion from shops around you, ready for direct WhatsApp buying."}
            />
          </LazySection>
        ) : null;

      case 'mood':
        return sec.showMoodSection !== false ? (
          <LazySection key="mood">
            <MoodSection />
          </LazySection>
        ) : null;

      case 'featuredShops':
        return sec.showFeaturedShops !== false ? (
          <LazySection key="featuredShops">
            <FeaturedShopsSection shops={featuredShops} />
          </LazySection>
        ) : null;

      case 'nearbyShops':
        return sec.showNearbyShops !== false ? (
          <LazySection key="nearbyShops" rootMargin="400px">
            <NearbyShopsSection />
          </LazySection>
        ) : null;

      case 'nearbyDiscovery':
        return sec.showNearbyFeed !== false ? (
          <LazySection key="nearbyDiscovery" rootMargin="400px">
            <NearbyDiscoveryFeed />
          </LazySection>
        ) : null;

      case 'testimonials':
        return sec.showTestimonials !== false ? (
          <LazySection key="testimonials">
            <TestimonialsSection />
          </LazySection>
        ) : null;

      case 'offers':
        return sec.showOffers !== false ? (
          <LazySection key="offers">
            <OffersSection />
          </LazySection>
        ) : null;

      case 'sellerCta':
        return sec.showSellerCta !== false ? (
          <LazySection key="sellerCta">
            <SellerCtaSection />
          </LazySection>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div ref={pageRef} className="marketplace-page">
      <SEO
        title="Home"
        description={settings?.seo?.homeDescription || undefined}
        keywords={`nearby dress shops, boutiques near me, ethnic wear near me, local fashion discovery, ${pageKeywords}`}
      />
      <SchemaMarkup type="website" data={{ _id: 'global' }} />

      {/* Render sections in the precise order specified by the builder */}
      {order.map((key) => renderSection(key))}

      <LazySection>
        <FooterSection />
      </LazySection>
    </div>
  );
};

export default HomePage;
