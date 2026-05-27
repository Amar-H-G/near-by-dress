/**
 * orderStorage.js
 * Persistent state manager for pending guest orders during the login transition.
 */
const STORAGE_KEY = 'nbd_pending_order';

export const savePendingOrder = (orderData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...orderData,
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.error('Failed to save pending order', e);
  }
};

export const getPendingOrder = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Clear orders older than 30 minutes to avoid stale resumes
    const ageMs = Date.now() - (parsed.timestamp || 0);
    if (ageMs > 30 * 60 * 1000) {
      clearPendingOrder();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearPendingOrder = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear pending order', e);
  }
};
