/**
 * contact.js
 * Centralized, secure contact configuration.
 *
 * SECURITY RULES:
 * - Admin phone is NEVER rendered as visible text in the UI.
 * - It is used ONLY inside WhatsApp URLs (wa.me/...).
 * - All public-facing contact is email-first.
 */

// ── Admin WhatsApp (internal only — never display in UI) ───────────────────
const ADMIN_PHONE_RAW = '918167827523'; // E.164 without +

/** Build a WhatsApp URL with a pre-filled message. Number is never exposed in the UI. */
export const buildWhatsAppUrl = (message = '') =>
  `https://wa.me/${ADMIN_PHONE_RAW}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

/** Open WhatsApp in a new tab safely. */
export const openWhatsApp = (message = '') => {
  const url = buildWhatsAppUrl(message);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
};

// ── Public-facing contact ──────────────────────────────────────────────────
export const CONTACT = {
  /** Primary support email — publicly visible */
  email: 'localshop8927@gmail.com',

  /** Support page label */
  supportLabel: 'Contact Support',

  /** WhatsApp CTA label — number never shown */
  whatsappLabel: 'Chat on WhatsApp',

  /** Fashion inquiry label */
  inquiryLabel: 'Fashion Inquiry',
};
