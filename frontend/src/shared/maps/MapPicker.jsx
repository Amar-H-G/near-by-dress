/**
 * MapPicker.jsx
 * Premium, interactive, draggable marker map for location selection (Seller/Admin).
 * Dynamically loads Leaflet to avoid packaging/bundling weight.
 * Features:
 * - Draggable marker representing chosen spot
 * - Precise click-to-pin mapping
 * - Custom circular overlay for service delivery radius
 * - Auto panning & smooth transitions
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

const MapPicker = ({
  center = { lat: 22.5726, lng: 88.3639 }, // Default: Kolkata
  markerPos = null,
  onClick,
  readOnly = false,
  zoom = 14,
  height = '360px',
  radiusKm = null,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const LRef = useRef(null);

  useEffect(() => {
    ensureLeafletCSS();
    let destroyed = false;

    import('leaflet').then((LModule) => {
      if (destroyed || !containerRef.current || mapRef.current) return;
      const L = LModule.default || LModule;
      LRef.current = L;

      // Fix icon references
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(OSM_TILE_URL, {
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      if (!readOnly && onClick) {
        map.on('click', (e) => {
          onClick(e.latlng.lat, e.latlng.lng);
        });
      }
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Marker
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (markerRef.current) markerRef.current.remove();
    if (circleRef.current) circleRef.current.remove();

    if (markerPos && typeof markerPos.lat === 'number' && typeof markerPos.lng === 'number') {
      const latlng = [markerPos.lat, markerPos.lng];

      markerRef.current = L.marker(latlng, { draggable: !readOnly })
        .addTo(map)
        .bindPopup(readOnly ? 'Selected Location' : 'Drag me to adjust');

      if (!readOnly && onClick) {
        markerRef.current.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          onClick(pos.lat, pos.lng);
        });
      }

      if (typeof radiusKm === 'number' && radiusKm > 0) {
        circleRef.current = L.circle(latlng, {
          radius: radiusKm * 1000,
          color: '#7c3aed',
          weight: 1.5,
          fillColor: '#7c3aed',
          fillOpacity: 0.08,
        }).addTo(map);
      }

      map.panTo(latlng, { animate: true, duration: 0.5 });
    }
  }, [markerPos, radiusKm, readOnly, onClick]);

  // Sync Map Center
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    if (!markerPos) {
      map.panTo([center.lat, center.lng], { animate: true });
    }
  }, [center, markerPos]);

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
        cursor: readOnly ? 'default' : 'crosshair',
      }}
    />
  );
};

export default MapPicker;
