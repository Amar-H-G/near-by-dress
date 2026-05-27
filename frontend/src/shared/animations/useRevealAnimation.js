import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from './gsapConfig';

/**
 * Custom React hook for high-performance scroll-driven GSAP reveal animations.
 * Supports fade-up, fade-down, fade-left, fade-right, zoom-in, and luxury stagger reveals.
 */
export const useRevealAnimation = ({
  type = 'fade-up',
  duration = 0.8,
  delay = 0,
  stagger = 0,
  start = 'top 85%',
  once = true,
  childSelector = null,
} = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    // Determine target elements (either child elements or the container itself)
    const targets = childSelector ? el.querySelectorAll(childSelector) : el;
    if (!targets || (childSelector && targets.length === 0)) return;

    // Base variables for animation styles
    let fromProps = { opacity: 0 };
    let toProps = {
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        invalidateOnRefresh: true,
      }
    };

    if (stagger > 0 && childSelector) {
      toProps.stagger = stagger;
    }

    // Configure animation types
    switch (type) {
      case 'fade-up':
        fromProps.y = 40;
        toProps.y = 0;
        break;
      case 'fade-down':
        fromProps.y = -40;
        toProps.y = 0;
        break;
      case 'fade-left':
        fromProps.x = 40;
        toProps.x = 0;
        break;
      case 'fade-right':
        fromProps.x = -40;
        toProps.x = 0;
        break;
      case 'zoom-in':
        fromProps.scale = 0.95;
        toProps.scale = 1;
        break;
      case 'luxury-reveal':
        // Custom mask clipping reveal effect for headers/images
        fromProps.clipPath = 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)';
        fromProps.y = 50;
        toProps.clipPath = 'polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)';
        toProps.y = 0;
        toProps.ease = 'power4.out';
        toProps.duration = duration * 1.5;
        break;
      default:
        fromProps.y = 30;
        toProps.y = 0;
    }

    // Initialize animation timeline
    const anim = gsap.fromTo(targets, fromProps, toProps);

    // High performance optimization: cleanup scrolltrigger and animation instance on unmount
    return () => {
      anim.kill();
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill();
      }
    };
  }, [type, duration, delay, stagger, start, once, childSelector]);

  return elementRef;
};

export default useRevealAnimation;
