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

// Services
export * as locationService from './services/locationService';

// Utils
export * from './utils/geoUtils';
