import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Truck,
} from 'lucide-react';
import { getProduct } from '../services/product.service.js';
import LoadingSpinner from '../../shared/components/LoadingSpinner';

// SEO & Schema Injections
import SEO from '../../shared/seo/SEO';
import SchemaMarkup from '../../shared/seo/SchemaMarkup';

import { useOrderFlow } from '../../shared/order/useOrderFlow';

const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatPrice = (value) => priceFormatter.format(Number(value || 0));
const getImageUrl = (img) => (typeof img === 'object' ? img?.url : img);

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { startOrderFlow } = useOrderFlow();

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await getProduct(id);
        if (mounted) {
          setProduct(data.data);
          setActiveImg(0);
        }
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Product not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchProduct();
    return () => { mounted = false; };
  }, [id]);



  if (loading) return <LoadingSpinner fullScreen />;
  if (error || !product) {
    return (
      <div className="marketplace-page luxury-shell public-error-state">
        <p>{error || 'Product not found'}</p>
        <Link to="/products" className="luxury-btn luxury-btn-primary">Browse products</Link>
      </div>
    );
  }

  const { name, description, price, discountPrice, images, category, sizes, colors, stock, shop } = product;
  const hasDiscount = discountPrice && discountPrice < price;
  const displayPrice = hasDiscount ? discountPrice : price;
  const rawImgs = images?.length ? images : ['https://placehold.co/900x1125/f0ece8/756f72?text=Fashion'];
  const imgs = rawImgs.map(getImageUrl).filter(Boolean);
  const categoryLabel = typeof category === 'object' ? category?.name : category;

  const breadcrumbs = [
    { name: 'Home', url: window.location.origin },
    { name: 'Products', url: `${window.location.origin}/products` },
    { name: name, url: window.location.href }
  ];

  // Product data passed to the order modal
  const orderProduct = {
    _id: id,
    name,
    price,
    discountPrice,
    image: imgs[0],
    selectedSize,
    selectedColor,
    quantity: 1,
    shopName: shop?.name,
    shop,
  };

  return (
    <div className="marketplace-page product-detail-page">
      <SEO
        title={name}
        description={description ? description.substring(0, 155) : `Buy ${name} online. High-quality premium fashion collection at NearByDress.`}
        keywords={`${name}, buy ${name} online, ${categoryLabel || 'ethnic wear'}, luxury fashion marketplace, premium style`}
        ogImage={imgs[0]}
      />
      <SchemaMarkup type="product" data={product} />
      <SchemaMarkup type="breadcrumbs" data={breadcrumbs} />

      <div className="container">
        <div className="product-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{name}</span>
        </div>

        <div className="product-detail-grid">
          <section className="product-gallery" aria-label={`${name} gallery`}>
            {imgs.length > 1 && (
              <div className="product-thumbs">
                {imgs.map((img, index) => (
                  <button
                    key={img + index}
                    type="button"
                    className={`product-thumb ${index === activeImg ? 'product-thumb-active' : ''}`}
                    onClick={() => setActiveImg(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img src={img} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}

            <div className="product-main-image">
              <img src={imgs[activeImg]} alt={name} decoding="async" />
              {imgs.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImg((current) => (current - 1 + imgs.length) % imgs.length)}
                    className="gallery-arrow gallery-arrow-left"
                    id="img-prev"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={19} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImg((current) => (current + 1) % imgs.length)}
                    className="gallery-arrow gallery-arrow-right"
                    id="img-next"
                    aria-label="Next image"
                  >
                    <ChevronRight size={19} />
                  </button>
                </>
              )}
            </div>
          </section>

          <aside className="product-info-panel">
            <div className="product-status-row">
              <span className="fashion-badge">
                <Tag size={12} /> {categoryLabel || 'Fashion'}
              </span>
              {stock > 0 ? (
                <span className="fashion-badge product-stock-good">
                  <BadgeCheck size={12} /> In stock
                </span>
              ) : (
                <span className="fashion-badge product-stock-out">Out of stock</span>
              )}
            </div>

            <span className="luxury-eyebrow">Product story</span>
            <h1 className="product-detail-title">{name}</h1>

            <div className="product-detail-price">
              <strong>{formatPrice(displayPrice)}</strong>
              {hasDiscount && (
                <>
                  <del>{formatPrice(price)}</del>
                  <span className="fashion-badge fashion-badge-sale">
                    {Math.round(((price - discountPrice) / price) * 100)}% off
                  </span>
                </>
              )}
            </div>

            {description && <p className="product-description">{description}</p>}

            {sizes?.length > 0 && (
              <div className="product-option-group">
                <div className="product-option-label">
                  <span>Size</span>
                  {selectedSize && <span>Selected: {selectedSize}</span>}
                </div>
                <div className="product-option-list">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`product-option-btn ${selectedSize === size ? 'product-option-btn-active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors?.length > 0 && (
              <div className="product-option-group">
                <div className="product-option-label">
                  <span>Color</span>
                  {selectedColor && <span>Selected: {selectedColor}</span>}
                </div>
                <div className="product-option-list">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`product-option-btn ${selectedColor === color ? 'product-option-btn-active' : ''}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Primary WhatsApp Order CTA ── */}
            <button
              type="button"
              className="fashion-whatsapp product-primary-cta"
              id="whatsapp-cta-main"
              onClick={() => startOrderFlow(orderProduct)}
            >
              <MessageCircle size={20} />
              Order on WhatsApp
            </button>

            <div className="product-trust-grid">
              <div className="product-trust-item">
                <Truck size={20} />
                <span>Confirm delivery</span>
              </div>
              <div className="product-trust-item">
                <ShieldCheck size={20} />
                <span>Verified product</span>
              </div>
              <div className="product-trust-item">
                <RotateCcw size={20} />
                <span>Ask returns</span>
              </div>
            </div>

            <div className="product-note">
              <Sparkles size={17} />
              <span>Connect with our concierge team for fit guidance, availability, custom styling, and premium shipping details.</span>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile sticky buy bar ── */}
      <div className="product-mobile-buybar">
        <button
          type="button"
          className="fashion-whatsapp"
          id="whatsapp-cta-sticky"
          onClick={() => startOrderFlow(orderProduct)}
        >
          <MessageCircle size={18} />
          Order on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
