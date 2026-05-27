import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Sparkles, Star, Store } from 'lucide-react';
import { useLocation } from '../../core/contexts/useLocation';
import { haversineDistance, formatDistance } from '../../shared/location/utils/geoUtils';

import { useOrderFlow } from '../../shared/order/useOrderFlow';

// ── Stable formatter instance (created once, not on every render) ──────────
const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatPrice = (value) => priceFormatter.format(Number(value || 0));

const getProductImage = (images, name) => {
  const firstImage = images?.[0];
  return typeof firstImage === 'object'
    ? firstImage?.url
    : firstImage || `https://placehold.co/400x520/f0ece8/756f72?text=${encodeURIComponent(name || 'Fashion')}`;
};

// ── Wrapped in memo — only re-renders when `product` prop changes ──────────
const ProductCard = memo(({ product }) => {
  const { _id, name, price, discountPrice, images, category, shop } = product;
  const { location: userLoc } = useLocation();
  const { startOrderFlow } = useOrderFlow();

  // ── All derived values memoized — no recalculation on parent re-renders ──
  const {
    displayPrice,
    hasDiscount,
    image,
    categoryLabel,
    rating,
    reviewCount,
    distanceText,
    discountPct,
  } = useMemo(() => {
    const hasDiscount = !!(discountPrice && discountPrice < price);
    const displayPrice = hasDiscount ? discountPrice : price;
    const image = getProductImage(images, name);
    const categoryLabel = typeof category === 'object' ? category?.name : category;
    const rating = product.rating || product.averageRating;
    const reviewCount = product.reviewCount || product.reviewsCount;
    const shopCoords = shop?.location?.coordinates;
    const hasUserCoords = userLoc.status === 'resolved' && userLoc.lat && userLoc.lng;
    const hasShopCoords = Array.isArray(shopCoords) && shopCoords.length === 2 && shopCoords[0] && shopCoords[1];
    let distanceText = null;
    if (hasUserCoords && hasShopCoords) {
      const dist = haversineDistance(userLoc.lat, userLoc.lng, shopCoords[1], shopCoords[0]);
      distanceText = formatDistance(dist);
    }
    const discountPct = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
    return { displayPrice, hasDiscount, image, categoryLabel, rating, reviewCount, distanceText, discountPct };
  }, [product, userLoc.status, userLoc.lat, userLoc.lng]);

  return (
    <article className="fashion-product-card">
      <Link to={`/products/${_id}`} className="fashion-product-media" aria-label={`View ${name}`}>
        {/* loading=lazy defers off-screen images; decoding=async unblocks main thread */}
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          width="400"
          height="520"
        />
        <div className="fashion-card-badges">
          <span className={`fashion-badge ${hasDiscount ? 'fashion-badge-sale' : ''}`}>
            {hasDiscount ? `${discountPct}% off` : 'New'}
          </span>
          <span className="fashion-wishlist" aria-label={`Save ${name}`} title="Save">
            <Heart size={16} />
          </span>
        </div>
        {distanceText && (
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px',
            background: 'rgba(15, 12, 30, 0.75)', backdropFilter: 'blur(8px)',
            color: '#fff', fontSize: '10px', fontWeight: 800,
            padding: '4px 8px', borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2
          }}>
            <span style={{ fontSize: '10px' }}>⚡</span>
            <span>{distanceText} away</span>
          </div>
        )}
        <div className="fashion-product-overlay" aria-hidden="true">
          <span className="fashion-quick-action">
            <Eye size={15} />
            View
          </span>
        </div>
      </Link>

      <div className="fashion-product-body">
        <div className="fashion-product-meta">
          <span>{categoryLabel || 'Fashion'}</span>
          <span className="fashion-rating">
            {rating ? (
              <>
                <Star size={13} fill="currentColor" />
                {Number(rating).toFixed(1)}
                {reviewCount ? ` (${reviewCount})` : ''}
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Curated
              </>
            )}
          </span>
        </div>

        <Link to={`/products/${_id}`} className="fashion-product-name">
          {name}
        </Link>

        <div className="fashion-price-row">
          <span className={`fashion-price ${hasDiscount ? 'fashion-price-sale' : ''}`}>
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && <span className="fashion-price-old">{formatPrice(price)}</span>}
        </div>

        {shop && (
          <Link to={`/shops/${shop._id}`} className="fashion-shop-link">
            <Store size={13} />
            <span>{shop.name}</span>
            {shop.city && <span>{shop.city}</span>}
          </Link>
        )}

        <button
          type="button"
          className="fashion-whatsapp"
          id={`whatsapp-${_id}`}
          onClick={() => startOrderFlow({
            id: _id,
            name,
            price,
            discountPrice,
            image,
            selectedSize: undefined,
            selectedColor: undefined,
            shopName: shop?.name,
            shop,
          })}
        >
          <MessageCircle size={15} />
          WhatsApp
        </button>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
