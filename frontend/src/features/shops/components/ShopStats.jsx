import { useEffect, useRef } from 'react';
import { PackageOpen, Sparkles, Navigation, Award } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ShopStats = ({ productsCount = 12 }) => {
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const statItems = el.querySelectorAll('.stat-item-block');

    gsap.fromTo(statItems,
      { opacity: 0, scale: 0.95, y: 15 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        }
      }
    );
  }, []);

  return (
    <section ref={statsRef} className="luxury-shop-stats">
      <div className="container stats-wrapper">
        <div className="stat-item-block">
          <div className="stat-icon-wrapper">
            <PackageOpen size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-number">{productsCount}+</span>
            <span className="stat-label">Active Styles</span>
          </div>
        </div>

        <div className="stat-item-block">
          <div className="stat-icon-wrapper">
            <Sparkles size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-number">99%</span>
            <span className="stat-label">Active Support</span>
          </div>
        </div>

        <div className="stat-item-block">
          <div className="stat-icon-wrapper">
            <Navigation size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-number">15 KM</span>
            <span className="stat-label">Standard Radius</span>
          </div>
        </div>

        <div className="stat-item-block">
          <div className="stat-icon-wrapper">
            <Award size={20} />
          </div>
          <div className="stat-data">
            <span className="stat-number">4.9 ★</span>
            <span className="stat-label">Boutique Score</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopStats;
