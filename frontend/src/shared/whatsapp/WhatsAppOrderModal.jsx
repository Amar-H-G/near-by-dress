/**
 * WhatsAppOrderModal.jsx
 * Premium WhatsApp order collection modal.
 * Collects customer details, validates, and routes order to admin.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle, Loader2, MapPin, MessageCircle,
  Phone, ShoppingBag, User, X,
} from 'lucide-react';
import { generateOrderMessage } from './generateOrderMessage';
import { openAdminWhatsApp, validateOrderForm } from './whatsappOrder';

// ── Helpers ────────────────────────────────────────────────────────────────
const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const EMPTY_FORM = {
  name: '', phone: '', address: '', city: '', state: '', pincode: '', note: '',
};

// ── Field component ────────────────────────────────────────────────────────
const Field = ({ label, id, icon: Icon, error, required, ...props }) => (
  <div className="wa-field">
    <label htmlFor={id} className="wa-label">
      {Icon && <Icon size={13} />}
      {label}
      {required && <span className="wa-required">*</span>}
    </label>
    {props.as === 'textarea' ? (
      <textarea
        id={id}
        className={`wa-input wa-textarea ${error ? 'wa-input-error' : ''}`}
        rows={2}
        {...props}
        as={undefined}
      />
    ) : (
      <input
        id={id}
        className={`wa-input ${error ? 'wa-input-error' : ''}`}
        {...props}
      />
    )}
    {error && <span className="wa-error-msg">{error}</span>}
  </div>
);

// ── Main Modal ─────────────────────────────────────────────────────────────
const WhatsAppOrderModal = memo(({ isOpen, onClose, product }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const firstInputRef = useRef(null);
  const overlayRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitted(false);
      // Focus first input after animation
      setTimeout(() => firstInputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [errors]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const { valid, errors: fieldErrors } = validateOrderForm(form);
    if (!valid) {
      setErrors(fieldErrors);
      // Focus first error field
      const firstErrorKey = Object.keys(fieldErrors)[0];
      document.getElementById(`wa-${firstErrorKey}`)?.focus();
      return;
    }

    setSending(true);

    const message = generateOrderMessage(
      {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        note: form.note,
      },
      {
        name: product?.name,
        price: product?.price,
        discountPrice: product?.discountPrice,
        selectedSize: product?.selectedSize,
        selectedColor: product?.selectedColor,
        quantity: product?.quantity || 1,
        id: product?.id || product?._id,
        shopName: product?.shopName || product?.shop?.name,
      }
    );

    // Small delay so user sees the "Sending…" state
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      openAdminWhatsApp(message);
    }, 600);
  }, [form, product]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const displayPrice = product?.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product?.price;

  return (
    <div
      className="wa-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Place WhatsApp Order"
    >
      <div className="wa-modal">
        {/* ── Header ── */}
        <div className="wa-modal-header">
          <div className="wa-modal-brand">
            <div className="wa-modal-icon">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="wa-modal-title">Order via WhatsApp</h2>
              <p className="wa-modal-sub">We'll confirm your order instantly</p>
            </div>
          </div>
          <button
            type="button"
            className="wa-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Product Preview Strip ── */}
        {product && (
          <div className="wa-product-strip">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="wa-product-img"
                loading="lazy"
              />
            )}
            <div className="wa-product-info">
              <span className="wa-product-label">Ordering</span>
              <strong className="wa-product-name">{product.name}</strong>
              <div className="wa-product-meta-row">
                <span className="wa-product-price">{formatPrice(displayPrice)}</span>
                {product.selectedSize && (
                  <span className="wa-product-option">Size: {product.selectedSize}</span>
                )}
                {product.selectedColor && (
                  <span className="wa-product-option">Color: {product.selectedColor}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Success State ── */}
        {submitted ? (
          <div className="wa-success">
            <div className="wa-success-icon">
              <CheckCircle size={40} />
            </div>
            <h3>WhatsApp Opening!</h3>
            <p>
              Your order details have been prepared. Complete the conversation
              with our admin team to confirm your order.
            </p>
            <button type="button" className="wa-btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <form className="wa-form" onSubmit={handleSubmit} noValidate>
            <div className="wa-section-label">
              <User size={13} />
              Your Details
            </div>

            <div className="wa-grid-2">
              <Field
                label="Full Name"
                id="wa-name"
                name="name"
                icon={User}
                value={form.name}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                autoComplete="name"
                required
                error={errors.name}
                ref={firstInputRef}
              />
              <Field
                label="Phone Number"
                id="wa-phone"
                name="phone"
                icon={Phone}
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                autoComplete="tel"
                inputMode="numeric"
                required
                error={errors.phone}
              />
            </div>

            <Field
              label="Delivery Address"
              id="wa-address"
              name="address"
              icon={MapPin}
              value={form.address}
              onChange={handleChange}
              placeholder="House / Street / Area"
              autoComplete="street-address"
              required
              error={errors.address}
            />

            <div className="wa-grid-3">
              <Field
                label="City"
                id="wa-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Kolkata"
                required
                error={errors.city}
              />
              <Field
                label="State"
                id="wa-state"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="West Bengal"
              />
              <Field
                label="Pincode"
                id="wa-pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="700001"
                inputMode="numeric"
                maxLength={6}
                error={errors.pincode}
              />
            </div>

            <Field
              label="Additional Note (optional)"
              id="wa-note"
              name="note"
              as="textarea"
              value={form.note}
              onChange={handleChange}
              placeholder="Any special requests, preferred colors, customizations..."
            />

            {/* ── Quantity (optional) ── */}
            <div className="wa-field">
              <label htmlFor="wa-qty" className="wa-label">
                <ShoppingBag size={13} />
                Quantity
              </label>
              <div className="wa-qty-control">
                <button
                  type="button"
                  className="wa-qty-btn"
                  onClick={() =>
                    setForm((p) => ({ ...p, qty: Math.max(1, (p.qty || 1) - 1) }))
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="wa-qty-value">{form.qty || 1}</span>
                <button
                  type="button"
                  className="wa-qty-btn"
                  onClick={() =>
                    setForm((p) => ({ ...p, qty: Math.min(20, (p.qty || 1) + 1) }))
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="wa-admin-note">
              <MessageCircle size={13} />
              <span>
                Your order goes to our admin team first. We'll coordinate
                delivery &amp; payment within minutes.
              </span>
            </div>

            <button
              type="submit"
              className="wa-btn-primary"
              disabled={sending}
              id="wa-submit-btn"
            >
              {sending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Preparing your order…
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Send Order on WhatsApp
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
});

WhatsAppOrderModal.displayName = 'WhatsAppOrderModal';
export default WhatsAppOrderModal;
