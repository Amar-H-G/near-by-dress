import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Sparkles, Store } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Local shops' },
  { value: '10K+', label: 'Fashion finds' },
  { value: '50+', label: 'Cities served' },
];

const HeroSection = ({ siteName }) => (
  <section className="fashion-hero">
    <div className="container">
      <div className="fashion-hero-content">
        <span className="luxury-eyebrow fashion-hero-kicker">
          <Sparkles size={14} /> Curated multi-vendor fashion
        </span>
        <h1 className="fashion-hero-title">
          Your city.
          <br />
          Your <span>new wardrobe.</span>
        </h1>
        <p className="fashion-hero-copy">
          {siteName} brings verified local boutiques, fresh drops, seasonal campaigns, and direct WhatsApp shopping into one premium marketplace.
        </p>
        <div className="fashion-hero-actions">
          <Link to="/products" className="luxury-btn luxury-btn-primary" id="hero-browse-btn">
            Shop the edit <ArrowRight size={18} />
          </Link>
          <Link to="/shops" className="luxury-btn luxury-btn-secondary" id="hero-shops-btn">
            <Store size={18} /> Discover shops
          </Link>
        </div>
        <div className="fashion-hero-stats">
          {STATS.map((stat) => (
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

export default HeroSection;
