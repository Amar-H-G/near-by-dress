import { Link } from 'react-router-dom';
import { Mail, Phone, ShoppingBag } from 'lucide-react';

const FooterSection = ({ settings }) => (
  <footer className="fashion-footer">
    <div className="container fashion-footer-grid">
      <div>
        <div className="fashion-footer-brand">
          <span className="marketplace-brand-mark">
            {settings?.logo ? <img src={settings.logo} alt={settings.siteName} /> : <ShoppingBag size={17} />}
          </span>
          <span>{settings?.siteName || 'NearByDress'}</span>
        </div>
        <p>Premium local fashion discovery, verified shops, and direct buying in one marketplace.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <Link to="/products">Products</Link>
        <Link to="/shops">Shops</Link>
        <Link to="/register">Sell on NearByDress</Link>
      </div>
      <div>
        <h4>Contact</h4>
        <span>
          <Mail size={16} /> {settings?.contactEmail || 'support@nearbydress.com'}
        </span>
        <span>
          <Phone size={16} /> {settings?.contactPhone || '+91 99999 99999'}
        </span>
      </div>
    </div>
    <div className="container fashion-footer-bottom">
      &copy; {new Date().getFullYear()} {settings?.siteName || 'NearByDress'}. All rights reserved.
    </div>
  </footer>
);

export default FooterSection;
