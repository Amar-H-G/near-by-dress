/**
 * LocationProvider.jsx
 * Global location state for customer-facing pages.
 *
 * Responsibilities:
 * - GPS detection via navigator.geolocation
 * - Reverse geocoding via our backend → OSM Nominatim
 * - Session persistence (no re-prompt on navigation)
 * - Manual pincode/city fallback
 * - Controls popup visibility
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { LocationContext } from '../contexts/location-context';
import { reverseGeocode, forwardGeocode } from '../../shared/location/services/locationService';

const SESSION_KEY = 'nbd_user_location';
const DISMISSED_KEY = 'nbd_loc_dismissed'; // sessionStorage flag

// ── Helpers ────────────────────────────────────────────────────────────────────
const loadSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') return parsed;
  } catch (_) {}
  return null;
};

const saveSession = (data) => {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch (_) {}
};

const IDLE = {
  status: 'idle',
  lat: null, lng: null,
  pincode: null, city: null, state: null,
  country: null, formattedAddress: null,
  error: null,
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => loadSession() || IDLE);

  // Popup shown once per session to new visitors who haven't set location yet
  const [showPopup, setShowPopup] = useState(false);
  const initiated = useRef(false);

  // Show popup after a short delay on first visit (only if no session location)
  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const alreadyDismissed = sessionStorage.getItem(DISMISSED_KEY);
    const hasLocation = loadSession();

    if (!hasLocation && !alreadyDismissed) {
      const t = setTimeout(() => setShowPopup(true), 1800); // 1.8s delay — let page render
      return () => clearTimeout(t);
    }
  }, []);

  // ── GPS detection ────────────────────────────────────────────────────────────
  const detect = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation((p) => ({
        ...p, status: 'error',
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    setLocation((p) => ({ ...p, status: 'requesting', error: null }));

    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 5 * 60 * 1000,
        })
      );

      const { latitude: lat, longitude: lng } = position.coords;

      // Immediate optimistic update — map can render right away
      setLocation((p) => ({ ...p, status: 'requesting', lat, lng }));

      // Reverse geocode in background
      let geo = {};
      try { geo = await reverseGeocode(lat, lng); } catch (_) {}

      const resolved = {
        status: 'resolved',
        lat, lng,
        pincode: geo.pincode || null,
        city: geo.city || null,
        state: geo.state || null,
        country: geo.country || null,
        formattedAddress: geo.formattedAddress || null,
        error: null,
      };

      setLocation(resolved);
      saveSession(resolved);
      setShowPopup(false);

    } catch (err) {
      const denied = err?.code === 1;
      setLocation((p) => ({
        ...p,
        status: denied ? 'denied' : 'error',
        error: denied
          ? 'Location access was denied. Enter your pincode manually to find nearby shops.'
          : 'Could not fetch location. Please try again or enter your pincode.',
      }));
    }
  }, []);

  // ── Manual fallback (pincode/city entry) ────────────────────────────────────
  const setManual = useCallback((pincode, city, state = '') => {
    const manual = {
      status: 'resolved',
      lat: null, lng: null, // no coordinates — backend will filter by pincode/city
      pincode: pincode || null,
      city: city || null,
      state: state || null,
      country: null,
      formattedAddress: [city, state].filter(Boolean).join(', ') || null,
      error: null,
    };
    setLocation(manual);
    saveSession(manual);
    setShowPopup(false);
  }, []);

  // ── Manual Pincode Search with Geocoding ────────────────────────────────────
  const setManualPincode = useCallback(async (pincode) => {
    if (!/^\d{6}$/.test(pincode)) {
      throw new Error('Pincode must be exactly 6 digits');
    }

    setLocation((p) => ({ ...p, status: 'requesting', error: null }));

    try {
      const geo = await forwardGeocode(pincode);
      
      const resolved = {
        status: 'resolved',
        lat: geo.lat,
        lng: geo.lng,
        pincode: pincode,
        city: geo.city || null,
        state: geo.state || null,
        country: geo.country || null,
        formattedAddress: geo.formattedAddress || `${pincode}, India`,
        error: null,
      };

      setLocation(resolved);
      saveSession(resolved);
      setShowPopup(false);
      return resolved;
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || 'Pincode not found. Please try another pincode.';
      setLocation((p) => ({
        ...p,
        status: 'error',
        error: errMsg,
      }));
      throw new Error(errMsg);
    }
  }, []);

  // ── Dismiss popup ─────────────────────────────────────────────────────────────
  const dismissPopup = useCallback(() => {
    setShowPopup(false);
    sessionStorage.setItem(DISMISSED_KEY, '1');
  }, []);

  const clearLocation = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(DISMISSED_KEY);
    setLocation(IDLE);
    setShowPopup(true);
  }, []);

  return (
    <LocationContext.Provider value={{
      location,
      detect,
      setManual,
      setManualPincode,
      clearLocation,
      showPopup,
      dismissPopup,
    }}>
      {children}
    </LocationContext.Provider>
  );
};
