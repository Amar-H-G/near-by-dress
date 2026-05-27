import { Link } from 'react-router-dom';
import ShopCard from '../../components/ShopCard';
import { useSettings } from '../../../core/contexts/useSettings';

const FeaturedShopsSection = ({ shops }) => {
  const { settings } = useSettings();
  const header = settings?.featuredShopsHeader || {};

  const eyebrow = header.eyebrow || 'Boutique discovery';
  const title   = header.title   || 'Meet the shops behind the look';
  const copy    = header.copy    || 'Every storefront gets a premium brand moment so multi-vendor browsing feels polished and trusted.';

  if (!shops?.length) return null;

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
