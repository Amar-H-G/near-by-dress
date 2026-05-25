import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Heart, Sparkles, Sun } from 'lucide-react';

const MOODS = [
  { icon: <Sparkles size={22} />, title: 'Occasion ready', copy: 'Party looks, statement dresses, and festive accents.', to: '/products?search=occasion' },
  { icon: <BriefcaseBusiness size={22} />, title: 'Work polish', copy: 'Smart layers and clean fits for weekdays.', to: '/products?search=formal' },
  { icon: <Sun size={22} />, title: 'Weekend ease', copy: 'Relaxed silhouettes for brunch, errands, and travel.', to: '/products?search=casual' },
  { icon: <Heart size={22} />, title: 'Giftable finds', copy: 'Accessories and standout pieces worth sharing.', to: '/products?search=gift' },
];

const MoodSection = () => (
  <section className="luxury-section-tight">
    <div className="container">
      <div className="fashion-promo">
        <span className="luxury-eyebrow fashion-hero-kicker">Limited-time marketplace edit</span>
        <h2>Build a full look from shops near you.</h2>
        <p>Discover fashion by mood, then message the seller directly to confirm sizing, availability, and styling details.</p>
        <Link to="/products?search=collection" className="luxury-btn luxury-btn-secondary">Shop collections</Link>
      </div>

      <div className="fashion-mood-grid fashion-mood-offset">
        {MOODS.map((mood) => (
          <Link key={mood.title} to={mood.to} className="fashion-mood-card">
            <div className="fashion-feature-icon">{mood.icon}</div>
            <h3>{mood.title}</h3>
            <p>{mood.copy}</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default MoodSection;
