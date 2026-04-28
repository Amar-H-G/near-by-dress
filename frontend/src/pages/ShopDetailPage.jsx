import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShop, getShopProducts } from '../services/shop.service';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { MapPin, MessageCircle, Store } from 'lucide-react';

const ShopDetailPage = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getShop(id);
        setShop(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Shop not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  useEffect(() => {
    const fetch = async () => {
      setProdLoading(true);
      try {
        const { data } = await getShopProducts(id, { page, limit: 12 });
        setProducts(data.data);
        setPagination({ page: data.page, totalPages: data.totalPages });
      } catch (_) {}
      finally { setProdLoading(false); }
    };
    fetch();
  }, [id, page]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error || !shop) return (
    <div style={{ paddingTop: 100, textAlign: 'center', padding: '120px 24px' }}>
      <p style={{ color: '#EF4444', fontSize: 18, marginBottom: 16 }}>{error || 'Shop not found'}</p>
      <Link to="/shops" className="btn btn-primary">Browse Shops</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      {/* Cover */}
      <div style={{
        height: 220, background: shop.coverImage
          ? `url(${shop.coverImage}) center/cover`
          : 'linear-gradient(135deg, var(--primary-dark), #EC4899)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,20,0.5)' }} />
      </div>

      <div className="container" style={{ position: 'relative', marginTop: -56, paddingBottom: 80 }}>
        {/* Shop header */}
        <div className="glass-strong" style={{ borderRadius: 20, padding: '24px 28px', marginBottom: 40, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end' }}>
          <img
            src={shop.logo || `https://placehold.co/100x100/231845/9B8EC4?text=${shop.name?.charAt(0)}`}
            alt={shop.name}
            style={{ width: 88, height: 88, borderRadius: 16, objectFit: 'cover', border: '3px solid var(--border)', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: 6 }}>{shop.name}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <span className={`badge badge-${shop.status}`}>{shop.status}</span>
              {shop.city && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                  <MapPin size={12} /> {shop.city}
                </span>
              )}
              {shop.category && (
                <span style={{ fontSize: 12, color: 'var(--text-faint)', background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 999 }}>{shop.category}</span>
              )}
            </div>
            {shop.description && (
              <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: 14, lineHeight: 1.6, maxWidth: 600 }}>{shop.description}</p>
            )}
          </div>
          {shop.whatsappNumber && (
            <a
              href={`https://wa.me/${shop.whatsappNumber.replace(/\D/g, '')}?text=Hi! I found your shop on NearByDress`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', padding: '12px 24px', textDecoration: 'none', flexShrink: 0 }}
              id="shop-whatsapp-btn"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          )}
        </div>

        {/* Products */}
        <h2 style={{ fontSize: 24, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Store size={22} style={{ color: 'var(--primary-light)' }} /> Shop Products
        </h2>

        {prodLoading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <EmptyState icon="📦" title="No products yet" message="This shop hasn't added any products yet" />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
              {products.map((p) => <ProductCard key={p._id} product={{ ...p, shop }} />)}
            </div>
            <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 400, behavior: 'smooth' }); }} />
          </>
        )}
      </div>
    </div>
  );
};

export default ShopDetailPage;
