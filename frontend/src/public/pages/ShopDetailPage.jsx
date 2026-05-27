import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, MapPin, MessageCircle, Package, Sparkles, Store } from 'lucide-react';
import { getShop, getShopProducts } from '../../shared/services/shop.service.js';
import ProductCard from '../components/ProductCard';
import Pagination from '../../shared/components/Pagination';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/EmptyState';

import { useOrderFlow } from '../../shared/order/useOrderFlow';

import ShopHero from '../../features/shops/components/ShopHero';
import ShopOverview from '../../features/shops/components/ShopOverview';
import ShopStats from '../../features/shops/components/ShopStats';
import ShopGallery from '../../features/shops/components/ShopGallery';
import ShopCollections from '../../features/shops/components/ShopCollections';

// SEO & Schema Injections
import SEO from '../../shared/seo/SEO';
import SchemaMarkup from '../../shared/seo/SchemaMarkup';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=82';

const normalizeProducts = (payload) => {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.products)) return payload.data.products;
  return [];
};

const ShopDetailPage = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const { startOrderFlow } = useOrderFlow();

  useEffect(() => {
    let mounted = true;

    const fetchShop = async () => {
      setLoading(true);
      try {
        const { data } = await getShop(id);
        if (mounted) setShop(data.data);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Shop not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchShop();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      setProdLoading(true);
      try {
        const { data } = await getShopProducts(id, { page, limit: 12 });
        if (!mounted) return;
        const productList = normalizeProducts(data);
        setProducts(productList);
        setPagination({
          page: data.page || data.data?.page || page,
          totalPages: data.totalPages || data.data?.totalPages || 1,
        });
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setProdLoading(false);
      }
    };

    void fetchProducts();

    return () => {
      mounted = false;
    };
  }, [id, page]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error || !shop) {
    return (
      <div className="marketplace-page luxury-shell public-error-state">
        <p>{error || 'Shop not found'}</p>
        <Link to="/shops" className="luxury-btn luxury-btn-primary">Browse shops</Link>
      </div>
    );
  }

  // Shop inquiry product object for the modal
  const shopOrderProduct = shop ? {
    name: `Shop Inquiry — ${shop.name}`,
    price: null,
    discountPrice: null,
    image: shop.logo || shop.coverImage,
    shopName: shop.name,
    shop,
  } : null;

  const breadcrumbs = [
    { name: 'Home', url: window.location.origin },
    { name: 'Shops', url: `${window.location.origin}/shops` },
    { name: shop.name, url: window.location.href }
  ];

  return (
    <div className="marketplace-page">
      <SEO
        title={shop.name}
        description={shop.description || `Visit ${shop.name} boutique in ${shop.city || 'your city'}. Explore customized styles, ethnic wear, sarees, kurtis, and designer wear.`}
        keywords={`${shop.name}, fashion shop near me, clothing store ${shop.city || ''}, boutique ${shop.pincode || ''}, local boutiques`}
        ogImage={shop.logo || shop.coverImage}
      />
      <SchemaMarkup type="localbusiness" data={shop} />
      <SchemaMarkup type="breadcrumbs" data={breadcrumbs} />

      <ShopHero 
        shop={shop} 
        onInquiryClick={() => startOrderFlow(shopOrderProduct)} 
      />

      <ShopOverview shop={shop} />

      <ShopStats productsCount={products.length} />

      <ShopCollections />

      <ShopGallery />

      <main className="container shopfront-content" style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
        <div className="listing-results-header" style={{ marginBottom: '32px' }}>
          <div>
            <span className="luxury-eyebrow">Atelier collection</span>
            <h2 className="luxury-title luxury-title-sm" style={{ fontSize: '24px' }}>Boutique Styles</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>{products.length} active pieces shown</p>
        </div>

        {prodLoading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState icon="" title="No products yet" message="This shop has not added any products yet." />
        ) : (
          <>
            <div className="fashion-product-grid">
              {products.map((product) => <ProductCard key={product._id} product={{ ...product, shop }} />)}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                window.scrollTo({ top: 900, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </main>


    </div>
  );
};

export default ShopDetailPage;
