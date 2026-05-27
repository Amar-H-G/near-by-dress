import { gsap } from '../gsapConfig';

/**
 * Premium staggered entry reveal for boutique/shop cards in listing feeds.
 */
export const animateShopList = (containerElement, cardSelector = '.premium-shop-card-wrapper') => {
  if (!containerElement) return null;

  const cards = containerElement.querySelectorAll(cardSelector);
  if (cards.length === 0) return null;

  const anim = gsap.fromTo(cards,
    { opacity: 0, y: 40, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.85,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerElement,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    }
  );

  return anim;
};

/**
 * Subtle parallax tilt-and-hover movement on boutique brand cards.
 */
export const tiltShopCard = (cardElement, strength = 8) => {
  if (!cardElement) return;

  const onMouseMove = (e) => {
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates around center (0, 0)
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    gsap.to(cardElement, {
      rotateY: normX * strength,
      rotateX: -normY * strength,
      transformPerspective: 800,
      ease: 'power2.out',
      duration: 0.4,
    });
  };

  const onMouseLeave = () => {
    gsap.to(cardElement, {
      rotateY: 0,
      rotateX: 0,
      ease: 'power2.out',
      duration: 0.5,
    });
  };

  cardElement.addEventListener('mousemove', onMouseMove);
  cardElement.addEventListener('mouseleave', onMouseLeave);

  return () => {
    cardElement.removeEventListener('mousemove', onMouseMove);
    cardElement.removeEventListener('mouseleave', onMouseLeave);
  };
};
