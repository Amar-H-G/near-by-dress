import { Link } from 'react-router-dom';
import { MessageCircle, Tag, Store } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { _id, name, price, discountPrice, images, category, shop } = product;

  const displayPrice = discountPrice && discountPrice < price ? discountPrice : price;
  const hasDiscount = discountPrice && discountPrice < price;
  const image = images?.[0] || 'https://placehold.co/400x500/F3F4F6/9CA3AF?text=No+Image';

  const whatsappUrl = shop?.whatsappNumber
    ? `https://wa.me/${shop.whatsappNumber.replace(/\D/g, '')}?text=Hi! I'm interested in "${name}"`
    : null;

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <Link to={`/products/${_id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: 'var(--surface-2)' }}>
          <img
            src={image}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            loading="lazy"
          />
          {hasDiscount && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'linear-gradient(135deg, #EF4444, #EC4899)',
              color: '#fff', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            }}>
              {Math.round(((price - discountPrice) / price) * 100)}% OFF
            </div>
          )}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)',
            padding: '3px 10px', borderRadius: 999, border: '1px solid var(--border)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
              <Tag size={10} /> {category}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link to={`/products/${_id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: hasDiscount ? '#059669' : 'var(--primary-dark)' }}>
            ₹{displayPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span style={{ fontSize: 13, color: 'var(--text-faint)', textDecoration: 'line-through' }}>
              ₹{price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Shop */}
        {shop && (
          <Link to={`/shops/${shop._id}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
              <Store size={12} color="var(--text-faint)" />
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{shop.name}</span>
              {shop.city && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>· {shop.city}</span>}
            </div>
          </Link>
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
              color: '#fff', marginTop: 8, textDecoration: 'none', fontSize: 13,
              padding: '9px 14px',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
            }}
            id={`whatsapp-${_id}`}
          >
            <MessageCircle size={15} />
            WhatsApp Shop
          </a>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
