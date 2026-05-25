import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const SellerCtaSection = () => (
  <section className="section" style={{ background: 'var(--bg-2)' }}>
    <div className="container">
      <div style={{
        borderRadius: 24, padding: 'clamp(40px, 6vw, 72px)',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '1px solid var(--border)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.08), transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ShoppingBag size={48} style={{ color: 'var(--primary)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', marginBottom: 16 }}>Own a Fashion Shop?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
            List your products for free and reach thousands of local fashion lovers.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 16, textDecoration: 'none' }} id="cta-register-shop">
            Register Your Shop â†’
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default SellerCtaSection;
