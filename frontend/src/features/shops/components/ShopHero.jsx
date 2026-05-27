import { useEffect, useRef } from 'react';
import { BadgeCheck, MapPin, Sparkles, Store, MessageCircle, Share2, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=82';

const ShopHero = ({ shop, onInquiryClick }) => {
  const { name, logo, coverImage, city, category, status } = shop;
  
  const heroRef = useRef(null);
  const infoRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Cinematic stagger reveal on mount
    const ctx = gsap.context(() => {
      gsap.fromTo(logoRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'back.out(1.7)' }
      );
      
      gsap.fromTo(infoRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const logoSrc = logo || `https://placehold.co/180x180/f0ece8/756f72?text=${encodeURIComponent(name?.charAt(0) || 'S')}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `Explore premium collections from ${name} on NBD`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Store URL copied to clipboard!');
    }
  };

  return (
    <section ref={heroRef} className="luxury-shop-hero">
      {/* Cinematic Banner */}
      <div className="luxury-shop-hero-banner">
        <img 
          src={coverImage || DEFAULT_COVER} 
          alt="" 
          className="banner-image"
        />
        <div className="banner-overlay-gradient" />
        <div className="banner-vignette" />
      </div>

      <div className="container luxury-shop-hero-container">
        {/* Emblem Wrapper */}
        <div ref={logoRef} className="luxury-shop-logo-emblem">
          <img src={logoSrc} alt="" className="logo-image" />
          <div className="emblem-shine" />
        </div>

        {/* Content Info Card */}
        <div ref={infoRef} className="luxury-shop-hero-info">
          <div className="hero-kicker-row">
            <span className="luxury-shop-kicker">
              <Sparkles size={12} className="kicker-icon animate-pulse" />
              Verified NBD Partner
            </span>
            {status === 'approved' && (
              <span className="hero-status-pill">
                <ShieldCheck size={12} />
                Elite Boutique
              </span>
            )}
          </div>

          <h1 className="luxury-shop-name-heading">{name}</h1>
          
          <div className="luxury-shop-meta-row">
            {category && (
              <span className="meta-item">
                <Store size={14} />
                {category}
              </span>
            )}
            {city && (
              <span className="meta-item">
                <MapPin size={14} />
                {city}
              </span>
            )}
            <span className="meta-item availability">
              <span className="live-dot" />
              Accepting Orders
            </span>
          </div>

          {/* Action drawers */}
          <div className="hero-actions-panel">
            <button 
              type="button" 
              className="inquiry-cta-button"
              onClick={onInquiryClick}
            >
              <MessageCircle size={18} />
              Inquire via WhatsApp
            </button>
            
            <button 
              type="button" 
              className="share-cta-button"
              onClick={handleShare}
              aria-label="Share boutique profile"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopHero;
