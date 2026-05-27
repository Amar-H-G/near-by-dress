import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useSettings } from '../../../core/contexts/useSettings';

const SellerCtaSection = () => {
  const { settings } = useSettings();
  const cta = settings?.sellerCta || {};

  const eyebrow  = cta.eyebrow  || 'For sellers';
  const title    = cta.title    || 'Turn your shop into a premium digital storefront.';
  const copy     = cta.copy     || 'Upload products, build trust with a branded profile, and let shoppers contact you directly on WhatsApp.';
  const ctaLabel = cta.ctaLabel || 'Register your shop';

  return (
    <section className="luxury-section-tight">
      <div className="container">
        <div className="seller-cta">
          <div>
            <span className="luxury-eyebrow">
              <ShoppingBag size={14} /> {eyebrow}
            </span>
            <h2 className="luxury-title luxury-title-sm">{title}</h2>
          </div>
          <div>
            <p className="luxury-copy">{copy}</p>
            <Link to="/register" className="luxury-btn luxury-btn-primary" id="cta-register-shop">
              {ctaLabel} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCtaSection;
