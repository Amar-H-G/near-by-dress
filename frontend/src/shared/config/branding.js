/**
 * branding.js
 * Static fallback brand values — used ONLY as last-resort defaults
 * when the SettingsProvider hasn't loaded yet (e.g. error boundary).
 *
 * All runtime usage should prefer `settings.siteName`, `settings.siteTagline`, etc.
 * from SettingsContext (via `useSettings()`).
 *
 * Kept for backward compatibility with any remaining imports.
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
