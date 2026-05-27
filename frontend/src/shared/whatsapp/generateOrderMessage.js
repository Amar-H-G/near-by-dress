/**
 * generateOrderMessage.js
 * Generates a premium, structured WhatsApp order message
 * for the NearByDress admin team.
 */

import { sanitizeText } from './whatsappOrder';

const line = '─────────────────────────';

/**
 * @param {Object} customer  - { name, phone, address, city, pincode, state, note }
 * @param {Object} product   - { name, price, discountPrice, selectedSize, selectedColor, quantity, id, shopName }
 * @returns {string}         WhatsApp-ready plain text message
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

  const originalPrice = product.price && product.discountPrice && product.discountPrice < product.price
    ? ` (MRP: ₹${product.price})`
    : '';

  const productUrl = product.id
    ? `${window.location.origin}/products/${product.id}`
    : window.location.href;

  const now = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  const lines = [
    `🛍️ *NEW ORDER REQUEST — NearByDress*`,
    `📅 ${now}`,
    ``,
    line,
    `👤 *CUSTOMER DETAILS*`,
    line,
    `• Name    : ${sanitizeText(customer.name)}`,
    `• Phone   : ${sanitizeText(customer.phone)}`,
    `• Address : ${sanitizeText(customer.address)}`,
    `• City    : ${sanitizeText(customer.city)}${customer.state ? `, ${sanitizeText(customer.state)}` : ''}`,
    customer.pincode ? `• Pincode : ${sanitizeText(customer.pincode)}` : null,
    ``,
    line,
    `🧥 *PRODUCT DETAILS*`,
    line,
    `• Product  : ${sanitizeText(product.name)}`,
    `• Price    : ${formattedPrice}${originalPrice}`,
    product.selectedSize ? `• Size     : ${sanitizeText(product.selectedSize)}` : null,
    product.selectedColor ? `• Color    : ${sanitizeText(product.selectedColor)}` : null,
    `• Quantity : ${product.quantity || 1}`,
    product.shopName ? `• Shop     : ${sanitizeText(product.shopName)}` : null,
    ``,
    `🔗 *Product Link:*`,
    productUrl,
    ``,
    line,
    customer.note ? `📝 *Note:* ${sanitizeText(customer.note)}` : null,
    customer.note ? `` : null,
    `Please confirm availability, delivery timeline, and payment details.`,
    ``,
    `_Sent via NearByDress — Hyperlocal Fashion Marketplace_`,
  ];

  return lines.filter((l) => l !== null).join('\n');
};
