import { Link } from 'react-router-dom';
import { Eye, Heart, MessageCircle, Sparkles, Star, Store } from 'lucide-react';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getProductImage = (images, name) => {
  const firstImage = images?.[0];
  return typeof firstImage === 'object'
    ? firstImage?.url
    : firstImage || `https://placehold.co/600x760/f0ece8/756f72?text=${encodeURIComponent(name || 'Fashion')}`;
};

const ProductCard = ({ product }) => {
  const { _id, name, price, discountPrice, images, category, shop } = product;

  const displayPrice = discountPrice && discountPrice < price ? discountPrice : price;
  const hasDiscount = discountPrice && discountPrice < price;
  const image = getProductImage(images, name);
  const categoryLabel = typeof category === 'object' ? category?.name : category;
  const rating = product.rating || product.averageRating;
  const reviewCount = product.reviewCount || product.reviewsCount;

  const whatsappUrl = shop?.whatsappNumber
    ? `https://wa.me/${shop.whatsappNumber.replace(/\D/g, '')}?text=Hi! I'm interested in "${name}"`
    : null;

  return (
    <article className="fashion-product-card">
      <Link to={`/products/${_id}`} className="fashion-product-media" aria-label={`View ${name}`}>
        <img src={image} alt={name} loading="lazy" />
        <div className="fashion-card-badges">
          <span className={`fashion-badge ${hasDiscount ? 'fashion-badge-sale' : ''}`}>
            {hasDiscount ? `${Math.round(((price - discountPrice) / price) * 100)}% off` : 'New'}
          </span>
          <span className="fashion-wishlist" aria-label={`Save ${name}`} title="Save">
            <Heart size={16} />
          </span>
        </div>
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

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fashion-whatsapp"
            id={`whatsapp-${_id}`}
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
