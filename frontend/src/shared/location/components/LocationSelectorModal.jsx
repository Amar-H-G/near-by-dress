/**
 * LocationSelectorModal.jsx
 * A premium, modern, and mobile-friendly location search and pincode selector modal.
 * Features:
 * - Direct 6-digit pincode input (numeric-only with automated validation)
 * - GPS-based high accuracy detection
 * - Clear, modern design language (glowing accents, elegant transitions)
 * - Inline error alerts and beautiful loaders
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 */

import { useState, useEffect, useRef } from 'react';
import {
  MapPin, Navigation, X, Loader2,
  CheckCircle2, AlertCircle, Sparkles, HelpCircle
} from 'lucide-react';
import { useLocation } from '../../../core/contexts/useLocation';

const LocationSelectorModal = ({ isOpen, onClose }) => {
  const { location, detect, setManualPincode, clearLocation } = useLocation();
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount/open
  useEffect(() => {
    if (isOpen) {
      setPincode('');
      setError('');
      setSuccess(false);
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    setError('');
    setSuccess(false);
  };

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await setManualPincode(pincode);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Pincode not found. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGPSDetect = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await detect();
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError('Could not detect location. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 12, 30, 0.5)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          background: 'var(--surface)',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px -16px rgba(15, 12, 30, 0.4), 0 0 0 1px rgba(124, 58, 237, 0.08)',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Upper Glow Banner */}
        <div
          style={{
            height: '6px',
            background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)',
          }}
        />

        {/* Header Section */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '3px 8px', borderRadius: '6px' }}>
                Location Settings
              </span>
              <Sparkles size={13} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text)', marginTop: '8px', marginBottom: '4px' }}>
              Select Delivery Location
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Verify your area to see shops & clothing closest to you.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'var(--bg-2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(90deg)'; e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(0deg)'; e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content area */}
        <div style={{ padding: '0 24px 24px' }}>
          
          {/* Current Location Info Pill */}
          {location.status === 'resolved' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(124, 58, 237, 0.04)',
                border: '1px solid rgba(124, 58, 237, 0.12)',
                borderRadius: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} color="#7c3aed" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontWeight: 600 }}>Currently Active</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                    {location.city || 'Set Area'} {location.pincode ? `(${location.pincode})` : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  clearLocation();
                  setPincode('');
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                Reset
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handlePincodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                Enter Indian Pincode
              </label>
              
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="e.g. 700001"
                  value={pincode}
                  onChange={handlePincodeChange}
                  disabled={loading || success}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '16px',
                    border: `1.5px solid ${error ? '#EF4444' : success ? '#10B981' : 'var(--border)'}`,
                    fontSize: '16px',
                    fontWeight: 600,
                    letterSpacing: pincode ? '3px' : 'normal',
                    background: 'var(--bg-2)',
                    color: 'var(--text)',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
                  onBlur={(e) => (e.target.style.borderColor = error ? '#EF4444' : success ? '#10B981' : 'var(--border)')}
                />
                <MapPin
                  size={18}
                  color={error ? '#EF4444' : success ? '#10B981' : '#7c3aed'}
                  style={{ position: 'absolute', left: '16px', transition: 'color 0.2s' }}
                />

                {/* Instant validation/state indicator inside input */}
                <div style={{ position: 'absolute', right: '16px', display: 'flex', alignItems: 'center' }}>
                  {loading && <Loader2 size={16} className="animate-spin" color="#7c3aed" />}
                  {success && <CheckCircle2 size={18} color="#10B981" />}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  fontSize: '12px',
                  lineHeight: 1.4,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>Location loaded! Refreshing collection nearby...</span>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <button
                type="submit"
                disabled={pincode.length !== 6 || loading || success}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  border: 'none',
                  background: pincode.length === 6 && !loading && !success
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : 'var(--bg-2)',
                  color: pincode.length === 6 && !loading && !success ? '#fff' : 'var(--text-faint)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: pincode.length === 6 && !loading && !success ? 'pointer' : 'not-allowed',
                  boxShadow: pincode.length === 6 && !loading && !success ? '0 8px 24px rgba(124, 58, 237, 0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                Apply Pincode
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }} />
                <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }} />
              </div>

              <button
                type="button"
                onClick={handleGPSDetect}
                disabled={loading || success}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(124, 58, 237, 0.25)',
                  background: 'none',
                  color: '#7c3aed',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { if (!loading && !success) e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <Navigation size={14} />
                Detect My GPS Location
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Banner */}
        <div
          style={{
            background: 'var(--bg-2)',
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            color: 'var(--text-faint)',
            lineHeight: 1.4,
          }}
        >
          <HelpCircle size={14} style={{ flexShrink: 0 }} />
          <span>Entering a valid pincode allows us to calculate the exact distance between you and the boutique storefronts.</span>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            transform: translateY(16px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationSelectorModal;
