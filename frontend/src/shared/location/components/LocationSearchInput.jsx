[ignoring loop detection]
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { forwardGeocode } from '../services/locationService';

const LocationSearchInput = ({ onSelect, placeholder = 'Search street address, city, or pincode...' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch forward geocoding from backend
      const result = await forwardGeocode(val);
      if (result) {
        // Renders result as a list item
        setSuggestions([result]);
        setOpen(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.formattedAddress || '');
    setSuggestions([]);
    setOpen(false);
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="form-input"
          style={{
            width: '100%',
            padding: '12px 40px 12px 40px',
            borderRadius: '12px',
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '14px',
            fontWeight: 600,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
        />
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
        
        <div style={{ position: 'absolute', right: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading && <Loader2 size={16} className="animate-spin" color="var(--primary)" />}
          {query && !loading && (
            <button
              type="button"
              onClick={clearInput}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex' }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          marginTop: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          maxHeight: '260px',
          overflowY: 'auto'
        }}>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border)',
                transition: 'background 0.2s',
                color: 'var(--text)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>
                  {item.formattedAddress || 'Located Coordinate Pin'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {item.city ? `${item.city}, ` : ''}{item.state || ''} {item.pincode ? `(${item.pincode})` : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
