/**
 * UserLocationMap.jsx
 * Visualizes the user's GPS/detected location with a branded glowing pulse marker.
 * Ideal for setting search bounds, visual geofencing, or verifying location status.
 *
 * Props:
 *   lat: number
 *   lng: number
 *   formattedAddress: string
 *   radiusKm: number (optional, shows boundary)
 *   height: string (default '280px')
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

const UserLocationMap = ({ lat, lng, formattedAddress, radiusKm = 20, height = '280px' }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;

    ensureLeafletCSS();
    let destroyed = false;

    import('leaflet').then((LModule) => {
      if (destroyed || !containerRef.current || mapRef.current) return;
      const L = LModule.default || LModule;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      // Branded Pulsing Blue User Location Dot
      const pulseIcon = L.divIcon({
        className: 'custom-pulse-icon',
        html: `
          <div style="position: relative; width: 20px; height: 20px;">
            <div style="
              position: absolute; width: 100%; height: 100%;
              background: #3b82f6; border-radius: 50%;
              opacity: 0.15; animation: pulseGlow 1.8s infinite ease-in-out;
            "></div>
            <div style="
              position: absolute; width: 12px; height: 12px;
              background: #3b82f6; border: 2px solid #fff;
              border-radius: 50%; top: 4px; left: 4px;
              box-shadow: 0 0 8px rgba(59,130,246,0.8);
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      // User Marker
      const popupHtml = `
        <div style="padding: 4px; text-align: left; font-family: sans-serif;">
          <strong style="color: #1e1b4b; fontSize: 13px;">Your Location</strong>
          <p style="margin: 3px 0 0; fontSize: 11px; color: #6b7280;">${formattedAddress || 'Precise GPS Coordinates'}</p>
        </div>
      `;

      L.marker([lat, lng], { icon: pulseIcon })
        .addTo(map)
        .bindPopup(popupHtml)
        .openPopup();

      // Search Radius Bounds
      if (radiusKm > 0) {
        L.circle([lat, lng], {
          radius: radiusKm * 1000,
          color: '#3b82f6',
          weight: 1.5,
          dashArray: '4, 6',
          fillColor: '#3b82f6',
          fillOpacity: 0.03,
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
  }, [lat, lng, formattedAddress, radiusKm]);

  if (!lat || !lng) return null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
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
      
      {/* Dynamic Keyframes for Pulsing Glow */}
      <style>{`
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.5; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default UserLocationMap;
