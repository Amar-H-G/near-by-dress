/**
 * whatsappOrder.js
 * Central WhatsApp order utility for NearByDress.
 * ALL customer orders route through the PLATFORM ADMIN number first.
 * Admin: +91 8167827523
 */

// ── Platform admin WhatsApp number (E.164, digits only) ────────────────────
export const ADMIN_WA_NUMBER = '918167827523';

/**
 * Sanitize a string so it is safe inside a WhatsApp URL text param.
 * Removes any HTML/script injection attempts.
 */
export const sanitizeText = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/[<>]/g, '')           // strip angle brackets (XSS guard)
    .replace(/javascript:/gi, '')   // strip JS protocol
    .trim();
};

/**
 * Validate customer form fields.
 * Returns { valid: true } or { valid: false, errors: {} }
 */
export const validateOrderForm = ({ name, phone, address, pincode, city }) => {
  const errors = {};

  if (!name?.trim()) errors.name = 'Name is required';
  if (!phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number';
  }
  if (!address?.trim()) errors.address = 'Delivery address is required';
  if (!city?.trim()) errors.city = 'City is required';
  if (pincode && !/^\d{6}$/.test(pincode.trim())) {
    errors.pincode = 'Pincode must be 6 digits';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Build the final WhatsApp URL to open in a new tab.
 * Always targets the ADMIN number.
 */
export const buildAdminWhatsAppUrl = (message) => {
  const encoded = encodeURIComponent(sanitizeText(message));
  return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encoded}`;
};

/**
 * Open WhatsApp in a new tab.
 * Uses window.open for both Android and iOS compatibility.
 */
export const openAdminWhatsApp = (message) => {
  const url = buildAdminWhatsAppUrl(message);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  // Fallback: if popup blocked, navigate directly
  if (!win) window.location.href = url;
};
