// [ignoring loop detection]
import { useEffect } from 'react';

/**
 * SchemaMarkup.jsx
 * Injects standard JSON-LD Schema Markup inside document head dynamically,
 * maximizing rich-snippet eligibility on Google, Bing, and AI search systems.
 */
const SchemaMarkup = ({ type, data }) => {
  useEffect(() => {
    if (!data) return;

    let schemaObj = null;

    switch (type) {
      case 'product':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          image: data.images?.map(img => img.url) || [],
          description: data.description || '',
          sku: data._id,
          mpn: data._id,
          brand: {
            '@type': 'Brand',
            name: 'NearByDress'
          },
          offers: {
            '@type': 'Offer',
            url: window.location.href,
            priceCurrency: 'INR',
            price: data.discountPrice || data.price,
            priceValidUntil: '2030-12-31',
            itemCondition: 'https://schema.org/NewCondition',
            availability: data.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'NearByDress'
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
          image: data.logo || data.coverImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600',
          description: data.description || '',
          telephone: data.whatsappNumber || '',
          url: window.location.href,
          address: {
            '@type': 'PostalAddress',
            streetAddress: data.address || '',
            addressLocality: data.city || '',
            addressRegion: data.state || '',
            postalCode: data.pincode || '',
            addressCountry: 'IN'
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
          itemListElement: data.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
          }))
        };
        break;

      case 'website':
        schemaObj = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'NearByDress',
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
    const scriptId = `jsonld-schema-${type}-${data._id || 'global'}`;
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
  }, [type, data]);

  return null; // Invisible component
};

export default SchemaMarkup;
