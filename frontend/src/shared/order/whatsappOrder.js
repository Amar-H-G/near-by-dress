/**
 * whatsappOrder.js
 * Core WhatsApp formatting and deep-linking orchestration.
 * Formats structured messages specifically for the enterprise NBD Admin queue.
 */

export const ADMIN_WA_NUMBER = '918167827523';

/**
 * Sanitize text parameters for safe WhatsApp URL injection.
 */
export const sanitizeText = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
};

/**
 * Validate customer address/pincode fields for mobile dispatch.
 */
export const validateOrderForm = ({ name, phone, address, pincode, city }) => {
  const errors = {};

  if (!name?.trim()) errors.name = 'Full name is required';
  if (!phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    errors.phone = 'Enter a valid 10-digit mobile number';
  }
  if (!address?.trim()) errors.address = 'Delivery address is required';
  if (!city?.trim()) errors.city = 'City is required';
  if (!pincode?.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(pincode.trim())) {
    errors.pincode = 'Pincode must be exactly 6 digits';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Formats a premium, structured order message.
 * Matches specifications exactly.
 */
export const generateOrderMessage = (customer, product) => {
  const displayPrice = product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(displayPrice || 0));

  const productUrl = product.id
    ? `${window.location.origin}/products/${product.id}`
    : window.location.href;

  const lines = [
    `Hello NearByDress Admin Team,`,
    ``,
    `I want to place an order.`,
    ``,
    `Customer Details:`,
    `Name: ${sanitizeText(customer.name)}`,
    `Phone: ${sanitizeText(customer.phone)}`,
    `Address: ${sanitizeText(customer.address)}`,
    `Pincode: ${sanitizeText(customer.pincode)}`,
    `City/State: ${sanitizeText(customer.city)}${customer.state ? ` / ${sanitizeText(customer.state)}` : ''}`,
    ``,
    `Product Details:`,
    `Product: ${sanitizeText(product.name)}`,
    `Price: ${formattedPrice}`,
    `Size: ${sanitizeText(product.selectedSize || 'N/A')}`,
    `Color: ${sanitizeText(product.selectedColor || 'N/A')}`,
    `Quantity: ${product.quantity || 1}`,
    `Shop: ${sanitizeText(product.shopName || 'N/A')}`,
    ``,
    `Product Link:`,
    productUrl,
    ``,
    `Additional Notes: ${sanitizeText(customer.note || 'N/A')}`,
    ``,
    `Please confirm availability.`,
  ];

  return lines.join('\n');
};

/**
 * Direct WhatsApp URL construction targeting Admin queue.
 */
export const buildAdminWhatsAppUrl = (message) => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encoded}`;
};

/**
 * Opens WhatsApp in client browser window.
 */
export const openAdminWhatsApp = (message) => {
  const url = buildAdminWhatsAppUrl(message);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
};
