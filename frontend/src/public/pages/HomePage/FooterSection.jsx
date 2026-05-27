import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import NBDLogo from '../../../shared/components/NBDLogo';
import { BRAND } from '../../../shared/config/branding';
import { CONTACT, buildWhatsAppUrl } from '../../../shared/config/contact';

const FooterSection = () => (
  <footer className="fashion-footer">
    <div className="container fashion-footer-grid">
      <div>
        <div className="fashion-footer-brand" style={{ marginBottom: '12px' }}>
          <NBDLogo variant="footer" />
        </div>
        <p>Premium local fashion discovery, verified shops, and direct buying in one marketplace.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <Link to="/products">Products</Link>
        <Link to="/shops">Shops</Link>
        <Link to="/register">Sell on {BRAND.short}</Link>
      </div>
      <div>
        <h4>Support</h4>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Mail size={15} />
          <a href={`mailto:${CONTACT.email}`} className="luxury-link">{CONTACT.email}</a>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={15} />
          <a
            href={buildWhatsAppUrl("Hi Support, I'm reaching out about NBD.")}
            target="_blank"
            rel="noopener noreferrer"
            className="luxury-link"
          >
            {CONTACT.whatsappLabel}
          </a>
        </span>
      </div>
    </div>
    <div className="container fashion-footer-bottom">
      &copy; {new Date().getFullYear()} {BRAND.full}. All rights reserved.
    </div>
  </footer>
);

export default FooterSection;
