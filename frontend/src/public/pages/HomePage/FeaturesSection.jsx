import { forwardRef } from 'react';
import { MessageCircle, Shield, Store, Zap } from 'lucide-react';

const FEATURES = [
  { icon: <Store size={24} />, title: 'Local Shops', desc: 'Discover verified fashion boutiques near you' },
  { icon: <MessageCircle size={24} />, title: 'WhatsApp Direct', desc: 'Contact shops instantly via WhatsApp' },
  { icon: <Zap size={24} />, title: 'Latest Trends', desc: 'Fresh products updated daily by shop owners' },
  { icon: <Shield size={24} />, title: 'Verified Shops', desc: 'Every shop is admin-approved before listing' },
];

const FeaturesSection = forwardRef(({ siteName }, ref) => (
  <section className="section" ref={ref} style={{ background: 'var(--bg-2)' }}>
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 16 }}>Why <span className="gradient-text">{siteName}</span>?</h2>
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
));

FeaturesSection.displayName = 'FeaturesSection';

export default FeaturesSection;
