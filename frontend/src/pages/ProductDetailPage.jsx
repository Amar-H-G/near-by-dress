import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../services/product.service';
import LoadingSpinner from '../components/LoadingSpinner';
import { MessageCircle, Store, MapPin, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getProduct(id);
        setProduct(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error || !product) return (
    <div style={{ paddingTop: 100, textAlign: 'center', padding: '120px 24px' }}>
      <p style={{ color: '#EF4444', fontSize: 18, marginBottom: 16 }}>{error || 'Product not found'}</p>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  const { name, description, price, discountPrice, images, category, sizes, colors, stock, shop } = product;
  const hasDiscount = discountPrice && discountPrice < price;
  const displayPrice = hasDiscount ? discountPrice : price;
  const imgs = images?.length ? images : ['https://placehold.co/600x700/1A1033/9B8EC4?text=No+Image'];

  const whatsappUrl = shop?.whatsappNumber
    ? `https://wa.me/${shop.whatsappNumber.replace(/\D/g, '')}?text=Hi! I'm interested in "${name}" - Price: ₹${displayPrice}`
    : null;

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: 'var(--text-faint)' }}>
          <Link to="/" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--text-faint)', textDecoration: 'none' }}>Products</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-muted)' }}>{name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{
              aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden',
              background: 'var(--surface)', marginBottom: 16, position: 'relative',
            }}>
              <img
                src={imgs[activeImg]}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {imgs.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((a) => (a - 1 + imgs.length) % imgs.length)}
                    style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(10,6,20,0.7)', border: '1px solid var(--border)',
                      borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text)',
                    }}
                    id="img-prev"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((a) => (a + 1) % imgs.length)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(10,6,20,0.7)', border: '1px solid var(--border)',
                      borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text)',
                    }}
                    id="img-next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {imgs.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {imgs.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 64, height: 64, objectFit: 'cover', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${i === activeImg ? 'var(--primary)' : 'var(--border)'}`,
                      opacity: i === activeImg ? 1 : 0.6,
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-faint)', background: 'var(--surface)', padding: '4px 12px', borderRadius: 999 }}>
                <Tag size={11} /> {category}
              </span>
              {stock > 0 ? (
                <span className="badge badge-approved">In Stock ({stock})</span>
              ) : (
                <span className="badge badge-rejected">Out of Stock</span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: 20, lineHeight: 1.3 }}>{name}</h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: hasDiscount ? '#10B981' : 'var(--primary-light)', fontFamily: 'Outfit, sans-serif' }}>
                ₹{displayPrice?.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: 20, color: 'var(--text-faint)', textDecoration: 'line-through' }}>₹{price?.toLocaleString()}</span>
                  <span style={{ fontSize: 14, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 10px', borderRadius: 999 }}>
                    {Math.round(((price - discountPrice) / price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {description && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24, fontSize: 15 }}>{description}</p>
            )}

            {/* Sizes */}
            {sizes?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>SIZE</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`btn ${selectedSize === s ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '8px 16px', fontSize: 13, minWidth: 44 }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>COLOR</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`btn ${selectedColor === c ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '7px 16px', fontSize: 13 }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#fff', padding: '14px 28px', fontSize: 16,
                  boxShadow: '0 8px 24px rgba(37,211,102,0.35)',
                  marginBottom: 20, textDecoration: 'none', width: '100%',
                }}
                id="whatsapp-cta-main"
              >
                <MessageCircle size={20} />
                Contact Shop on WhatsApp
              </a>
            )}

            {/* Shop info */}
            {shop && (
              <Link to={`/shops/${shop._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={shop.logo || `https://placehold.co/60x60/231845/9B8EC4?text=${shop.name?.charAt(0)}`}
                    alt={shop.name}
                    style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>{shop.name}</p>
                    {shop.city && (
                      <p style={{ fontSize: 13, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} /> {shop.city}
                      </p>
                    )}
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ fontSize: 12, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Store size={12} /> View Shop →
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
