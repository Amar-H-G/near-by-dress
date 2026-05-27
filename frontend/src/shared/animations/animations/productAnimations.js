import { gsap } from '../gsapConfig';

/**
 * Premium entry animation for product grid cards.
 */
export const animateProductGrid = (containerElement, cardSelector = '.product-card') => {
  if (!containerElement) return null;

  const cards = containerElement.querySelectorAll(cardSelector);
  if (cards.length === 0) return null;

  // Stagger entry animation
  const anim = gsap.fromTo(cards,
    { opacity: 0, y: 35, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.08,
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
 * Premium luxury hover animation for product card images.
 */
export const hoverProductCard = (cardElement, imgSelector = 'img', detailsSelector = '.card-details') => {
  if (!cardElement) return;

  const img = cardElement.querySelector(imgSelector);
  const details = cardElement.querySelector(detailsSelector);

  const onMouseEnter = () => {
    if (img) {
      gsap.to(img, {
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
    if (details) {
      gsap.to(details, {
        y: -4,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  const onMouseLeave = () => {
    if (img) {
      gsap.to(img, {
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
    if (details) {
      gsap.to(details, {
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  cardElement.addEventListener('mouseenter', onMouseEnter);
  cardElement.addEventListener('mouseleave', onMouseLeave);

  return () => {
    cardElement.removeEventListener('mouseenter', onMouseEnter);
    cardElement.removeEventListener('mouseleave', onMouseLeave);
  };
};
