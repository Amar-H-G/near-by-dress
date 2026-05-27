import { useEffect } from 'react';
import { BRAND } from '../config/branding';

/**
 * SEO.jsx
 * Lightweight, high-performance, package-free React component to dynamically
 * manage document metadata, OpenGraph tags, Twitter cards, and canonical links.
 * Works perfectly on React 19 and is highly optimized for search engine bots.
 */
const SEO = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  robots = 'index, follow'
}) => {
  useEffect(() => {
    // 1. Title
    const baseTitle = `${BRAND.short} | ${BRAND.full} — Local Fashion Marketplace`;
    document.title = title ? `${title} | ${BRAND.short}` : baseTitle;

    // Helper to find or create a meta tag
    const setMetaTag = (attributeName, attributeValue, contentValue) => {
      if (!contentValue) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to set link tags
    const setLinkTag = (rel, hrefValue) => {
      if (!hrefValue) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // 2. Standard Metadata
    setMetaTag('name', 'description', description || `Discover premium fashion shops and boutiques near you. ${BRAND.short} connects you with authentic local ethnic wear, sarees, and customized apparel.`);
    setMetaTag('name', 'keywords', keywords || `${BRAND.short}, ${BRAND.full}, fashion marketplace, dress shops near me, local boutiques, ethnic wear, sarees near me, local clothes shopping`);
    setMetaTag('name', 'robots', robots);

    // 3. Canonical Link
    const currentUrl = window.location.href;
    setLinkTag('canonical', canonical || currentUrl);

    // 4. OpenGraph Cards (Facebook / LinkedIn)
    setMetaTag('property', 'og:title', title ? `${title} | ${BRAND.short}` : baseTitle);
    setMetaTag('property', 'og:description', description || `Find and order premium fashion products from boutiques in your locality.`);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonical || currentUrl);
    setMetaTag('property', 'og:image', ogImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600');
    setMetaTag('property', 'og:site_name', BRAND.ogSiteName);

    // 5. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title ? `${title} | ${BRAND.short}` : baseTitle);
    setMetaTag('name', 'twitter:description', description || `Find and order premium fashion products from boutiques in your locality.`);
    setMetaTag('name', 'twitter:image', ogImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600');

  }, [title, description, keywords, canonical, ogImage, ogType, robots]);

  return null; // Side-effect component, renders nothing visibly
};

export default SEO;
