/**
 * whatsappOrder.js
 * Central WhatsApp order utility for NearByDress.
 * ALL customer orders route through the PLATFORM ADMIN number.
 * The admin number is read from DB settings at runtime.
 */

/**
 * Sanitize a string so it is safe inside a WhatsApp URL text param.
 */
export const sanitizeText = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/[<>]/g, '')         // strip angle brackets (XSS guard)
    .replace(/javascript:/gi, '') // strip JS protocol
    .trim();
};

/**
 * Get the platform admin WhatsApp number from settings.
 * Falls back to empty string (will render gracefully).
 * @param {Object} settings - From SettingsContext
 */
export const getAdminWaNumber = (settings) =>
  settings?.whatsapp?.adminNumber || '';

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
 * @param {Object} settings - From SettingsContext
 * @param {string} message  - Full order message text
 */
export const buildAdminWhatsAppUrl = (settings, message) => {
  const number = getAdminWaNumber(settings);
  if (!number) return '#';
  const encoded = encodeURIComponent(sanitizeText(message));
  return `https://wa.me/${number}?text=${encoded}`;
};

/**
 * Open WhatsApp in a new tab.
 * @param {Object} settings - From SettingsContext
 * @param {string} message  - Full order message text
 */
export const openAdminWhatsApp = (settings, message) => {
  const url = buildAdminWhatsAppUrl(settings, message);
  if (url === '#') return;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
};
