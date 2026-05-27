import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, MapPin, MessageCircle, Package, Sparkles, Store } from 'lucide-react';
import { getShop, getShopProducts } from '../../shared/services/shop.service.js';
import ProductCard from '../components/ProductCard';
import Pagination from '../../shared/components/Pagination';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import EmptyState from '../../shared/components/EmptyState';

const WhatsAppOrderModal = lazy(() => import('../../shared/whatsapp/WhatsAppOrderModal'));

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
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const openOrderModal = useCallback(() => setOrderModalOpen(true), []);
  const closeOrderModal = useCallback(() => setOrderModalOpen(false), []);

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

      <header className="shopfront-hero">
        <img src={shop.coverImage || DEFAULT_COVER} alt="" />
        <div className="container shopfront-card">
          <img
            src={shop.logo || `https://placehold.co/180x180/f0ece8/756f72?text=${encodeURIComponent(shop.name?.charAt(0) || 'S')}`}
            alt={shop.name}
            className="shopfront-logo"
          />
          <div>
            <span className="luxury-eyebrow fashion-hero-kicker">
              <Sparkles size={14} /> Seller storefront
            </span>
            <h1>{shop.name}</h1>
            <div className="shopfront-meta">
              {shop.status && (
                <span>
                  <BadgeCheck size={14} /> {shop.status}
                </span>
              )}
              {shop.city && (
                <span>
                  <MapPin size={14} /> {shop.city}
                </span>
              )}
              {shop.category && (
                <span>
                  <Store size={14} /> {shop.category}
                </span>
              )}
              <span>
                <Package size={14} /> {products.length} products
              </span>
            </div>
            {shop.description && <p className="shopfront-description">{shop.description}</p>}
          </div>
          {(
            <a
              href="#whatsapp-order"
              onClick={(e) => { e.preventDefault(); openOrderModal(); }}
              className="fashion-whatsapp shopfront-whatsapp"
              id="shop-whatsapp-btn"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          )}
        </div>
      </header>

      <main className="container shopfront-content">
        <div className="listing-results-header">
          <div>
            <span className="luxury-eyebrow">Shop collection</span>
            <h2 className="luxury-title luxury-title-sm">Products from {shop.name}</h2>
          </div>
          <p>{products.length} styles shown</p>
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
                window.scrollTo({ top: 420, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </main>

      {/* WhatsApp Order Modal */}
      <Suspense fallback={null}>
        <WhatsAppOrderModal
          isOpen={orderModalOpen}
          onClose={closeOrderModal}
          product={shopOrderProduct}
        />
      </Suspense>
    </div>
  );
};

export default ShopDetailPage;
