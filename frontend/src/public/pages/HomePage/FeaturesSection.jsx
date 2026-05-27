import { useSettings } from '../../../core/contexts/useSettings';
import DynamicIcon from '../../../shared/components/DynamicIcon';

const FeaturesSection = () => {
  const { settings } = useSettings();
  const sec = settings?.featuresSection || {};
  const siteName = settings?.siteName || 'NearByDress';
  const siteTagline = settings?.siteTagline || 'Fashion Marketplace';

  const eyebrow = sec.eyebrow || 'Why shoppers stay';
  const title   = sec.title   || 'A marketplace that feels like a fashion house';
  const features = sec.features?.length ? sec.features : [
    { icon: 'Sparkles', title: 'Curated discovery', desc: 'Browse trend-led edits instead of endless unstyled product grids.' },
    { icon: 'BadgeCheck', title: 'Verified shops', desc: 'Approved sellers help every storefront feel reliable and real.' },
    { icon: 'MessageCircle', title: 'Direct buying', desc: 'Talk to boutiques instantly on WhatsApp before you buy.' },
    { icon: 'ShieldCheck', title: 'Local trust', desc: 'Shop fashion from nearby sellers with visible identity and details.' },
  ];

  return (
    <section className="luxury-section-tight">
      <div className="container">
        <div className="luxury-section-header">
          <div>
            <span className="luxury-eyebrow">{eyebrow}</span>
            <h2 className="luxury-title luxury-title-sm">{title}</h2>
          </div>
          <p className="luxury-copy">
            {siteName} — {siteTagline} gives every shop a premium stage while keeping product discovery fast, trustworthy, and local.
          </p>
        </div>

        <div className="fashion-feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="fashion-feature-card">
              <div className="fashion-feature-icon">
                <DynamicIcon name={feature.icon} size={23} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
