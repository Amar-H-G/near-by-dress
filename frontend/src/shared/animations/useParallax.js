import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from './gsapConfig';

/**
 * Custom React hook for high-performance parallax scroll effects.
 * Perfect for background images, product banner visual assets, and overlapping text layers.
 */
export const useParallax = ({ speed = 0.15, direction = 'vertical' } = {}) => {
  const targetRef = useRef(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const yVal = direction === 'vertical' ? speed * 100 : 0;
    const xVal = direction === 'horizontal' ? speed * 100 : 0;

    // Create parallax scroll animation
    const anim = gsap.fromTo(el,
      { y: -yVal, x: -xVal },
      {
        y: yVal,
        x: xVal,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true, // scrub hooks the movement directly to scroll progress
          invalidateOnRefresh: true,
        }
      }
    );

    return () => {
      anim.kill();
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill();
      }
    };
  }, [speed, direction]);

  return targetRef;
};

export default useParallax;
