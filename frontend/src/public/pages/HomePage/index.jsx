import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useSettings } from '../../../core/contexts/useSettings';
import API from '../../../core/api/client';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import FeaturedProducts from './FeaturedProducts';
import CategoriesSection from './CategoriesSection';
import SellerCtaSection from './SellerCtaSection';
import FooterSection from './FooterSection';

const HomePage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  const { settings, categories } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    API.get('/products', { params: { isFeatured: true, limit: 8 } })
      .then((res) => setFeaturedProducts(res.data.data.products || []))
      .catch((err) => console.error(err));

    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
      gsap.fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.25, ease: 'power3.out' });
      gsap.fromTo('.hero-ctas', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power3.out' });
      gsap.fromTo('.hero-stats', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.55, ease: 'power3.out' });
      gsap.fromTo('.feature-card', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef}>
      <HeroSection />
      <FeaturesSection ref={featuresRef} siteName={settings?.siteName || 'NearByDress'} />
      <FeaturedProducts products={featuredProducts} />
      <CategoriesSection categories={categories} />
      <SellerCtaSection />
      <FooterSection settings={settings} />
    </div>
  );
};

export default HomePage;
