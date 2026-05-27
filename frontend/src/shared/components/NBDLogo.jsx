/**
 * NBDLogo.jsx
 * Premium luxury brand mark for NearByDress.
 *
 * Default: "NBD"
 * On hover: smoothly reveals "Near By Dresses" in-place on the same baseline.
 *
 * Inspired by Zara / Nike / luxury fashion-tech identity systems.
 * Touch devices get the full name shown immediately (no hover state).
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config/branding';

/**
 * @param {Object} props
 * @param {'nav'|'footer'|'mobile'|'auth'|'loading'} [props.variant='nav'] - Display context
 * @param {string} [props.to='/'] - Link target
 * @param {boolean} [props.noLink=false] - Render as div instead of Link
 */
const NBDLogo = memo(({ variant = 'nav', to = '/', noLink = false }) => {
  const content = (
    <span className={`nbd-logo nbd-logo--${variant}`} aria-label={BRAND.full}>
      <span className="nbd-logo-text">
        <span className="nbd-mark" aria-hidden="true">
          {BRAND.short}
        </span>
        <span className="nbd-expand" aria-hidden="true">
          {BRAND.full}
        </span>
      </span>
      {(variant === 'nav' || variant === 'footer') && (
        <span className="nbd-tagline">{BRAND.tagline}</span>
      )}
    </span>
  );

  if (noLink) return content;

  return (
    <Link to={to} className="nbd-logo-link" aria-label={`${BRAND.full} — Home`}>
      {content}
    </Link>
  );
});

NBDLogo.displayName = 'NBDLogo';
export default NBDLogo;
