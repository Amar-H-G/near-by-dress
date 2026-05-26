/**
 * LocationPermissionBanner.jsx
 * Contextual banner shown to customers when we need location access.
 * Non-intrusive — sits at the top of a section, not a blocking modal.
 *
 * Props:
 *   status      'idle' | 'requesting' | 'denied' | 'error' | 'resolved'
 *   onDetect    () => void    — trigger detection
 *   onDismiss   () => void    — hide banner
 *   compact     boolean       — smaller variant for navbars
 */

import { MapPin, Loader2, AlertCircle, CheckCircle2, X, Compass } from 'lucide-react';

const LocationPermissionBanner = ({ status, onDetect, onDismiss, compact = false }) => {
  if (status === 'resolved') return null; // Don't show if already resolved

  const config = {
    idle: {
      icon: <Compass size={compact ? 16 : 22} className="animate-spin" style={{ animationDuration: '6s', color: '#7c3aed' }} />,
      bg: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%)',
      border: 'rgba(124, 58, 237, 0.16)',
      color: '#6d28d9',
      title: 'Discover Local Fashion',
      message: 'Allow location access to discover exquisite clothing and verified boutiques in your radius.',
      action: 'Enable GPS Proximity',
      showAction: true,
    },
    requesting: {
      icon: <Loader2 size={compact ? 16 : 22} className="animate-spin" color="#3b82f6" />,
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)',
      border: 'rgba(59, 130, 246, 0.16)',
      color: '#1d4ed8',
      title: 'Pinpointing GPS Location…',
      message: 'Fetching latitude, longitude, and pincode parameters. Please confirm prompt.',
      action: null,
      showAction: false,
    },
    denied: {
      icon: <AlertCircle size={compact ? 16 : 22} color="#ef4444" />,
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
      border: 'rgba(239, 68, 68, 0.16)',
      color: '#b91c1c',
      title: 'GPS Access Interrupted',
      message: 'Permission was blocked. Enable location services in settings to discover boutiques closest to you.',
      action: null,
      showAction: false,
    },
    error: {
      icon: <AlertCircle size={compact ? 16 : 22} color="#f59e0b" />,
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%)',
      border: 'rgba(245, 158, 11, 0.16)',
      color: '#b45309',
      title: 'Geospatial Signal Quiet',
      message: 'We were unable to resolve your coordinates. Don\'t worry, you can try again or set your pincode manually.',
      action: 'Re-attempt Detection',
      showAction: true,
    },
  };

  const c = config[status] || config.idle;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: compact ? '10px 16px' : '16px 24px',
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: compact ? '14px' : '20px',
        color: 'var(--text)',
        fontSize: compact ? '12px' : '14px',
        position: 'relative',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
        animation: 'glowingBannerIn 0.4s ease forwards',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <div style={{
          width: compact ? '32px' : '44px',
          height: compact ? '32px' : '44px',
          borderRadius: '50%',
          background: 'var(--surface)',
          border: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
        }}>
          {c.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          {!compact && (
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text)', marginBottom: '3px' }}>
              {c.title}
            </div>
          )}
          <div style={{ color: 'var(--text-muted)', fontSize: compact ? '12px' : '13px', lineHeight: 1.4 }}>
            {compact ? c.title : c.message}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {c.showAction && onDetect && (
          <button
            onClick={onDetect}
            style={{
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: compact ? '6px 12px' : '10px 18px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(124, 58, 237, 0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.25)'; }}
          >
            {c.action}
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              background: 'var(--bg-2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      <style>{`
        @keyframes glowingBannerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LocationPermissionBanner;
