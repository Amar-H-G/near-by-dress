import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Sparkles, Store } from 'lucide-react';
import { useSettings } from '../../../core/contexts/useSettings';

const HeroSection = () => {
  const { settings } = useSettings();
  const hero = settings?.heroBanner || {};
  const siteName = settings?.siteName || 'NearByDress';

  const title  = hero.title  || 'Your city.\nYour new wardrobe.';
  const titleLines = title.split('\n');
  const subtitle   = hero.subtitle   || `${siteName} brings verified local boutiques, fresh drops, seasonal campaigns, and direct WhatsApp shopping into one premium marketplace.`;
  const ctaPrimary   = hero.ctaPrimary   || 'Shop the edit';
  const ctaSecondary = hero.ctaSecondary || 'Discover shops';
  const eyebrow      = hero.eyebrow      || 'Curated multi-vendor fashion';
  const stats        = hero.stats?.length ? hero.stats : [
    { value: '500+', label: 'Local shops' },
    { value: '10K+', label: 'Fashion finds' },
    { value: '50+',  label: 'Cities served' },
  ];

  return (
    <section className="fashion-hero">
      <div className="container">
        <div className="fashion-hero-content">
          <span className="luxury-eyebrow fashion-hero-kicker">
            <Sparkles size={14} /> {eyebrow}
          </span>
          <h1 className="fashion-hero-title">
            {titleLines[0]}
            {titleLines.length > 1 && (
              <>
                <br />
                <span>{titleLines.slice(1).join(' ')}</span>
              </>
            )}
          </h1>
          <p className="fashion-hero-copy">{subtitle}</p>
          <div className="fashion-hero-actions">
            <Link to="/products" className="luxury-btn luxury-btn-primary" id="hero-browse-btn">
              {ctaPrimary} <ArrowRight size={18} />
            </Link>
            <Link to="/shops" className="luxury-btn luxury-btn-secondary" id="hero-shops-btn">
              <Store size={18} /> {ctaSecondary}
            </Link>
          </div>
          <div className="fashion-hero-stats">
            {stats.map((stat) => (
              <div className="fashion-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
            <div className="fashion-stat">
              <strong>
                <BadgeCheck size={22} />
              </strong>
              <span>Verified sellers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
