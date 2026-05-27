import { MapPin, Globe, Compass } from 'lucide-react';

const LocationPreviewCard = ({ lat, lng, address, city, state, pincode }) => {
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number';

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1.5px dashed var(--border)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Compass size={16} color="var(--primary)" />
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text)' }}>
          Selected Geolocation Snapshot
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', gap: 10, gridColumn: 'span 2' }}>
          <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Formatted Address</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {address || 'Not specified'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Globe size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>City / State</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {city ? `${city}, ${state || ''}` : 'Not specified'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <MapPin size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Pincode Coverage</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {pincode || 'Not specified'}
            </span>
          </div>
        </div>

        {hasCoordinates && (
          <div style={{ display: 'flex', gap: 10, gridColumn: 'span 2', background: 'var(--surface)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Geospatial Coordinates</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                Lat: {lat.toFixed(6)}° (N) | Lng: {lng.toFixed(6)}° (E)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPreviewCard;
