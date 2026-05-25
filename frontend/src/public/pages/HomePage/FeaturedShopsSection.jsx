import { Link } from 'react-router-dom';
import ShopCard from '../../components/ShopCard';

const FeaturedShopsSection = ({ shops }) => {
  if (!shops.length) return null;

  return (
    <section className="luxury-section">
      <div className="container">
        <div className="luxury-section-header">
          <div>
            <span className="luxury-eyebrow">Boutique discovery</span>
            <h2 className="luxury-title luxury-title-sm">Meet the shops behind the look</h2>
          </div>
          <div>
            <p className="luxury-copy">Every storefront gets a premium brand moment so multi-vendor browsing feels polished and trusted.</p>
            <Link to="/shops" className="luxury-link">Explore all shops</Link>
          </div>
        </div>

        <div className="shop-grid">
          {shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedShopsSection;
