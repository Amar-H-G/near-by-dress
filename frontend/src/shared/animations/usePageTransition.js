import { useEffect, useRef } from 'react';
import { gsap } from './gsapConfig';

/**
 * Custom React hook for premium page-level entry animations.
 * Provides soft, cinematic page entry transitions similar to luxury brands.
 */
export const usePageTransition = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    // Set initial luxury hidden state
    gsap.set(el, {
      opacity: 0,
      y: 20,
    });

    // Run premium entry tween
    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.1, // brief timeout to let route render smoothly
      clearProps: 'all', // clear styles post-animation to keep responsive CSS active
    });

    return () => {
      tween.kill();
    };
  }, []);

  return pageRef;
};

export default usePageTransition;
