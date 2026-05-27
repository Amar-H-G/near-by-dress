import { useEffect, useRef } from 'react';
import { Sparkles, Shield, Ruler, Sparkle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ShopOverview = ({ shop }) => {
  const { name, description } = shop;
  const overviewRef = useRef(null);
  const cardGridRef = useRef(null);

  useEffect(() => {
    const el = overviewRef.current;
    if (!el) return;

    const cards = cardGridRef.current.querySelectorAll('.service-badge-card');

    gsap.fromTo(el.querySelector('.brand-story-box'),
      { opacity: 0, x: -30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 1, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%'
        }
      }
    );

    gsap.fromTo(cards,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardGridRef.current,
          start: 'top 85%'
        }
      }
    );
  }, []);

  return (
    <section ref={overviewRef} className="luxury-shop-overview">
      <div className="container overview-grid">
        
        {/* Brand Story Box */}
        <div className="brand-story-box">
          <span className="luxury-eyebrow kicker-gray">
            <Sparkle size={10} />
            Bespoke Brand Story
          </span>
          <h2 className="overview-title">Crafting Fashion Identity</h2>
          
          <div className="story-paragraphs">
            <p className="lead-paragraph">
              Welcome to the exclusive online salon of <strong>{name}</strong>. Here, fashion-forward thinking merges seamlessly with heritage craftsmanship to deliver breathtaking customized garments tailored exactly to your lifestyle.
            </p>
            {description ? (
              <p className="desc-paragraph">{description}</p>
            ) : (
              <p className="desc-paragraph">
                Every piece in our boutique is meticulously curated to guarantee supreme quality and luxury. Our designers utilize handpicked fabrics, fine embroideries, and structured styling to create modern masterpieces, tailored individually for custom fittings.
              </p>
            )}
          </div>
        </div>

        {/* Bespoke Services list */}
        <div className="boutique-services-box">
          <h3 className="services-headline">Our Signature Services</h3>
          
          <div ref={cardGridRef} className="services-card-grid">
            <div className="service-badge-card">
              <div className="service-icon-circle">
                <Ruler size={18} />
              </div>
              <div className="service-card-info">
                <h4>Perfect Alterations</h4>
                <p>Enjoy tailored measurement tweaks on any ordered item to achieve your exact silhouette.</p>
              </div>
            </div>

            <div className="service-badge-card">
              <div className="service-icon-circle">
                <Sparkles size={18} />
              </div>
              <div className="service-card-info">
                <h4>Bespoke Consultations</h4>
                <p>Message our admin directly on WhatsApp to coordinate direct fabric modifications and color matching.</p>
              </div>
            </div>

            <div className="service-badge-card">
              <div className="service-icon-circle">
                <Shield size={18} />
              </div>
              <div className="service-card-info">
                <h4>Guaranteed Quality</h4>
                <p>Rigorous multi-stage checkouts on physical threads ensure your designs arrive exactly as pictured.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ShopOverview;
