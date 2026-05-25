import { BadgeCheck, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: <Sparkles size={23} />, title: 'Curated discovery', desc: 'Browse trend-led edits instead of endless unstyled product grids.' },
  { icon: <BadgeCheck size={23} />, title: 'Verified shops', desc: 'Approved sellers help every storefront feel reliable and real.' },
  { icon: <MessageCircle size={23} />, title: 'Direct buying', desc: 'Talk to boutiques instantly on WhatsApp before you buy.' },
  { icon: <ShieldCheck size={23} />, title: 'Local trust', desc: 'Shop fashion from nearby sellers with visible identity and details.' },
];

const FeaturesSection = ({ siteName }) => (
  <section className="luxury-section-tight">
    <div className="container">
      <div className="luxury-section-header">
        <div>
          <span className="luxury-eyebrow">Why shoppers stay</span>
          <h2 className="luxury-title luxury-title-sm">A marketplace that feels like a fashion house</h2>
        </div>
        <p className="luxury-copy">
          {siteName} gives every shop a premium stage while keeping product discovery fast, trustworthy, and local.
        </p>
      </div>

      <div className="fashion-feature-grid">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="fashion-feature-card">
            <div className="fashion-feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
