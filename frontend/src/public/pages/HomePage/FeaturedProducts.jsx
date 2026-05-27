import { memo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { useRevealAnimation } from '../../../shared/animations/useRevealAnimation';

const FeaturedProducts = memo(({ products, eyebrow, title, copy }) => {
  const containerRef = useRevealAnimation({
    type: 'fade-up',
    duration: 0.85,
    stagger: 0.08,
    childSelector: '.fashion-product-grid > *',
    once: true,
  });

  if (!products.length) return null;

  return (
    <section ref={containerRef} className="luxury-section">
      <div className="container">
        <div className="luxury-section-header">
          <div>
            <span className="luxury-eyebrow">{eyebrow}</span>
            <h2 className="luxury-title luxury-title-sm">{title}</h2>
          </div>
          <div>
            <p className="luxury-copy">{copy}</p>
            <Link to="/products" className="luxury-link">View all products</Link>
          </div>
        </div>

        <div className="fashion-product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturedProducts.displayName = 'FeaturedProducts';

export default FeaturedProducts;
