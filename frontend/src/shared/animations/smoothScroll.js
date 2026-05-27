import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { ScrollTrigger } from './gsapConfig';

// Routes where smooth scroll should be disabled.
// Admin/Seller dashboards use backdrop-filter blur heavily —
// Lenis's scrollerProxy with transform pinType breaks backdrop-filter on mobile.
const DISABLED_ROUTE_PREFIXES = ['/admin', '/seller'];

export const useSmoothScroll = () => {
  const lenisRef = useRef(null);
  const location = useLocation();

  // Check if current route is a dashboard route
  const isDashboardRoute = DISABLED_ROUTE_PREFIXES.some(prefix =>
    location.pathname.startsWith(prefix)
  );

  useEffect(() => {
    // Skip on admin/seller dashboards — backdrop-filter blur would break
    if (isDashboardRoute) return;

    // Skip if user prefers reduced motion (accessibility)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 0.95,
      smoothTouch: false, // use native touch on mobile
      touchMultiplier: 1.8,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Connect Lenis scroll to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // IMPORTANT: Use pinType 'fixed' (not 'transform') to avoid creating a new
    // stacking context on document.body, which would break backdrop-filter on children.
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        return arguments.length ? lenis.scrollTo(value, { immediate: true }) : lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: 'fixed',
    });

    // RAF animation loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    ScrollTrigger.addEventListener('refresh', () => lenis.resize());
    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isDashboardRoute]);

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  return lenisRef.current;
};

// Component wrapper for providers
export const SmoothScroll = ({ children }) => {
  useSmoothScroll();
  return children;
};

export default SmoothScroll;

