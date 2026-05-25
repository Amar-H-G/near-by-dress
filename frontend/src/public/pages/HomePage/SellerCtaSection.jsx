import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const SellerCtaSection = () => (
  <section className="luxury-section-tight">
    <div className="container">
      <div className="seller-cta">
        <div>
          <span className="luxury-eyebrow">
            <ShoppingBag size={14} /> For sellers
          </span>
          <h2 className="luxury-title luxury-title-sm">Turn your shop into a premium digital storefront.</h2>
        </div>
        <div>
          <p className="luxury-copy">Upload products, build trust with a branded profile, and let shoppers contact you directly on WhatsApp.</p>
          <Link to="/register" className="luxury-btn luxury-btn-primary" id="cta-register-shop">
            Register your shop <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default SellerCtaSection;
