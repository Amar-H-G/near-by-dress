import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';

const FeaturedProducts = ({ products, eyebrow, title, copy }) => {
  if (!products.length) return null;

  return (
    <section className="luxury-section">
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
};

export default FeaturedProducts;
