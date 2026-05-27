[ignoring loop detection]
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const MapPicker = lazy(() => import('../../maps/MapPicker'));

const GeoMapPicker = ({ center, markerPos, onChange, radiusKm = null, readOnly = false, height = '320px' }) => {
  const defaultCenter = center || { lat: 22.5726, lng: 88.3639 }; // Default: Kolkata

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: height, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <Suspense fallback={
        <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', gap: 12 }}>
          <Loader2 size={32} className="animate-spin" color="#7c3aed" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Loading Leaflet Map...</span>
        </div>
      }>
        <MapPicker
          center={defaultCenter}
          markerPos={markerPos}
          onClick={onChange}
          readOnly={readOnly}
          height={height}
          radiusKm={radiusKm}
          zoom={15}
        />
      </Suspense>
    </div>
  );
};

export default GeoMapPicker;
