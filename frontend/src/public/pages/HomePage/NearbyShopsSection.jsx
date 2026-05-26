/**
 * NearbyShopsSection.jsx
 * Shows shops near the customer's detected location.
 * Renders only when location is resolved AND nearby shops exist.
 * Gracefully hidden when no location is available.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Loader2, Store } from 'lucide-react';
import { useLocation } from '../../../core/contexts/useLocation';
import { getNearbyShops } from '../../../shared/location/services/locationService';
import ShopCard from '../../components/ShopCard';

const NearbyShopsSection = () => {
  const { location, detect } = useLocation();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const hasCoords = location.status === 'resolved' && location.lat && location.lng;

  useEffect(() => {
    if (!hasCoords) return;

    let cancelled = false;
    setLoading(true);

    getNearbyShops({ lat: location.lat, lng: location.lng, radiusKm: 20, limit: 6 })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data.data) ? data.data : [];
        setShops(list);
        setTotal(data.total || list.length);
      })
      .catch(() => {
        if (!cancelled) setShops([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [hasCoords, location.lat, location.lng]);

  // Don't render section at all if no location and no city
  const hasCity = location.city || location.pincode;
  if (location.status === 'idle' || (!hasCoords && !hasCity)) return null;

  return (
    <section className="luxury-section" style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)' }}>
      <div className="container">

        {/* Section header */}
        <div className="luxury-section-header">
          <div>
            <span className="luxury-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} />
              {location.city
                ? `Shops in ${location.city}${location.pincode ? ` · ${location.pincode}` : ''}`
                : location.pincode
                  ? `Shops near ${location.pincode}`
                  : 'Nearby shops'}
            </span>
            <h2 className="luxury-title luxury-title-sm">
              {hasCoords ? 'Boutiques near you' : `Shops in your area`}
            </h2>
          </div>
          <div>
            <p className="luxury-copy">
              {loading
                ? 'Searching for fashion stores around you…'
                : total > 0
                  ? `${total} verified boutiques found within 20 km`
                  : 'Showing shops in your city'}
            </p>
            <Link
              to={`/shops${location.city ? `?city=${encodeURIComponent(location.city)}` : ''}`}
              className="luxury-link"
            >
              See all nearby shops
            </Link>
          </div>
        </div>

        {/* Location indicator pill */}
        {hasCoords && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.15)',
            fontSize: 12, color: '#6d28d9', fontWeight: 600,
            marginBottom: 28,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#7c3aed',
              animation: 'pulseGeo 2s ease-in-out infinite',
            }} />
            {location.formattedAddress
              ? location.formattedAddress.split(',').slice(0, 2).join(',').trim()
              : `${location.lat?.toFixed(3)}, ${location.lng?.toFixed(3)}`}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 14, padding: '48px 0',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(124,58,237,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Loader2 size={24} color="#7c3aed" className="animate-spin" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Finding fashion stores near you…
            </p>
          </div>

        ) : shops.length > 0 ? (
          <div className="shop-grid">
            {shops.map((shop) => <ShopCard key={shop._id} shop={shop} />)}
          </div>

        ) : hasCoords ? (
          // No nearby shops with coordinates — offer to expand or browse all
          <div style={{
            padding: '40px 24px', textAlign: 'center',
            background: 'var(--surface)', borderRadius: 20,
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(124,58,237,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <Store size={24} color="#7c3aed" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>
              No shops within 20 km
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              Sellers near you haven't pinned their shops yet. Explore all verified boutiques.
            </p>
            <Link to="/shops" className="luxury-btn luxury-btn-primary">
              Browse all shops
            </Link>
          </div>

        ) : null}

        {/* Re-detect prompt if only city/pincode (no coordinates) */}
        {!hasCoords && hasCity && (
          <div style={{
            marginTop: shops.length > 0 ? 28 : 0,
            padding: '14px 20px', borderRadius: 14,
            background: 'rgba(124,58,237,0.04)',
            border: '1px solid rgba(124,58,237,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text)' }}>Enable GPS</strong> for more precise nearby results
            </div>
            <button
              onClick={detect}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10,
                background: '#7c3aed', color: '#fff',
                border: 'none', fontWeight: 600, fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <Navigation size={13} /> Use precise location
            </button>
          </div>
        )}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulseGeo {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </section>
  );
};

export default NearbyShopsSection;
