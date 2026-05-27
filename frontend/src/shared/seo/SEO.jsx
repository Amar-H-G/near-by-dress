import { useEffect } from 'react';
import { useSettings } from '../../core/contexts/useSettings';

/**
 * SEO.jsx
 * Lightweight, package-free React component to dynamically manage document
 * metadata, OpenGraph tags, Twitter cards, and canonical links.
 * All brand/SEO strings are sourced from DB-driven SettingsContext.
 */
const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  robots = 'index, follow',
}) => {
  const { settings } = useSettings();

  useEffect(() => {
    const siteName  = settings?.siteName  || 'NearByDress';
    const siteShort = settings?.siteName?.split(' ')[0] || 'NBD';
    const seoBase   = settings?.seo || {};

    const baseTitle = seoBase.homeTitle || `${siteName} — Local Fashion Marketplace`;
    const baseDesc  = seoBase.homeDescription || `Discover local fashion shops near you and shop directly via WhatsApp.`;
    const baseKws   = seoBase.homeKeywords || 'fashion, local shops, marketplace, boutique';
    const baseOgImg = seoBase.ogImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600';

    // 1. Title
    document.title = title ? `${title} | ${siteShort}` : baseTitle;

    const setMetaTag = (attrName, attrValue, contentValue) => {
      if (!contentValue) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentValue);
    };

    const setLinkTag = (rel, hrefValue) => {
      if (!hrefValue) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', hrefValue);
    };

    // 2. Standard Metadata
    setMetaTag('name', 'description', description || baseDesc);
    setMetaTag('name', 'keywords',    keywords    || baseKws);
    setMetaTag('name', 'robots',      robots);

    // 3. Canonical
    setLinkTag('canonical', canonical || window.location.href);

    // 4. OpenGraph
    const ogTitle = title ? `${title} | ${siteShort}` : baseTitle;
    const ogDesc  = description || baseDesc;
    const ogImg   = ogImage || baseOgImg;

    setMetaTag('property', 'og:title',     ogTitle);
    setMetaTag('property', 'og:description', ogDesc);
    setMetaTag('property', 'og:type',      ogType);
    setMetaTag('property', 'og:url',       canonical || window.location.href);
    setMetaTag('property', 'og:image',     ogImg);
    setMetaTag('property', 'og:site_name', siteName);

    // 5. Twitter Cards
    setMetaTag('name', 'twitter:card',        seoBase.twitterCard || 'summary_large_image');
    setMetaTag('name', 'twitter:site',        seoBase.twitterSite || '@nearbydress');
    setMetaTag('name', 'twitter:creator',     seoBase.twitterCreator || '@nearbydress');
    setMetaTag('name', 'twitter:title',       ogTitle);
    setMetaTag('name', 'twitter:description', ogDesc);
    setMetaTag('name', 'twitter:image',       ogImg);

    // 6. Geo-SEO / Local Target Metadata
    const geoRegion = seoBase.localBusinessRegion || '';
    const geoPlacename = seoBase.localBusinessLocality || '';
    const geoCountry = seoBase.localBusinessCountry || 'IN';
    const geoPostal = seoBase.localBusinessPostalCode || '';

    if (geoRegion) setMetaTag('name', 'geo.region', geoRegion);
    if (geoPlacename) setMetaTag('name', 'geo.placename', geoPlacename);
    if (geoCountry) setMetaTag('name', 'geo.country', geoCountry);
    if (geoPostal) setMetaTag('name', 'postal-code', geoPostal);

  }, [title, description, keywords, canonical, ogImage, ogType, robots, settings]);

  return null;
};

export default SEO;
