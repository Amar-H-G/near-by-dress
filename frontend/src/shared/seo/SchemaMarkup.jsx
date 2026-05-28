import { useEffect } from 'react';
import { useSettings } from '../../core/contexts/useSettings';

/**
 * SchemaMarkup.jsx
 * Injects standard JSON-LD Schema Markup inside document head dynamically,
 * maximizing rich-snippet eligibility on Google, Bing, and AI search systems.
 */
const SchemaMarkup = ({ type, data }) => {
  const { settings } = useSettings();

  useEffect(() => {
    if (!data && type !== 'website') return;

    let schemaObj = null;
    const brandName = settings?.siteName || 'NearByDress';
    const seoBase = settings?.seo || {};
    const siteLogo = settings?.logo || seoBase.organizationLogo || '';

    // Calculate a dynamic priceValidUntil date (e.g. current year + 2 years) to prevent expiration errors
    const currentYear = new Date().getFullYear();
    const dynamicPriceValidUntil = `${currentYear + 2}-12-31`;

    switch (type) {
      case 'product':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          image: data.images?.map(img => typeof img === 'object' ? img.url : img) || [],
          description: data.description || '',
          sku: data._id,
          mpn: data._id,
          brand: {
            '@type': 'Brand',
            name: data.fashionLabels?.length ? data.fashionLabels[0] : brandName
          },
          offers: {
            '@type': 'Offer',
            url: window.location.href,
            priceCurrency: 'INR',
            price: data.discountPrice || data.price,
            priceValidUntil: dynamicPriceValidUntil,
            itemCondition: 'https://schema.org/NewCondition',
            availability: data.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: brandName,
              logo: siteLogo
            }
          }
        };
        break;

      case 'store':
      case 'localbusiness':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'Store',
          '@id': window.location.href,
          name: data.name,
          image: data.logo || data.coverImage || siteLogo || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600',
          description: data.description || '',
          telephone: data.whatsappNumber || settings?.contactPhone || '',
          url: window.location.href,
          address: {
            '@type': 'PostalAddress',
            streetAddress: data.address || seoBase.localBusinessStreetAddress || '',
            addressLocality: data.city || seoBase.localBusinessLocality || '',
            addressRegion: data.state || seoBase.localBusinessRegion || '',
            postalCode: data.pincode || seoBase.localBusinessPostalCode || '',
            addressCountry: seoBase.localBusinessCountry || 'IN'
          },
          geo: data.location?.coordinates ? {
            '@type': 'GeoCoordinates',
            longitude: data.location.coordinates[0],
            latitude: data.location.coordinates[1]
          } : undefined
        };
        break;

      case 'breadcrumbs':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.map((item, index) => {
            const absoluteUrl = item.url?.startsWith('http') 
              ? item.url 
              : `${window.location.origin}${item.url?.startsWith('/') ? '' : '/'}${item.url || ''}`;
            return {
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: absoluteUrl
            };
          })
        };
        break;

      case 'organization':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: brandName,
          url: window.location.origin,
          logo: siteLogo || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600',
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: settings?.contactPhone || '',
            contactType: 'customer support',
            areaServed: 'IN',
            availableLanguage: ['en', 'hi']
          },
          sameAs: [
            settings?.socialLinks?.facebook,
            settings?.socialLinks?.instagram,
            settings?.socialLinks?.twitter
          ].filter(Boolean)
        };
        break;

      case 'article':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': window.location.href
          },
          headline: data.title,
          image: data.coverImage || siteLogo || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600',
          datePublished: data.createdAt || new Date().toISOString(),
          dateModified: data.updatedAt || data.createdAt || new Date().toISOString(),
          author: {
            '@type': 'Person',
            name: data.author || brandName
          },
          publisher: {
            '@type': 'Organization',
            name: brandName,
            logo: {
              '@type': 'ImageObject',
              url: siteLogo || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600'
            }
          },
          description: data.excerpt || data.title
        };
        break;

      case 'faq':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: (Array.isArray(data) ? data : []).map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        };
        break;

      case 'itemlist':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: (Array.isArray(data) ? data : []).map((item, index) => {
            const absoluteUrl = item.url?.startsWith('http')
              ? item.url
              : `${window.location.origin}${item.url?.startsWith('/') ? '' : '/'}${item.url || `/products/${item._id || item.id}`}`;
            return {
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl,
              name: item.name
            };
          })
        };
        break;

      case 'website':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: brandName,
          url: window.location.origin,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${window.location.origin}/products?search={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        };
        break;

      default:
        break;
    }

    if (!schemaObj) return;

    // Create script block and append to head
    const scriptId = `jsonld-schema-${type}-${data?._id || 'global'}`;
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.innerHTML = JSON.stringify(schemaObj);

    // Cleanup script block on unmount
    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [type, data, settings]);

  return null; // Invisible component
};

export default SchemaMarkup;
