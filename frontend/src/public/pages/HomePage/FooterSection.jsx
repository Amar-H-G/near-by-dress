import { Mail, Phone, ShoppingBag } from 'lucide-react';

const FooterSection = ({ settings }) => (
  <footer style={{ borderTop: '1px solid var(--border)', padding: '60px 0', background: 'var(--bg)' }}>
    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {settings?.logo ? (
            <img src={settings.logo} alt={settings.siteName} style={{ height: 28, width: 'auto', borderRadius: 6 }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={14} color="#fff" />
            </div>
          )}
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18 }}>{settings?.siteName || 'NearByDress'}</span>
        </div>
        <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>Connecting local fashion boutiques directly to you.</p>
      </div>
      <div>
        <h4 style={{ fontWeight: 600, marginBottom: 16 }}>Contact Us</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
          <Mail size={16} /> {settings?.contactEmail || 'support@nearbydress.com'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 14 }}>
          <Phone size={16} /> {settings?.contactPhone || '+91 99999 99999'}
        </div>
      </div>
    </div>
    <div className="container" style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
      Â© {new Date().getFullYear()} {settings?.siteName || 'NearByDress'}. All rights reserved.
    </div>
  </footer>
);

export default FooterSection;
