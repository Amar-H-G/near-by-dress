/**
 * useUserLocation.js
 * Custom hook — manages customer-side geo-location state
 *
 * State machine:
 *   idle → requesting → resolved | denied | error
 *
 * Persists the last-known location in sessionStorage so we don't re-prompt
 * on every page navigation within the same browser session.
 */

import { useState, useCallback, useEffect } from 'react';
import { reverseGeocode } from '../services/locationService';
import { isValidCoords } from '../utils/geoUtils';

const SESSION_KEY = 'nbd_user_location';

const INITIAL_STATE = {
  status: 'idle',     // 'idle' | 'requesting' | 'resolved' | 'denied' | 'error'
  lat: null,
  lng: null,
  accuracy: null,     // metres from Geolocation API
  pincode: null,
  city: null,
  state: null,
  country: null,
  formattedAddress: null,
  error: null,
};

/**
 * Restore a previously stored location from session storage
 */
const loadFromSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidCoords(parsed.lat, parsed.lng)) return parsed;
  } catch (_) {}
  return null;
};

/**
 * Persist location to session storage (survives page navigation, not tab close)
 */
const saveToSession = (location) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(location));
  } catch (_) {}
};

/**
 * @param {{ autoDetect?: boolean, onResolved?: (location) => void }} options
 */
const useUserLocation = ({ autoDetect = false, onResolved } = {}) => {
  const [location, setLocation] = useState(() => loadFromSession() || INITIAL_STATE);

  // ── Core detect function ───────────────────────────────────────────────────
  const detect = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        status: 'error',
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, status: 'requesting', error: null }));

    try {
      // 1. Ask browser for GPS coordinates
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,  // faster, battery-friendly
          timeout: 10_000,
          maximumAge: 5 * 60 * 1000, // accept 5-min cached position
        })
      );

      const { latitude: lat, longitude: lng, accuracy } = position.coords;

      // 2. Optimistically update with raw coords (UI can show map immediately)
      setLocation((prev) => ({
        ...prev,
        status: 'requesting', // still fetching address
        lat,
        lng,
        accuracy,
      }));

      // 3. Reverse geocode via backend → OSM Nominatim
      let geoData = {};
      try {
        geoData = await reverseGeocode(lat, lng);
      } catch (_) {
        // Non-fatal — we still have coords
      }

      const resolved = {
        status: 'resolved',
        lat,
        lng,
        accuracy,
        pincode: geoData.pincode || null,
        city: geoData.city || null,
        state: geoData.state || null,
        country: geoData.country || null,
        formattedAddress: geoData.formattedAddress || null,
        error: null,
      };

      setLocation(resolved);
      saveToSession(resolved);
      onResolved?.(resolved);
    } catch (err) {
      // GeolocationPositionError codes: 1=PERMISSION_DENIED 2=UNAVAILABLE 3=TIMEOUT
      const isDenied = err?.code === 1;
      setLocation((prev) => ({
        ...prev,
        status: isDenied ? 'denied' : 'error',
        error: isDenied
          ? 'Location access was denied. Please allow location in your browser settings.'
          : 'Could not detect your location. Please try again.',
      }));
    }
  }, [onResolved]);

  // ── Auto-detect on mount (opt-in) ─────────────────────────────────────────
  useEffect(() => {
    if (autoDetect && location.status === 'idle') {
      detect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetect]);

  // ── Manual override ────────────────────────────────────────────────────────
  const setManualLocation = useCallback((lat, lng, extraData = {}) => {
    const manual = {
      status: 'resolved',
      lat,
      lng,
      accuracy: null,
      error: null,
      ...extraData,
    };
    setLocation(manual);
    saveToSession(manual);
    onResolved?.(manual);
  }, [onResolved]);

  const clear = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setLocation(INITIAL_STATE);
  }, []);

  return {
    location,
    detect,
    setManualLocation,
    clear,
    isIdle: location.status === 'idle',
    isRequesting: location.status === 'requesting',
    isResolved: location.status === 'resolved',
    isDenied: location.status === 'denied',
    isError: location.status === 'error' || location.status === 'denied',
  };
};

export default useUserLocation;
