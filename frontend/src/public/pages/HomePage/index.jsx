import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '../../../core/contexts/useSettings';
import { getProducts } from '../../services/product.service';
import { getShops } from '../../../shared/services/shop.service';

// ── Critical above-fold sections — eagerly imported ───────────────────────
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import CampaignSection from './CampaignSection';

// ── Below-fold sections — lazy-loaded to reduce initial JS parse time ─────
const FeaturedProducts    = lazy(() => import('./FeaturedProducts'));
const CategoriesSection   = lazy(() => import('./CategoriesSection'));
const MoodSection         = lazy(() => import('./MoodSection'));
const FeaturedShopsSection = lazy(() => import('./FeaturedShopsSection'));
const NearbyDiscoveryFeed = lazy(() => import('./NearbyDiscoveryFeed'));
const NearbyShopsSection  = lazy(() => import('./NearbyShopsSection'));
const SellerCtaSection    = lazy(() => import('./SellerCtaSection'));
const FooterSection       = lazy(() => import('./FooterSection'));
const WhatsAppOrderModal  = lazy(() => import('../../../shared/whatsapp/WhatsAppOrderModal'));

// SEO — small, keep eager
import SEO from '../../../shared/seo/SEO';
import SchemaMarkup from '../../../shared/seo/SchemaMarkup';
import { BRAND } from '../../../shared/config/branding';

// ── Intersection-observer lazy mount — only render when near viewport ─────
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
  const { settings, categories } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);
  const [orderModal, setOrderModal] = useState({ open: false, product: null });

  const openOrderModal = useCallback((product) => setOrderModal({ open: true, product }), []);
  const closeOrderModal = useCallback(() => setOrderModal({ open: false, product: null }), []);

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

  return (
    <div className="marketplace-page">
      <SEO
        title="Home"
        description={settings?.description || `${BRAND.full} (${BRAND.short}) - Discover and buy premium fashion wear, sarees, kurtis, and designer wear from boutiques and tailors near you.`}
        keywords={`nearby dress shops, boutiques near me, ethnic wear near me, local fashion discovery, ${pageKeywords}`}
      />
      <SchemaMarkup type="website" data={{ _id: 'global' }} />

      {/* ── Above fold: eagerly render, critical for LCP ── */}
      <HeroSection />
      <FeaturesSection />
      <CampaignSection />

      {/* ── Below fold: lazy-mount via IntersectionObserver ── */}
      <LazySection>
        <FeaturedProducts
          products={featuredProducts}
          eyebrow="Editor's rail"
          title="Featured by local stylists"
          copy="Fresh pieces from verified boutiques, presented like a premium fashion floor."
          onOrderClick={openOrderModal}
        />
      </LazySection>

      <LazySection>
        <CategoriesSection categories={categories} />
      </LazySection>

      <LazySection>
        <FeaturedProducts
          products={newArrivals}
          eyebrow="Just dropped"
          title="New arrivals worth opening first"
          copy="Recently added fashion from shops around you, ready for direct WhatsApp buying."
          onOrderClick={openOrderModal}
        />
      </LazySection>

      <LazySection>
        <MoodSection />
      </LazySection>

      <LazySection>
        <FeaturedShopsSection shops={featuredShops} />
      </LazySection>

      <LazySection rootMargin="400px">
        <NearbyShopsSection />
      </LazySection>

      <LazySection rootMargin="400px">
        <NearbyDiscoveryFeed />
      </LazySection>

      <LazySection>
        <SellerCtaSection />
      </LazySection>

      <LazySection>
        <FooterSection settings={settings} />
      </LazySection>

      {/* Shared WhatsApp Order Modal — used by all homepage product cards */}
      <Suspense fallback={null}>
        <WhatsAppOrderModal
          isOpen={orderModal.open}
          onClose={closeOrderModal}
          product={orderModal.product}
        />
      </Suspense>
    </div>
  );
};

export default HomePage;
