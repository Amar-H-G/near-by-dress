import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import NBDLogo from '../../../shared/components/NBDLogo';
import { useSettings } from '../../../core/contexts/useSettings';

const FooterSection = () => {
  const { settings } = useSettings();

  const siteName      = settings?.siteName    || 'NearByDress';
  const footerTagline = settings?.footerTagline || 'Premium local fashion discovery, verified shops, and direct buying in one marketplace.';
  const footerCopy    = settings?.footerCopyright;
  const email         = settings?.contactEmail || '';
  const supportLabel  = settings?.supportLabel || 'Contact Support';
  const waNumber      = settings?.whatsapp?.adminNumber || '';
  const waMsg         = settings?.whatsapp?.supportMessage || "Hi Support, I'm reaching out about NBD.";

  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`
    : null;

  const year = new Date().getFullYear();
  const copyrightText = footerCopy
    ? footerCopy.replace('{year}', year)
    : `© ${year} ${siteName}. All rights reserved.`;

  return (
    <footer className="fashion-footer">
      <div className="container fashion-footer-grid">
        <div>
          <div className="fashion-footer-brand" style={{ marginBottom: '12px' }}>
            <NBDLogo variant="footer" />
          </div>
          <p>{footerTagline}</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/products">Products</Link>
          <Link to="/shops">Shops</Link>
          <Link to="/register">Sell on {siteName}</Link>
          {(settings?.customPages || [])
            .filter((p) => p.isActive && ['about', 'faq', 'help'].includes(p.slug))
            .map((page) => (
              <Link key={page.slug} to={`/pages/${page.slug}`}>{page.title}</Link>
            ))}
        </div>
        <div>
          <h4>Legal</h4>
          {(settings?.customPages || [])
            .filter((p) => p.isActive && ['privacy', 'terms'].includes(p.slug))
            .map((page) => (
              <Link key={page.slug} to={`/pages/${page.slug}`}>{page.title}</Link>
            ))}
        </div>
        <div>
          <h4>Support</h4>
          {email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Mail size={15} />
              <a href={`mailto:${email}`} className="luxury-link">{email}</a>
            </span>
          )}
          {waUrl && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={15} />
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-link"
              >
                Chat on WhatsApp
              </a>
            </span>
          )}
          {!email && !waUrl && (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{supportLabel}</span>
          )}
        </div>
      </div>
      <div className="container fashion-footer-bottom">
        {copyrightText}
      </div>
    </footer>
  );
};

export default FooterSection;
