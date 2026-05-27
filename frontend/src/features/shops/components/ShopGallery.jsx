import { useEffect, useRef } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import gsap from 'gsap';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80'
];

const ShopGallery = () => {
  const galleryRef = useRef(null);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const items = el.querySelectorAll('.gallery-grid-item');

    gsap.fromTo(items,
      { opacity: 0, scale: 0.96, y: 25 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        }
      }
    );
  }, []);

  return (
    <section ref={galleryRef} className="luxury-shop-gallery">
      <div className="container">
        
        <div className="gallery-header">
          <span className="luxury-eyebrow">
            <Camera size={11} />
            Bespoke Gallery
          </span>
          <h2 className="gallery-title">Lifestyle & Lookbook</h2>
          <p className="gallery-subtitle">An aesthetic window into our curated collections, styling visions, and fabric textures.</p>
        </div>

        <div className="gallery-grid">
          <div className="gallery-grid-item item-large">
            <img src={GALLERY_IMAGES[0]} alt="Bespoke luxury model look" loading="lazy" />
            <div className="gallery-item-overlay">
              <span className="overlay-kicker"><Sparkles size={10} /> Editorial Raw</span>
              <h3>Summer Silk Series</h3>
            </div>
          </div>

          <div className="gallery-grid-item">
            <img src={GALLERY_IMAGES[1]} alt="Bespoke linen stitching" loading="lazy" />
            <div className="gallery-item-overlay">
              <h3>Bespoke Linen</h3>
            </div>
          </div>

          <div className="gallery-grid-item">
            <img src={GALLERY_IMAGES[2]} alt="Premium accessories details" loading="lazy" />
            <div className="gallery-item-overlay">
              <h3>Signature Weaves</h3>
            </div>
          </div>

          <div className="gallery-grid-item item-tall">
            <img src={GALLERY_IMAGES[3]} alt="Luxury boutique setup" loading="lazy" />
            <div className="gallery-item-overlay">
              <span className="overlay-kicker"><Sparkles size={10} /> Atelier Custom</span>
              <h3>Boutique Atmosphere</h3>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ShopGallery;
