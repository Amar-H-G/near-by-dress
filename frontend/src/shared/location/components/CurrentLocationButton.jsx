[ignoring loop detection]
import { useState } from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import { reverseGeocode } from '../services/locationService';
import toast from 'react-hot-toast';

const CurrentLocationButton = ({ onLocationFetched }) => {
  const [loading, setLoading] = useState(false);

  const handleDetect = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const addressData = await reverseGeocode(latitude, longitude);
          if (addressData) {
            onLocationFetched({
              lat: latitude,
              lng: longitude,
              ...addressData
            });
            toast.success('Current location snapped and reverse-geocoded successfully!');
          } else {
            onLocationFetched({ lat: latitude, lng: longitude });
            toast.success('Snapped to your GPS coordinates!');
          }
        } catch (err) {
          onLocationFetched({ lat: latitude, lng: longitude });
          toast.success('Snapped to coordinates! Could not reverse-geocode address text.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        let msg = 'GPS permission denied or timed out.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Snapping failed: Please allow location access in your browser settings.';
        }
        toast.error(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleDetect}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '12px 20px',
        borderRadius: '12px',
        background: 'none',
        border: '1.5px solid rgba(124, 58, 237, 0.25)',
        color: '#7c3aed',
        fontWeight: 700,
        fontSize: '13px',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Navigation size={15} style={{ transform: 'rotate(45deg)' }} />
      )}
      {loading ? 'Snapping to GPS Location...' : 'Use Current GPS Location'}
    </button>
  );
};

export default CurrentLocationButton;
