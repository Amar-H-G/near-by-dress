/**
 * ShopMap.jsx
 * Branded storefront map component displaying a shop's coordinates and service coverage area.
 * Designed for public storefront page headers or information tabs.
 *
 * Props:
 *   shop: { name, location: { coordinates: [lng, lat] }, formattedAddress, serviceRadiusKm }
 *   height: string (default '300px')
 *   zoom: number (default 13)
 */

import { useEffect, useRef } from 'react';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const ensureLeafletCSS = () => {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  link.crossOrigin = '';
  document.head.appendChild(link);
};

const ShopMap = ({ shop, height = '300px', zoom = 13 }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  // Extract coords
  const coords = shop?.location?.coordinates;
  const hasCoords = Array.isArray(coords) && coords.length === 2;
  const lat = hasCoords ? coords[1] : null;
  const lng = hasCoords ? coords[0] : null;

  useEffect(() => {
    if (!lat || !lng) return;

    ensureLeafletCSS();
    let destroyed = false;

    import('leaflet').then((LModule) => {
      if (destroyed || !containerRef.current || mapRef.current) return;
      const L = LModule.default || LModule;

      // Fix icon references
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom,
        zoomControl: true,
        scrollWheelZoom: false, // Prevent accidental scrolling
        attributionControl: true,
      });

      L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      // Create Custom Boutique Icon
      const shopIcon = L.divIcon({
        className: 'custom-shop-icon',
        html: `
          <div style="
            width: 36px; height: 36px;
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
            display: flex; align-items: center; justify-content: center;
            color: #fff;
          ">
            🛍️
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Marker
      const popupContent = `
        <div style="padding: 6px; font-family: sans-serif; text-align: left;">
          <h4 style="margin: 0 0 4px; font-weight: 700; color: #1e1b4b; fontSize: 14px;">${shop.name}</h4>
          <p style="margin: 0 0 6px; fontSize: 11px; color: #6b7280; line-height: 1.3;">${shop.formattedAddress || 'Verified boutique'}</p>
          ${shop.serviceRadiusKm ? `
            <span style="fontSize: 10px; background: rgba(124,58,237,0.08); color: #7c3aed; padding: 2px 6px; borderRadius: 4px; fontWeight: 600;">
              ${shop.serviceRadiusKm} km coverage
            </span>
          ` : ''}
        </div>
      `;

      L.marker([lat, lng], { icon: shopIcon })
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup();

      // Coverage Area Circle
      if (typeof shop.serviceRadiusKm === 'number' && shop.serviceRadiusKm > 0) {
        L.circle([lat, lng], {
          radius: shop.serviceRadiusKm * 1000,
          color: '#7c3aed',
          weight: 1.5,
          fillColor: '#7c3aed',
          fillOpacity: 0.05,
        }).addTo(map);
      }

      mapRef.current = map;
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, shop, zoom]);

  if (!lat || !lng) {
    return (
      <div style={{
        height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-2)', borderRadius: '20px', border: '1px dashed var(--border)',
        color: 'var(--text-muted)', fontSize: '13px',
      }}>
        Location not set for this storefront.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      }}
    />
  );
};

export default ShopMap;
