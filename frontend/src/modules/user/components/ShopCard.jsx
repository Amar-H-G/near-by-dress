import { Link } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';

const ShopCard = ({ shop }) => {
  const { _id, name, description, city, logo, status, category } = shop;
  const logoSrc = logo || `https://placehold.co/200x200/F3F4F6/9CA3AF?text=${encodeURIComponent(name?.charAt(0) || 'S')}`;

  return (
    <Link to={`/shops/${_id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, cursor: 'pointer' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img
            src={logoSrc}
            alt={name}
            style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--border)' }}
            loading="lazy"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {status && (
                <span className={`badge badge-${status}`}>{status}</span>
              )}
              {category && (
                <span style={{ fontSize: 11, color: 'var(--text-faint)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999 }}>
                  {category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto' }}>
          {city && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-faint)' }}>
              <MapPin size={12} /> {city}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-faint)' }}>
            <Package size={12} /> View products
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
