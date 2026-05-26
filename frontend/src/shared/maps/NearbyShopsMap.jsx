/**
 * NearbyShopsMap.jsx
 * Unified map showing BOTH the user (pulsing blue pin) and multiple nearby shops (luxury purple pins).
 * Automatically pans and zooms to frame the user and all boutiques perfectly on load.
 *
 * Props:
 *   userLat: number
 *   userLng: number
 *   shops: Array<{ _id, name, location: { coordinates: [lng, lat] }, formattedAddress, serviceRadiusKm }>
 *   height: string (default '400px')
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

const NearbyShopsMap = ({ userLat, userLng, shops = [], height = '400px' }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    ensureLeafletCSS();
    let destroyed = false;

    import('leaflet').then((LModule) => {
      if (destroyed || !containerRef.current || mapRef.current) return;
      const L = LModule.default || LModule;

      const map = L.map(containerRef.current, {
        center: [userLat || 22.5726, userLng || 88.3639],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);

      // Re-trigger layout in case container was hidden
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Markers dynamically when shops or user coordinate changes
  useEffect(() => {
    const map = mapRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    // Clear old overlays
    layers.clearLayers();

    let destroyed = false;

    import('leaflet').then((LModule) => {
      if (destroyed) return;
      const L = LModule.default || LModule;
      const points = [];

      // 1. Add User Location Marker (if available)
      if (userLat && userLng) {
        const pulseIcon = L.divIcon({
          className: 'custom-pulse-icon',
          html: `
            <div style="position: relative; width: 22px; height: 22px;">
              <div style="
                position: absolute; width: 100%; height: 100%;
                background: #3b82f6; border-radius: 50%;
                opacity: 0.2; animation: pulseGlow 1.8s infinite ease-in-out;
              "></div>
              <div style="
                position: absolute; width: 12px; height: 12px;
                background: #3b82f6; border: 2px solid #fff;
                border-radius: 50%; top: 5px; left: 5px;
                box-shadow: 0 0 8px rgba(59,130,246,0.8);
              "></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([userLat, userLng], { icon: pulseIcon })
          .addTo(layers)
          .bindPopup(`
            <div style="padding: 4px; font-family: sans-serif; text-align: left;">
              <strong style="color: #1e1b4b; fontSize: 13px;">Your Location</strong>
              <p style="margin: 3px 0 0; fontSize: 11px; color: #6b7280;">Filtered by proximity</p>
            </div>
          `);

        points.push([userLat, userLng]);
      }

      // 2. Add Shop Markers
      shops.forEach((shop) => {
        const coords = shop?.location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return;
        const shopLat = coords[1];
        const shopLng = coords[0];

        const shopIcon = L.divIcon({
          className: 'custom-shop-icon',
          html: `
            <div style="
              width: 32px; height: 32px;
              background: linear-gradient(135deg, #7c3aed, #a855f7);
              border: 2px solid #fff;
              border-radius: 50%;
              box-shadow: 0 3px 10px rgba(124, 58, 237, 0.3);
              display: flex; align-items: center; justify-content: center;
              font-size: 13px;
            ">
              🛍️
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupContent = `
          <div style="padding: 6px 8px; font-family: sans-serif; text-align: left; min-width: 160px;">
            <h4 style="margin: 0 0 3px; font-weight: 700; color: #1e1b4b; fontSize: 13px;">${shop.name}</h4>
            <p style="margin: 0 0 8px; fontSize: 11px; color: #6b7280; line-height: 1.3;">
              ${shop.formattedAddress || 'Verified boutique storefront'}
            </p>
            <a href="/shops/${shop._id}" 
               style="
                 display: block; text-align: center;
                 background: linear-gradient(135deg, #7c3aed, #a855f7);
                 color: #fff; padding: 6px 12px; borderRadius: 8px;
                 text-decoration: none; font-size: 11px; font-weight: 700;
                 box-shadow: 0 3px 8px rgba(124,58,237,0.2);
               ">
               Visit Boutique
            </a>
          </div>
        `;

        L.marker([shopLat, shopLng], { icon: shopIcon })
          .addTo(layers)
          .bindPopup(popupContent);

        points.push([shopLat, shopLng]);
      });

      // 3. Auto-fit bounds if we have points
      if (points.length > 0) {
        if (points.length === 1) {
          map.setView(points[0], 13);
        } else {
          const bounds = L.latLngBounds(points);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    });

    return () => { destroyed = true; };
  }, [userLat, userLng, shops]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={containerRef}
        style={{
          height,
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      />
      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.6; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default NearbyShopsMap;
