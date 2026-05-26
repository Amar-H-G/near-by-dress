/**
 * useShopLocation.js
 * Hook for seller/admin to manage a specific shop's location state
 * Handles: current coordinates display, map picker interaction, save to backend
 */

import { useState, useCallback } from 'react';
import { setShopLocation, reverseGeocode } from '../services/locationService';
import { isValidCoords, geoJsonToLatLng } from '../utils/geoUtils';
import toast from 'react-hot-toast';

/**
 * @param {object} shop  — current shop document from backend
 */
const useShopLocation = (shop) => {
  const existing = shop?.location?.coordinates
    ? geoJsonToLatLng(shop.location.coordinates)
    : null;

  const [coords, setCoords] = useState(existing); // { lat, lng } | null
  const [serviceRadiusKm, setServiceRadiusKm] = useState(shop?.serviceRadiusKm ?? 10);
  const [geoAddress, setGeoAddress] = useState(shop?.formattedAddress || null);
  const [saving, setSaving] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);

  // ── Called when user picks a point on the map ──────────────────────────────
  const onMapClick = useCallback(async (lat, lng) => {
    if (!isValidCoords(lat, lng)) return;
    setCoords({ lat, lng });

    // Reverse geocode to show human-readable address below the map
    setReverseLoading(true);
    try {
      const data = await reverseGeocode(lat, lng);
      setGeoAddress(data.formattedAddress);
    } catch (_) {
      setGeoAddress(null);
    } finally {
      setReverseLoading(false);
    }
  }, []);

  // ── Save to backend ────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    if (!shop?._id) return;
    if (!coords || !isValidCoords(coords.lat, coords.lng)) {
      toast.error('Please select a valid location on the map');
      return;
    }

    setSaving(true);
    try {
      await setShopLocation(shop._id, {
        lat: coords.lat,
        lng: coords.lng,
        serviceRadiusKm,
      });
      toast.success('Shop location saved successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save location');
    } finally {
      setSaving(false);
    }
  }, [shop, coords, serviceRadiusKm]);

  const hasLocation = coords && isValidCoords(coords.lat, coords.lng);

  return {
    coords,
    setCoords,
    serviceRadiusKm,
    setServiceRadiusKm,
    geoAddress,
    onMapClick,
    save,
    saving,
    reverseLoading,
    hasLocation,
  };
};

export default useShopLocation;
