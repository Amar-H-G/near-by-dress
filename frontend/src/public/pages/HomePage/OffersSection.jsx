import { Link } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';
import { useSettings } from '../../../core/contexts/useSettings';

const OffersSection = () => {
  const { settings } = useSettings();
  const list = settings?.offers || [];

  if (!list?.length) return null;

  return (
    <section className="luxury-section-tight">
      <div className="container">
        <div className="luxury-section-header">
          <div>
            <span className="luxury-eyebrow">Exclusive offers</span>
            <h2 className="luxury-title luxury-title-sm">Shop boutique edits with extra value</h2>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '8px'
        }}>
          {list.map((offer, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                background: offer.bgImage ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url(${offer.bgImage})` : 'var(--primary)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#ffffff',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
              }}
            >
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '16px'
                }}>
                  <Tag size={12} /> {offer.discount || 'Special deal'}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>{offer.title}</h3>
                <p style={{ fontSize: '13px', opacity: 0.85, lineHeight: '1.4' }}>{offer.copy}</p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.15)'
              }}>
                {offer.code && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase' }}>Use Coupon Code</span>
                    <strong style={{ fontSize: '15px', letterSpacing: '1px', color: '#ffffff' }}>{offer.code}</strong>
                  </div>
                )}
                <Link
                  to={offer.link || '/products'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Shop Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
