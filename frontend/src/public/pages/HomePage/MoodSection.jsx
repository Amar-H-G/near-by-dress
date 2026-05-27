import { Link } from 'react-router-dom';
import { useSettings } from '../../../core/contexts/useSettings';
import DynamicIcon from '../../../shared/components/DynamicIcon';

const MoodSection = () => {
  const { settings } = useSettings();
  const sec = settings?.moodSection || {};

  const kicker       = sec.kicker       || 'Limited-time marketplace edit';
  const title        = sec.title        || 'Build a full look from shops near you.';
  const copy         = sec.copy         || 'Discover fashion by mood, then message the seller directly to confirm sizing, availability, and styling details.';
  const buttonLabel  = sec.buttonLabel  || 'Shop collections';
  const buttonLink   = sec.buttonLink   || '/products?search=collection';

  const moods = sec.moods?.length ? sec.moods : [
    { icon: 'Sparkles', title: 'Occasion ready', copy: 'Party looks, statement dresses, and festive accents.', to: '/products?search=occasion' },
    { icon: 'BriefcaseBusiness', title: 'Work polish', copy: 'Smart layers and clean fits for weekdays.', to: '/products?search=formal' },
    { icon: 'Sun', title: 'Weekend ease', copy: 'Relaxed silhouettes for brunch, errands, and travel.', to: '/products?search=casual' },
    { icon: 'Heart', title: 'Giftable finds', copy: 'Accessories and standout pieces worth sharing.', to: '/products?search=gift' }
  ];

  return (
    <section className="luxury-section-tight">
      <div className="container">
        <div className="fashion-promo">
          <span className="luxury-eyebrow fashion-hero-kicker">{kicker}</span>
          <h2>{title}</h2>
          <p>{copy}</p>
          <Link to={buttonLink} className="luxury-btn luxury-btn-secondary">{buttonLabel}</Link>
        </div>

        <div className="fashion-mood-grid fashion-mood-offset">
          {moods.map((mood) => (
            <Link key={mood.title} to={mood.to || '/products'} className="fashion-mood-card">
              <div className="fashion-feature-icon">
                <DynamicIcon name={mood.icon} size={22} />
              </div>
              <h3>{mood.title}</h3>
              <p>{mood.copy}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoodSection;
