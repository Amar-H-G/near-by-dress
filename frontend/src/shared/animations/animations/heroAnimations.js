import { gsap } from '../gsapConfig';

/**
 * Premium startup cinematic reveal for home page/category page heroes.
 */
export const animateHeroContent = ({
  titleElement,
  subtitleElement,
  ctaContainerElement,
  imageContainerElement,
} = {}) => {
  const tl = gsap.timeline({
    defaults: { ease: 'power4.out', duration: 1.1 }
  });

  // Stagger reveal text elements
  if (titleElement) {
    tl.fromTo(titleElement,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0 },
      'start'
    );
  }

  if (subtitleElement) {
    tl.fromTo(subtitleElement,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0 },
      'start+=0.15'
    );
  }

  if (ctaContainerElement) {
    tl.fromTo(ctaContainerElement,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0 },
      'start+=0.3'
    );
  }

  if (imageContainerElement) {
    tl.fromTo(imageContainerElement,
      { opacity: 0, scale: 0.96, clipPath: 'inset(10% 10% 10% 10% round 30px)' },
      { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.6 },
      'start+=0.1'
    );
  }

  return tl;
};
