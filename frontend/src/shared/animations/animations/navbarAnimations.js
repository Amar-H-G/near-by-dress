import { gsap } from '../gsapConfig';

/**
 * Attaches a premium scroll hide/reveal and blur overlay effect to the global navbar.
 */
export const initNavbarScrollAnimation = (navbarElement) => {
  if (!navbarElement) return null;

  let lastScrollY = window.scrollY;
  
  const onScroll = () => {
    const currentScrollY = window.scrollY;
    
    // Add backdrop-filter and borders on scroll
    if (currentScrollY > 50) {
      navbarElement.classList.add('scrolled');
      gsap.to(navbarElement, {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)',
        duration: 0.4,
        ease: 'power2.out'
      });
    } else {
      navbarElement.classList.remove('scrolled');
      gsap.to(navbarElement, {
        background: 'transparent',
        backdropFilter: 'blur(0px)',
        borderBottom: '1px solid transparent',
        boxShadow: 'none',
        duration: 0.4,
        ease: 'power2.out'
      });
    }

    // Hide/reveal scroll behavior (Apple premium design)
    if (currentScrollY > 120 && currentScrollY > lastScrollY) {
      // Scrolling down: hide navbar smoothly
      gsap.to(navbarElement, {
        y: '-100%',
        duration: 0.5,
        ease: 'power3.out'
      });
    } else {
      // Scrolling up: reveal navbar
      gsap.to(navbarElement, {
        y: '0%',
        duration: 0.4,
        ease: 'power3.out'
      });
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('scroll', onScroll);
  };
};

/**
 * Premium mobile menu overlay toggle animations.
 */
export const animateMobileMenu = (menuElement, isOpen, linkElements = []) => {
  if (!menuElement) return;

  if (isOpen) {
    // Open menu animation
    gsap.set(menuElement, { display: 'flex', opacity: 0, x: '100%' });
    
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.5 }
    });

    tl.to(menuElement, {
      opacity: 1,
      x: '0%',
    });

    if (linkElements.length > 0) {
      tl.fromTo(linkElements,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.4 },
        '-=0.2'
      );
    }
  } else {
    // Close menu animation
    gsap.to(menuElement, {
      opacity: 0,
      x: '100%',
      duration: 0.4,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(menuElement, { display: 'none' });
      }
    });
  }
};
