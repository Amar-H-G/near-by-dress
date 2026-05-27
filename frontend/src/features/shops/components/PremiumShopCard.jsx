import { memo, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Sparkles, Store, ArrowRight, Clock } from 'lucide-react';
import { useLocation } from '../../../core/contexts/useLocation';
import { haversineDistance, formatDistance } from '../../../shared/location/utils/geoUtils';
import gsap from 'gsap';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=600&q=70';

const PremiumShopCard = memo(({ shop }) => {
  const { _id, name, description, city, logo, status, category, coverImage } = shop;
  const { location: userLoc } = useLocation();
  const cardRef = useRef(null);

  const { logoSrc, distanceText } = useMemo(() => {
    const logoSrc = logo ||
      `https://placehold.co/120x120/f0ece8/756f72?text=${encodeURIComponent(name?.charAt(0) || 'S')}`;
    const shopCoords = shop.location?.coordinates;
    const hasUserCoords = userLoc.status === 'resolved' && userLoc.lat && userLoc.lng;
    const hasShopCoords = Array.isArray(shopCoords) && shopCoords.length === 2 && shopCoords[0] && shopCoords[1];
    let distanceText = null;
    if (hasUserCoords && hasShopCoords) {
      const dist = haversineDistance(userLoc.lat, userLoc.lng, shopCoords[1], shopCoords[0]);
      distanceText = formatDistance(dist);
    }
    return { logoSrc, distanceText };
  }, [logo, name, shop.location, userLoc.status, userLoc.lat, userLoc.lng]);

  // Expensively smooth GSAP animation on mount
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%'
        }
      }
    );
  }, []);

  return (
    <div 
      ref={cardRef}
      className="premium-shop-card-wrapper"
    >
      <Link to={`/shops/${_id}`} className="premium-shop-card" aria-label={`Explore ${name}`}>
        {/* Cover Image & Tags */}
        <div className="premium-shop-cover-wrapper">
          <img
            src={coverImage || DEFAULT_COVER}
            alt=""
            className="premium-shop-cover"
            loading="lazy"
          />
          <div className="premium-shop-cover-overlay" />
          
          {/* Top Badges overlay */}
          <div className="premium-shop-badges-container">
            {distanceText && (
              <span className="premium-shop-badge distance">
                <MapPin size={10} />
                {distanceText}
              </span>
            )}
            {status === 'approved' && (
              <span className="premium-shop-badge verified">
                <BadgeCheck size={10} />
                Verified
              </span>
            )}
          </div>

          {/* Quick status label */}
          <div className="premium-shop-status">
            <Clock size={10} />
            <span>Open today</span>
          </div>
        </div>

        {/* Shop Branding Box (Overlap design) */}
        <div className="premium-shop-body">
          {/* Logo Circle */}
          <div className="premium-shop-logo-wrapper">
            <img
              src={logoSrc}
              alt=""
              className="premium-shop-logo"
              loading="lazy"
            />
          </div>

          <div className="premium-shop-meta-header">
            {category && (
              <span className="premium-shop-category">
                <Store size={10} />
                {category}
              </span>
            )}
            {city && <span className="premium-shop-city">{city}</span>}
          </div>

          <h3 className="premium-shop-title">
            {name}
            <Sparkles size={12} className="title-sparkle" />
          </h3>
          
          {description ? (
            <p className="premium-shop-desc">{description}</p>
          ) : (
            <p className="premium-shop-desc">Premium customized designer boutique collections and luxury styles.</p>
          )}

          {/* Luxury visual thumbnail previews */}
          <div className="premium-shop-previews">
            <div className="preview-item bg-1" />
            <div className="preview-item bg-2" />
            <div className="preview-item bg-3" />
            <span className="preview-text">30+ styles</span>
          </div>

          {/* Footer Interactive Actions */}
          <div className="premium-shop-footer">
            <span className="premium-shop-action-link">
              Explore Collection
              <ArrowRight size={14} className="arrow-icon" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
});

PremiumShopCard.displayName = 'PremiumShopCard';

export default PremiumShopCard;
