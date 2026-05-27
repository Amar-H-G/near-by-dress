/**
 * WhatsAppOrderModal.jsx
 * Enterprise-grade luxury order sheet with inline address overrides.
 * Seamless, keyboard-safe layout optimized for all mobile breakpoints.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle, Loader2, MapPin, MessageCircle,
  Phone, ShoppingBag, User, X, Edit3, HelpCircle
} from 'lucide-react';
import { openAdminWhatsApp, validateOrderForm, generateOrderMessage } from './whatsappOrder';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const Field = ({ label, id, icon: Icon, error, required, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text, #111)' }}>
      {Icon && <Icon size={12} color="#7c3aed" />}
      {label}
      {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    {props.as === 'textarea' ? (
      <textarea
        id={id}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '12px',
          border: `1.5px solid ${error ? '#ef4444' : 'var(--border, rgba(0,0,0,0.08))'}`,
          background: 'var(--bg-2, #f9f9fb)',
          color: 'var(--text, #111)',
          fontSize: '14px',
          fontWeight: 500,
          outline: 'none',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
        rows={2}
        {...props}
        as={undefined}
      />
    ) : (
      <input
        id={id}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '12px',
          border: `1.5px solid ${error ? '#ef4444' : 'var(--border, rgba(0,0,0,0.08))'}`,
          background: 'var(--bg-2, #f9f9fb)',
          color: 'var(--text, #111)',
          fontSize: '14px',
          fontWeight: 500,
          outline: 'none',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
        {...props}
      />
    )}
    {error && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>{error}</span>}
  </div>
);

const WhatsAppOrderModal = memo(({ isOpen, onClose, product, userProfile, currentLoc }) => {
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '', note: '', qty: 1
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  
  const firstInputRef = useRef(null);
  const overlayRef = useRef(null);

  // Auto-fill from profile and active location on mount/open
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: userProfile?.name || '',
        phone: userProfile?.phone || '',
        address: userProfile?.address || '',
        city: userProfile?.city || currentLoc?.city || '',
        state: userProfile?.state || currentLoc?.state || '',
        pincode: userProfile?.pincode || currentLoc?.pincode || '',
        note: '',
        qty: product?.quantity || 1
      });
      setErrors({});
      setSubmitted(false);
      
      const timer = setTimeout(() => firstInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, userProfile, currentLoc, product]);

  // Trap scroll
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [errors]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const { valid, errors: fieldErrors } = validateOrderForm(form);
    if (!valid) {
      setErrors(fieldErrors);
      const firstError = Object.keys(fieldErrors)[0];
      document.getElementById(`wa-${firstError}`)?.focus();
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
        note: form.note
      },
      {
        id: product?.id || product?._id,
        name: product?.name,
        price: product?.price,
        discountPrice: product?.discountPrice,
        selectedSize: product?.selectedSize,
        selectedColor: product?.selectedColor,
        quantity: form.qty,
        shopName: product?.shopName || product?.shop?.name
      }
    );

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
    : product?.price || 0;

  const subtotal = displayPrice * (form.qty || 1);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 12, 30, 0.45)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: 'var(--surface, #ffffff)',
          borderRadius: '24px',
          border: '1px solid var(--border, rgba(0,0,0,0.06))',
          boxShadow: '0 24px 64px -16px rgba(15, 12, 30, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'orderSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Glow Line banner */}
        <div style={{ height: '5px', background: 'linear-gradient(90deg, #7c3aed, #ec4899)' }} />

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.08)', display: 'grid', placeItems: 'center', color: '#22c55e' }}>
              <MessageCircle size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text, #111)', margin: 0 }}>Confirm WhatsApp Order</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #8b8b9c)', margin: 0 }}>Direct routing to Platform Admin queue</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted, #8b8b9c)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Product preview strip */}
        {product && (
          <div style={{ padding: '16px 24px', background: 'var(--bg-2, #f9f9fb)', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'center' }}>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '56px', height: '68px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7c3aed', background: 'rgba(124,58,237,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                {product.shopName || product.shop?.name || 'Verified Boutique'}
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text, #111)', margin: '4px 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.name}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted, #8b8b9c)' }}>
                <span style={{ fontWeight: 800, color: 'var(--text, #111)' }}>{formatPrice(displayPrice)}</span>
                {product.selectedSize && <span>• Size: {product.selectedSize}</span>}
                {product.selectedColor && <span>• Color: {product.selectedColor}</span>}
              </div>
            </div>
          </div>
        )}

        {submitted ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ color: '#22c55e', animation: 'scaleUp 0.3s ease' }}>
              <CheckCircle size={48} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text, #111)', margin: '8px 0 0' }}>Redirecting to WhatsApp...</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #8b8b9c)', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>
              Your luxury order receipt has been generated. Send the message on WhatsApp to our administrator to confirm your item availability.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: '16px',
                padding: '12px 28px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--text, #111)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }} noValidate>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Edit3 size={13} />
              Delivery Details (Editable)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field
                label="Full Name"
                id="wa-name"
                name="name"
                icon={User}
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
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
                placeholder="Phone number"
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
              placeholder="Apartment, Street Address"
              required
              error={errors.address}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
              <Field
                label="City"
                id="wa-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                required
                error={errors.city}
              />
              <Field
                label="State"
                id="wa-state"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
              />
              <Field
                label="Pincode"
                id="wa-pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                maxLength={6}
                required
                error={errors.pincode}
              />
            </div>

            {/* Qty & Notes block */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, alignItems: 'start' }}>
              {/* Qty Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text, #111)' }}>
                  <ShoppingBag size={12} color="#7c3aed" />
                  Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border, rgba(0,0,0,0.08))', borderRadius: '12px', height: '45px', overflow: 'hidden', background: 'var(--bg-2, #f9f9fb)' }}>
                  <button
                    type="button"
                    style={{ flex: 1, height: '100%', border: 'none', background: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', color: 'var(--text, #111)' }}
                    onClick={() => setForm((p) => ({ ...p, qty: Math.max(1, p.qty - 1) }))}
                  >
                    −
                  </button>
                  <span style={{ flex: 1.2, textAlign: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text, #111)' }}>
                    {form.qty}
                  </span>
                  <button
                    type="button"
                    style={{ flex: 1, height: '100%', border: 'none', background: 'none', fontSize: '16px', fontWeight: 700, cursor: 'pointer', color: 'var(--text, #111)' }}
                    onClick={() => setForm((p) => ({ ...p, qty: Math.min(20, p.qty + 1) }))}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pricing Subtotal strip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text, #111)' }}>
                  Pricing Summary
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '10px 14px', background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.08)', borderRadius: '12px', height: '45px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted, #8b8b9c)' }}>
                    <span>Subtotal ({form.qty} items):</span>
                    <strong style={{ color: '#7c3aed', fontWeight: 800 }}>{formatPrice(subtotal)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <Field
              label="Additional Notes (optional)"
              id="wa-note"
              name="note"
              as="textarea"
              value={form.note}
              onChange={handleChange}
              placeholder="Specify special customization sizes, measurements, colors, or boutique timings..."
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-2, #f9f9fb)', borderRadius: '12px', fontSize: '11px', color: 'var(--text-muted, #8b8b9c)', lineHeight: 1.4 }}>
              <HelpCircle size={14} style={{ flexShrink: 0, color: '#7c3aed' }} />
              <span>We routes order details to our admin desk first. The agent will confirm cash/digital payment & dispatch availability.</span>
            </div>

            <button
              type="submit"
              disabled={sending}
              style={{
                width: '100%',
                minHeight: '52px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Preparing order manifest...
                </>
              ) : (
                <>
                  <MessageCircle size={16} />
                  Send Order on WhatsApp
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes orderSlideIn {
          from { transform: translateY(20px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
});

WhatsAppOrderModal.displayName = 'WhatsAppOrderModal';
export default WhatsAppOrderModal;
