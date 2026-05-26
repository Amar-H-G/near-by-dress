import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Package, Store } from 'lucide-react';
import { useLocation } from '../../core/contexts/useLocation';
import { haversineDistance, formatDistance } from '../../shared/location/utils/geoUtils';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=900&q=78';

const ShopCard = ({ shop }) => {
  const { _id, name, description, city, logo, status, category, coverImage } = shop;
  const { location: userLoc } = useLocation();
  
  const logoSrc = logo || `https://placehold.co/200x200/f0ece8/756f72?text=${encodeURIComponent(name?.charAt(0) || 'S')}`;
  
  const shopCoords = shop.location?.coordinates;
  const hasUserCoords = userLoc.status === 'resolved' && userLoc.lat && userLoc.lng;
  const hasShopCoords = Array.isArray(shopCoords) && shopCoords.length === 2 && shopCoords[0] && shopCoords[1];

  let distanceText = null;
  if (hasUserCoords && hasShopCoords) {
    const dist = haversineDistance(userLoc.lat, userLoc.lng, shopCoords[1], shopCoords[0]);
    distanceText = formatDistance(dist);
  }

  return (
    <Link to={`/shops/${_id}`} className="fashion-shop-card" aria-label={`View ${name}`}>
      <img src={coverImage || DEFAULT_COVER} alt="" className="fashion-shop-cover" loading="lazy" />
      <div className="fashion-shop-content">
        <img src={logoSrc} alt={name} className="fashion-shop-logo" loading="lazy" />
        <h3>{name}</h3>
        {description && <p>{description}</p>}
        <div className="fashion-shop-meta">
          {distanceText && (
            <span style={{ color: '#7c3aed', background: 'rgba(124, 58, 237, 0.08)', fontWeight: 800, border: '1px solid rgba(124, 58, 237, 0.15)' }}>
              📍 {distanceText}
            </span>
          )}
          {status && (
            <span>
              <BadgeCheck size={13} /> {status}
            </span>
          )}
          {category && (
            <span>
              <Store size={13} /> {category}
            </span>
          )}
          {city && (
            <span>
              <MapPin size={13} /> {city}
            </span>
          )}
          <span>
            <Package size={13} /> View products
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
