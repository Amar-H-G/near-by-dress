import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins
gsap.registerPlugin(ScrollTrigger);

// Custom transition default eases
gsap.defaults({
  duration: 0.8,
  ease: 'power3.out'
});

// Configure ScrollTrigger default settings for responsive performance
ScrollTrigger.config({
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize'
});

export { gsap, ScrollTrigger };
export default gsap;
