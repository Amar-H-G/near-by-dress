/**
 * Barrel export for the shared location module
 * Usage:
 *   import { useUserLocation, MapPicker, ShopLocationPicker, locationService } from '@/shared/location';
 */

// Hooks
export { default as useUserLocation } from './hooks/useUserLocation';
export { default as useShopLocation } from './hooks/useShopLocation';

// Components
export { default as MapPicker } from './components/MapPicker';
export { default as ShopLocationPicker } from './components/ShopLocationPicker';
export { default as LocationPermissionBanner } from './components/LocationPermissionBanner';
export { default as LocationSearchInput } from './components/LocationSearchInput';
export { default as CurrentLocationButton } from './components/CurrentLocationButton';
export { default as GeoMapPicker } from './components/GeoMapPicker';
export { default as AddressAutocomplete } from './components/AddressAutocomplete';
export { default as LocationPreviewCard } from './components/LocationPreviewCard';

// Services
export * as locationService from './services/locationService';

// Utils
export * from './utils/geoUtils';
