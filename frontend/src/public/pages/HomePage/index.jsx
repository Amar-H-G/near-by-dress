import { useEffect, useState } from 'react';
import { useSettings } from '../../../core/contexts/useSettings';
import { getProducts } from '../../services/product.service';
import { getShops } from '../../../shared/services/shop.service';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import FeaturedProducts from './FeaturedProducts';
import CategoriesSection from './CategoriesSection';
import CampaignSection from './CampaignSection';
import FeaturedShopsSection from './FeaturedShopsSection';
import MoodSection from './MoodSection';
import SellerCtaSection from './SellerCtaSection';
import FooterSection from './FooterSection';

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

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="marketplace-page">
      <HeroSection siteName={settings?.siteName || 'NearByDress'} />
      <FeaturesSection siteName={settings?.siteName || 'NearByDress'} />
      <CampaignSection />
      <FeaturedProducts
        products={featuredProducts}
        eyebrow="Editor's rail"
        title="Featured by local stylists"
        copy="Fresh pieces from verified boutiques, presented like a premium fashion floor."
      />
      <CategoriesSection categories={categories} />
      <FeaturedProducts
        products={newArrivals}
        eyebrow="Just dropped"
        title="New arrivals worth opening first"
        copy="Recently added fashion from shops around you, ready for direct WhatsApp buying."
      />
      <MoodSection />
      <FeaturedShopsSection shops={featuredShops} />
      <SellerCtaSection />
      <FooterSection settings={settings} />
    </div>
  );
};

export default HomePage;
