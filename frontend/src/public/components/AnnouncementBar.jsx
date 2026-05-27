/**
 * AnnouncementBar.jsx
 * Dynamic announcement bar — shown only when enabled in admin settings.
 * Supports configurable text, background color, and optional link.
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../../core/contexts/useSettings';

const AnnouncementBar = () => {
  const { settings } = useSettings();
  const bar = settings?.announcementBar;
  const [dismissed, setDismissed] = useState(false);

  if (!bar?.enabled || !bar?.text || dismissed) return null;

  const bgColor   = bar.color || '#7c3aed';
  const textColor = '#ffffff';

  const inner = (
    <span style={{ flex: 1, textAlign: 'center' }}>{bar.text}</span>
  );

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        fontSize: '13px',
        fontWeight: 500,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        position: 'relative',
        zIndex: 9999,
        lineHeight: 1.4,
      }}
      role="banner"
      aria-label="Site announcement"
    >
      {bar.link ? (
        <a
          href={bar.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'underline', flex: 1, textAlign: 'center' }}
        >
          {bar.text}
        </a>
      ) : inner}

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
