import { createContext } from 'react';

/**
 * LocationContext — global customer location state
 *
 * Shape:
 *   location: {
 *     status: 'idle' | 'requesting' | 'resolved' | 'denied' | 'error'
 *     lat: number | null
 *     lng: number | null
 *     pincode: string | null
 *     city: string | null
 *     state: string | null
 *     country: string | null
 *     formattedAddress: string | null
 *     error: string | null
 *   }
 *   detect: () => Promise<void>          — trigger GPS detection
 *   setManual: (pincode, city, state) => void  — fallback manual entry
 *   setManualPincode: (pincode) => Promise<void> — search location with geocoding by pincode
 *   clearLocation: () => void
 *   showPopup: boolean
 *   dismissPopup: () => void
 */
export const LocationContext = createContext(null);
