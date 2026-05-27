/**
 * contact.js
 * Dynamic contact helpers — all values sourced from DB settings at runtime.
 *
 * Usage:
 *   import { buildWhatsAppUrl, openWhatsApp } from '../config/contact';
 *   const url = buildWhatsAppUrl(settings, 'Hi!');
 *
 * SECURITY RULES:
 * - Admin phone is NEVER rendered as visible text in the UI.
 * - It is used ONLY inside WhatsApp URLs (wa.me/...).
 * - All public-facing contact is email-first.
 */

/**
 * Build a WhatsApp URL with a pre-filled message.
 * @param {Object} settings  - Settings object from SettingsContext
 * @param {string} message   - Pre-filled message text
 */
export const buildWhatsAppUrl = (settings, message = '') => {
  const number = settings?.whatsapp?.adminNumber || '';
  if (!number) return '#';
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

/**
 * Open WhatsApp in a new tab safely.
 * @param {Object} settings  - Settings object from SettingsContext
 * @param {string} message   - Pre-filled message text
 */
export const openWhatsApp = (settings, message = '') => {
  const url = buildWhatsAppUrl(settings, message);
  if (url === '#') return;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
};

/**
 * Get the support message text from settings.
 * @param {Object} settings
 */
export const getSupportMessage = (settings) =>
  settings?.whatsapp?.supportMessage || "Hi Support, I'm reaching out.";

/**
 * Get the public support email.
 * @param {Object} settings
 */
export const getSupportEmail = (settings) =>
  settings?.contactEmail || '';
