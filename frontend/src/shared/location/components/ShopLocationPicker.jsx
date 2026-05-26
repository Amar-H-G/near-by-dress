/**
 * ShopLocationPicker.jsx
 * High-performance, premium SaaS location onboarding UI for seller storefront setup.
 * Integrates:
 * - Precise Leaflet.js map with a draggable marker
 * - Auto GPS geolocation detection with reverse-geocoding
 * - Live forward-geocoding (center pin by typing address or pincode)
 * - Complete manual form fields (Address, City, State, Pincode) with auto-fill sync
 * - Interactive delivery radius configuration
 *
 * Saves both precise coordinates (lat, lng) and structured textual addresses in one unified action.
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import {
  MapPin, Navigation, Loader2, Save,
  Compass, ShieldCheck, HelpCircle, Map, Search
} from 'lucide-react';
import { reverseGeocode, forwardGeocode, setShopLocation } from '../services/locationService';
import { updateSellerProfile } from '../../../seller/services/sellerApi';
import { adminUpdateShop } from '../../../admin/services/admin.service';
import { useAuth } from '../../../core/auth/useAuth';
import { isValidCoords } from '../utils/geoUtils';
import toast from 'react-hot-toast';

const MapPicker = lazy(() => import('../../maps/MapPicker'));

const ShopLocationPicker = ({ shop, onSaved, readOnly = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Extract initial geo coordinates
  const initialLat = shop?.location?.coordinates?.[1] || null;
  const initialLng = shop?.location?.coordinates?.[0] || null;

  const [coords, setCoords] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [serviceRadiusKm, setServiceRadiusKm] = useState(shop?.serviceRadiusKm || 10);
  
  // Manual address fields
  const [address, setAddress] = useState(shop?.address || '');
  const [city, setCity] = useState(shop?.city || '');
  const [state, setState] = useState(shop?.state || '');
  const [pincode, setPincode] = useState(shop?.pincode || '');

  // UI Loaders
  const [detecting, setDetecting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync with shop profile prop changes
  useEffect(() => {
    if (shop) {
      const shLat = shop.location?.coordinates?.[1];
      const shLng = shop.location?.coordinates?.[0];
      if (shLat && shLng) setCoords({ lat: shLat, lng: shLng });
      setServiceRadiusKm(shop.serviceRadiusKm || 10);
      setAddress(shop.address || '');
      setCity(shop.city || '');
      setState(shop.state || '');
      setPincode(shop.pincode || '');
    }
  }, [shop]);

  // ── 1. Geocode Typed Address (Manual entry -> Map Pin) ────────────────────
  const handleGeocodeAddress = async () => {
    const query = [address, city, state, pincode].filter(Boolean).join(', ');
    if (!query) {
      toast.error('Please fill in some address fields first to search.');
      return;
    }

    setGeocoding(true);
    try {
      const geo = await forwardGeocode(query);
      if (geo && isValidCoords(geo.lat, geo.lng)) {
        setCoords({ lat: geo.lat, lng: geo.lng });
        
        // Auto-fill refined details if Nominatim returns them
        if (geo.city) setCity(geo.city);
        if (geo.state) setState(geo.state);
        if (geo.pincode) setPincode(geo.pincode);
        if (geo.formattedAddress && !address) setAddress(geo.formattedAddress);

        toast.success('Pin successfully positioned based on address!');
      } else {
        toast.error('Could not locate address on the map. Try drag & drop instead.');
      }
    } catch (err) {
      toast.error(err.message || 'Address search failed.');
    } finally {
      setGeocoding(false);
    }
  };

  // ── 2. Click or Drag Pin on Map (Map Pin -> Form Fields Auto-fill) ──────────
  const handleMapPositionChange = async (lat, lng) => {
    if (!isValidCoords(lat, lng)) return;
    setCoords({ lat, lng });

    // Reverse geocode to populate manual fields
    setGeocoding(true);
    try {
      const data = await reverseGeocode(lat, lng);
      if (data) {
        if (data.pincode) setPincode(data.pincode);
        if (data.city) setCity(data.city);
        if (data.state) setState(data.state);
        
        const streetDetails = [data.road, data.suburb].filter(Boolean).join(', ');
        if (streetDetails) {
          setAddress(streetDetails);
        } else if (data.formattedAddress) {
          setAddress(data.formattedAddress.split(',').slice(0, 2).join(','));
        }
        toast.success('Address auto-updated from chosen map location!');
      }
    } catch (_) {
      // Non-fatal, user can still type manually
    } finally {
      setGeocoding(false);
    }
  };

  // ── 3. Auto Detect GPS Location ──────────────────────────────────────────
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handleMapPositionChange(latitude, longitude);
        setDetecting(false);
      },
      () => {
        toast.error('GPS permission denied or timed out. Please enter address manually.');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // ── 4. Unified Business Location Saver ──────────────────────────────────────
  const handleSaveLocation = async () => {
    if (!shop?._id) return;
    if (!coords || !isValidCoords(coords.lat, coords.lng)) {
      toast.error('Please place a marker on the map to save your shop coordinates.');
      return;
    }
    if (!address || !city || !state || !pincode) {
      toast.error('Please complete all address fields (Street, City, State, Pincode) before saving.');
      return;
    }

    setSaving(true);
    try {
      // Step A: Save exact coordinates & delivery radius
      await setShopLocation(shop._id, {
        lat: coords.lat,
        lng: coords.lng,
        serviceRadiusKm,
      });

      // Step B: Save customized textual address details in shop profile
      const profileFormData = new FormData();
      profileFormData.append('address', address);
      profileFormData.append('city', city);
      profileFormData.append('state', state);
      profileFormData.append('pincode', pincode);

      if (isAdmin) {
        await adminUpdateShop(shop._id, profileFormData);
      } else {
        await updateSellerProfile(profileFormData);
      }

      toast.success('Shop storefront location & address saved successfully!');
      onSaved?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error occurred while saving location settings.');
    } finally {
      setSaving(false);
    }
  };

  const mapCenter = coords && isValidCoords(coords.lat, coords.lng)
    ? coords
    : { lat: 22.5726, lng: 88.3639 }; // Kolkata default

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', width: '100%' }}>
      
      {/* Visual Workspace Row: Map + Config Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Map Canvas */}
        <div style={{ position: 'relative', minHeight: '360px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <Suspense fallback={
            <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)' }}>
              <Loader2 size={32} className="animate-spin" color="#7c3aed" />
            </div>
          }>
            <MapPicker
              center={mapCenter}
              markerPos={coords && isValidCoords(coords.lat, coords.lng) ? coords : null}
              onClick={readOnly ? undefined : handleMapPositionChange}
              readOnly={readOnly}
              height="360px"
              radiusKm={serviceRadiusKm}
              zoom={15}
            />
          </Suspense>

          {/* Floating GPS Snap Button on top of map */}
          {!readOnly && (
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={detecting}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: '14px',
                background: '#fff',
                border: '1px solid rgba(124, 58, 237, 0.15)',
                color: '#7c3aed',
                fontWeight: 700,
                fontSize: '12px',
                boxShadow: '0 8px 30px rgba(124, 58, 237, 0.12)',
                cursor: detecting ? 'wait' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(124, 58, 237, 0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124, 58, 237, 0.12)'; }}
            >
              {detecting ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {detecting ? 'GPS Locating...' : 'Snap to My GPS'}
            </button>
          )}
        </div>

        {/* Manual Address Form Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: 'var(--bg-2)',
          padding: '24px',
          borderRadius: '24px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={16} color="#7c3aed" />
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Address & Service Scope
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Street Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Street / Building Details</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="e.g. Shop 24B, Park Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={readOnly}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 38px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
                <MapPin size={15} color="var(--text-faint)" style={{ position: 'absolute', left: '12px' }} />
              </div>
            </div>

            {/* City */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>City</label>
              <input
                type="text"
                placeholder="e.g. Kolkata"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* State */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>State</label>
              <input
                type="text"
                placeholder="e.g. West Bengal"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            {/* Pincode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Pincode</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 700016"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                disabled={readOnly}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  letterSpacing: '1px',
                }}
              />
            </div>

            {/* Live Search Trigger button */}
            {!readOnly && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={geocoding || !address}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(124, 58, 237, 0.25)',
                    background: 'none',
                    color: '#7c3aed',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: geocoding || !address ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { if (!geocoding && address) e.currentTarget.style.background = 'rgba(124,58,237,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  {geocoding ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Find On Map
                </button>
              </div>
            )}
          </div>

          {/* Proximity / Radius Slider Control */}
          <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                Boutique Discovery Scope (Service Radius)
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 800, color: '#7c3aed',
                background: 'rgba(124, 58, 237, 0.08)', padding: '4px 10px', borderRadius: '8px'
              }}>
                {serviceRadiusKm} km coverage
              </span>
            </div>
            {!readOnly ? (
              <>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', height: '6px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-faint)', fontWeight: 600, marginTop: '4px' }}>
                  <span>1 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Configured service area boundary is {serviceRadiusKm} km around storefront pin.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Coordinate & Accuracy Alert Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 24px',
        background: 'rgba(124, 58, 237, 0.03)',
        border: '1.5px dashed rgba(124, 58, 237, 0.25)',
        borderRadius: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={20} color="#7c3aed" style={{ flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase' }}>Precise Geo Coordinates</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
              {coords ? `${coords.lat.toFixed(6)} (N), ${coords.lng.toFixed(6)} (E)` : 'Pin Location Not Selected'}
            </div>
          </div>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleSaveLocation}
            disabled={saving || !coords}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: '16px',
              border: 'none',
              background: coords ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'var(--bg-2)',
              color: coords ? '#fff' : 'var(--text-faint)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: coords && !saving ? 'pointer' : 'not-allowed',
              boxShadow: coords && !saving ? '0 6px 20px rgba(124, 58, 237, 0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Publishing Location...' : 'Save & Publish Location'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopLocationPicker;
