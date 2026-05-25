import { Link } from 'react-router-dom';
import { ArrowRight, Star, Store } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Local Shops' },
  { value: '10K+', label: 'Products' },
  { value: '50+', label: 'Cities' },
];

const HeroSection = () => (
  <section style={{
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', paddingTop: 80,
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
  }}>
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      background: 'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
    }} />

    <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
      <div className="hero-badge" style={{ marginBottom: 24 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 999,
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          fontSize: 13, color: 'var(--primary)', fontWeight: 600,
        }}>
          <Star size={12} fill="currentColor" /> Hyperlocal Fashion Marketplace
        </span>
      </div>

      <h1 className="hero-title" style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24 }}>
        Discover{' '}
        <span className="gradient-text">Local Fashion</span>
        <br />
        Near You
      </h1>

      <p className="hero-sub" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
        Connect with local boutiques, explore unique styles, and shop directly via WhatsApp. No middlemen, just you and your local shop.
      </p>

      <div className="hero-ctas" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
        <Link to="/products" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }} id="hero-browse-btn">
          Browse Products <ArrowRight size={18} />
        </Link>
        <Link to="/shops" className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: 16 }} id="hero-shops-btn">
          <Store size={18} /> Explore Shops
        </Link>
      </div>

      <div className="hero-stats" style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
