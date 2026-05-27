/**
 * branding.js
 * Single source of truth for all brand identity in NearByDress.
 * Update this file to change branding platform-wide.
 */

export const BRAND = {
  /** Short mark — used in navbar, favicon, loading screens */
  short: 'NBD',

  /** Full expanded name — revealed on hover */
  full: 'Near By Dresses',

  /** Legacy/legal name */
  legal: 'NearByDress',

  /** Tagline shown under the mark */
  tagline: 'Fashion Marketplace',

  /** Sub-tagline for hero and marketing sections */
  descriptor: 'Hyperlocal Fashion Marketplace',

  /** SEO title pattern: page | BRAND */
  seoTitle: (page) => page ? `${page} | NBD` : 'NBD — Near By Dresses | Local Fashion Marketplace',

  /** OG site name */
  ogSiteName: 'NBD | Near By Dresses',
};
