import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, ShoppingBag, Store, MessageCircle, Star, Zap, Shield, Mail, Phone } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import API from '../../../shared/services/api';

const FEATURES = [
  { icon: <Store size={24} />, title: 'Local Shops', desc: 'Discover verified fashion boutiques near you' },
  { icon: <MessageCircle size={24} />, title: 'WhatsApp Direct', desc: 'Contact shops instantly via WhatsApp' },
  { icon: <Zap size={24} />, title: 'Latest Trends', desc: 'Fresh products updated daily by shop owners' },
  { icon: <Shield size={24} />, title: 'Verified Shops', desc: 'Every shop is admin-approved before listing' },
];

const HomePage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  const { settings, categories } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Fetch featured products
    API.get('/products', { params: { isFeatured: true, limit: 8 } })
      .then(res => setFeaturedProducts(res.data.data.products || []))
      .catch(err => console.error(err));

    // Hero animation
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
      gsap.fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.25, ease: 'power3.out' });
      gsap.fromTo('.hero-ctas', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power3.out' });
      gsap.fromTo('.hero-stats', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.55, ease: 'power3.out' });
      gsap.fromTo('.feature-card', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power3.out',
        scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef}>
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', paddingTop: 80,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
      }}>
        {/* Background decoration */}
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

          {/* Stats */}
          <div className="hero-stats" style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { value: '500+', label: 'Local Shops' },
              { value: '10K+', label: 'Products' },
              { value: '50+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" ref={featuresRef} style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 16 }}>Why <span className="gradient-text">{settings?.siteName || 'NearByDress'}</span>?</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', fontSize: 16 }}>
              The smartest way to shop fashion from your neighbourhood
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card" style={{ padding: 28 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 16,
                  background: 'rgba(37, 99, 235, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 12 }}>Featured <span className="gradient-text">Products</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {featuredProducts.map(p => (
                <Link to={`/products/${p._id}`} key={p._id} className="card" style={{ display: 'block', textDecoration: 'none', overflow: 'hidden' }}>
                  <img src={p.images?.[0] || 'https://placehold.co/400x400'} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 16, color: 'var(--text)', marginBottom: 8 }}>{p.name}</h3>
                    <p style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{p.discountPrice || p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories?.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 12 }}>Shop by <span className="gradient-text">Category</span></h2>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug}`}
                  className="btn btn-ghost"
                  style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none', borderRadius: 999 }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
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
                Register Your Shop →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
          © {new Date().getFullYear()} {settings?.siteName || 'NearByDress'}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
