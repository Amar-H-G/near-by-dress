/**
 * LocationPopup.jsx
 * Premium, non-intrusive location permission UI.
 * Slides in from bottom-right after page load.
 * 
 * States:
 *   idle     → "Allow location" CTA + manual entry link
 *   requesting → spinner
 *   denied   → manual pincode form
 *   error    → retry + manual entry
 *   resolved → success flash then hides
 */

import { useState, useEffect } from 'react';
import {
  MapPin, Navigation, X, ChevronRight,
  Loader2, CheckCircle2, AlertCircle, Keyboard
} from 'lucide-react';
import { useLocation } from '../../core/contexts/useLocation';

// ── Manual form sub-component ──────────────────────────────────────────────────
const ManualForm = ({ onSubmit, onBack }) => {
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pincode.trim() && !city.trim()) {
      setError('Enter at least a pincode or city name');
      return;
    }
    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      setError('Pincode must be 6 digits');
      return;
    }
    setError('');
    onSubmit(pincode.trim(), city.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
        Enter your location manually
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit pincode"
          value={pincode}
          onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setError(''); }}
          style={{
            padding: '10px 14px', borderRadius: 10,
            border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
            fontSize: 14, background: 'var(--bg-2)',
            color: 'var(--text)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
          onBlur={(e) => (e.target.style.borderColor = error ? '#EF4444' : 'var(--border)')}
        />
        <input
          type="text"
          placeholder="Or enter city name"
          value={city}
          onChange={(e) => { setCity(e.target.value); setError(''); }}
          style={{
            padding: '10px 14px', borderRadius: 10,
            border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
            fontSize: 14, background: 'var(--bg-2)',
            color: 'var(--text)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
          onBlur={(e) => (e.target.style.borderColor = error ? '#EF4444' : 'var(--border)')}
        />
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1, padding: '10px', borderRadius: 10,
              background: 'var(--bg-2)', border: '1.5px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}
        <button
          type="submit"
          style={{
            flex: 2, padding: '10px', borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff', fontSize: 13, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
          }}
        >
          Find Shops Near Me
        </button>
      </div>
    </form>
  );
};

// ── Main Popup ─────────────────────────────────────────────────────────────────
const LocationPopup = () => {
  const { location, detect, setManual, dismissPopup, showPopup } = useLocation();
  const [showManual, setShowManual] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in when showPopup becomes true
  useEffect(() => {
    if (showPopup) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [showPopup]);

  // Auto-hide after success
  useEffect(() => {
    if (location.status === 'resolved') {
      const t = setTimeout(dismissPopup, 2200);
      return () => clearTimeout(t);
    }
  }, [location.status, dismissPopup]);

  // Show manual form automatically when denied
  useEffect(() => {
    if (location.status === 'denied') setShowManual(true);
  }, [location.status]);

  if (!showPopup) return null;

  const isRequesting = location.status === 'requesting';
  const isResolved = location.status === 'resolved';

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(dismissPopup, 300);
  };

  return (
    <>
      {/* Backdrop — subtle, not blocking */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 8000,
          background: 'rgba(0,0,0,0.12)',
          backdropFilter: 'blur(2px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />

      {/* Popup card */}
      <div
        role="dialog"
        aria-label="Location permission"
        aria-modal="true"
        style={{
          position: 'fixed',
          bottom: 24, right: 24,
          zIndex: 8001,
          width: 340,
          maxWidth: 'calc(100vw - 32px)',
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(124,58,237,0.06)',
          overflow: 'hidden',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease',
        }}
      >
        {/* Purple accent strip */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)',
        }} />

        <div style={{ padding: '20px 20px 24px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Animated icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: isResolved
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.3s',
              }}>
                {isResolved
                  ? <CheckCircle2 size={22} color="#10B981" />
                  : isRequesting
                    ? <Loader2 size={22} color="#7c3aed" className="animate-spin" />
                    : <MapPin size={22} color="#7c3aed" />
                }
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                  {isResolved
                    ? (location.city ? `Found: ${location.city}` : 'Location set!')
                    : isRequesting
                      ? 'Detecting location…'
                      : 'Find shops near you'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {isResolved
                    ? (location.pincode ? `Pincode ${location.pincode}` : 'Showing nearby shops')
                    : isRequesting
                      ? 'Please allow location access'
                      : 'Discover fashion boutiques in your area'}
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Close"
              style={{
                background: 'var(--bg-2)', border: 'none', borderRadius: 8,
                width: 28, height: 28, cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Content area */}
          {isResolved ? (
            // Success state
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              fontSize: 13, color: '#065f46',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle2 size={15} color="#10B981" />
              {location.formattedAddress
                ? location.formattedAddress.split(',').slice(0, 3).join(', ')
                : `${location.city || ''}${location.state ? ', ' + location.state : ''}`
              }
            </div>

          ) : isRequesting ? (
            // Loading state
            <div style={{
              padding: '14px', borderRadius: 12,
              background: 'rgba(124, 58, 237, 0.04)',
              border: '1px solid rgba(124, 58, 237, 0.1)',
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13, color: '#6d28d9',
            }}>
              <Loader2 size={16} className="animate-spin" />
              Fetching your coordinates and address…
            </div>

          ) : showManual ? (
            // Manual fallback form
            <ManualForm
              onSubmit={setManual}
              onBack={location.status !== 'denied' ? () => setShowManual(false) : null}
            />

          ) : (
            // Default idle/error state — two CTAs
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {location.error && (
                <div style={{
                  padding: '10px 12px', borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  fontSize: 12, color: '#991b1b',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <AlertCircle size={13} />
                  {location.error}
                </div>
              )}

              {/* Primary CTA */}
              <button
                onClick={detect}
                disabled={isRequesting}
                style={{
                  width: '100%', padding: '12px 16px',
                  borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.45)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.35)')}
              >
                <Navigation size={16} />
                Allow Location Access
                <ChevronRight size={16} />
              </button>

              {/* Secondary — manual entry */}
              <button
                onClick={() => setShowManual(true)}
                style={{
                  width: '100%', padding: '10px 16px',
                  borderRadius: 12, cursor: 'pointer',
                  background: 'var(--bg-2)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Keyboard size={14} />
                Enter pincode manually
              </button>

              {/* Privacy note */}
              <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                🔒 Location is only used to show nearby shops and is never stored on our servers.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LocationPopup;
