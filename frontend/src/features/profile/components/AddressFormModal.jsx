import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Building, Flag, Check, Loader2, Compass, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AddressFormModal = ({ isOpen, onClose, onSubmit, editAddress }) => {
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  // Geolocation coordinates
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Address Search Autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (editAddress) {
      setLabel(editAddress.label || 'Home');
      setFullName(editAddress.fullName || '');
      setPhone(editAddress.phone || '');
      setAddressLine1(editAddress.addressLine1 || '');
      setAddressLine2(editAddress.addressLine2 || '');
      setLandmark(editAddress.landmark || '');
      setCity(editAddress.city || '');
      setState(editAddress.state || '');
      setPincode(editAddress.pincode || '');
      setIsDefault(editAddress.isDefault || false);
      setLat(editAddress.lat || null);
      setLng(editAddress.lng || null);
      setSearchQuery('');
    } else {
      setLabel('Home');
      setFullName('');
      setPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setLandmark('');
      setCity('');
      setState('');
      setPincode('');
      setIsDefault(false);
      setLat(null);
      setLng(null);
      setSearchQuery('');
    }
    setSuggestions([]);
    setShowSuggestions(false);
  }, [editAddress, isOpen]);

  // Premium pincode auto-fill effect
  useEffect(() => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      // Basic Indian state/city lookup based on pincode zone prefix (as premium fallback)
      const prefix = pincode.substring(0, 2);
      if (prefix === '70' || prefix === '71' || prefix === '72' || prefix === '73' || prefix === '74') {
        if (!city) setCity('Kolkata');
        if (!state) setState('West Bengal');
      } else if (prefix === '11') {
        if (!city) setCity('New Delhi');
        if (!state) setState('Delhi');
      } else if (prefix === '40') {
        if (!city) setCity('Mumbai');
        if (!state) setState('Maharashtra');
      } else if (prefix === '56') {
        if (!city) setCity('Bengaluru');
        if (!state) setState('Karnataka');
      }
    }
  }, [pincode]);

  // Debounced search for Nominatim Autocomplete Suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`
        );
        const data = await response.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching address suggestions', err);
      } finally {
        setSearching(false);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Select a suggestion & autopopulate form
  const handleSelectSuggestion = (suggestion) => {
    const coordsLat = parseFloat(suggestion.lat);
    const coordsLng = parseFloat(suggestion.lon);
    setLat(coordsLat);
    setLng(coordsLng);

    const addr = suggestion.address;
    
    // Auto populate
    const mappedCity = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || '';
    const mappedState = addr.state || '';
    const mappedPincode = addr.postcode || '';
    const roadName = addr.road || addr.neighbourhood || addr.suburb || '';

    if (mappedCity) setCity(mappedCity);
    if (mappedState) setState(mappedState);
    if (mappedPincode) setPincode(mappedPincode.replace(/\D/g, '').substring(0, 6));
    
    // Address lines
    if (roadName) {
      setAddressLine1(roadName);
      setAddressLine2(addr.suburb || addr.neighbourhood || suggestion.display_name.split(',')[1]?.trim() || '');
    } else {
      setAddressLine1(suggestion.display_name.split(',')[0]?.trim() || '');
      setAddressLine2(suggestion.display_name.split(',')[1]?.trim() || '');
    }

    setShowSuggestions(false);
    setSearchQuery('');
    toast.success('Address auto-populated with precise GPS coordinates!');
  };

  // Geolocation trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }

    setDetecting(true);
    toast.loading('Fetching precise GPS coordinates...', { id: 'gps-loading' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          // Reverse-geocoding via OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            
            // Map values
            const mappedCity = addr.city || addr.town || addr.village || addr.suburb || '';
            const mappedState = addr.state || '';
            const mappedPincode = addr.postcode || '';
            const roadName = addr.road || addr.neighbourhood || addr.suburb || '';

            if (mappedCity) setCity(mappedCity);
            if (mappedState) setState(mappedState);
            if (mappedPincode) setPincode(mappedPincode.replace(/\D/g, '').substring(0, 6));
            if (roadName) {
              setAddressLine1(roadName);
              if (addr.suburb || addr.neighbourhood) {
                setAddressLine2(addr.suburb || addr.neighbourhood);
              }
            }

            toast.success('Precise coordinates linked & address populated!', { id: 'gps-loading' });
          } else {
            toast.success(`Coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { id: 'gps-loading' });
          }
        } catch (err) {
          toast.success(`Coordinates captured: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, { id: 'gps-loading' });
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        toast.error('GPS permission denied or timeout. Please enter address manually.', { id: 'gps-loading' });
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!fullName.trim()) return toast.error('Full Name is required');
    if (!/^[0-9]{10}$/.test(phone)) return toast.error('Phone number must be exactly 10 digits');
    if (!addressLine1.trim()) return toast.error('House/Building address details are required');
    if (!city.trim()) return toast.error('City is required');
    if (!state.trim()) return toast.error('State is required');
    if (!/^[0-9]{6}$/.test(pincode)) return toast.error('Pincode must be exactly 6 digits');

    setSaving(true);
    try {
      const payload = {
        label,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pincode,
        isDefault,
        lat,
        lng
      };
      
      await onSubmit(payload);
      toast.success(editAddress ? 'Address updated' : 'Address added successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="premium-modal-backdrop">
      <div className="premium-modal-card address-form-card">
        {/* Header */}
        <div className="modal-header-row">
          <div>
            <h3>{editAddress ? 'Edit Saved Address' : 'Add New Delivery Address'}</h3>
            <p>Define shipping coordinates and contact points</p>
          </div>
          <button type="button" className="close-modal-trigger" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form-body">
          {/* Label selector */}
          <div className="input-field-group">
            <label>Address Label</label>
            <div className="address-label-chips">
              {['Home', 'Office', 'Hostel', 'Shop', 'Other'].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  className={`label-chip-btn ${label === lbl ? 'active' : ''}`}
                  onClick={() => setLabel(lbl)}
                >
                  {label === lbl && <Check size={11} />}
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Autocomplete Address Search Bar */}
          <div className="input-field-group autocomplete-search-group" style={{ position: 'relative' }}>
            <label htmlFor="addr-search-input">Search / Autocomplete Delivery Address</label>
            <div className="input-wrapper">
              <Search size={15} className="input-icon" />
              <input
                id="addr-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Start typing your locality, street or city..."
              />
              {searching && (
                <div style={{ position: 'absolute', right: '14px', top: '14px' }}>
                  <Loader2 size={14} className="animate-spin text-purple-600" />
                </div>
              )}
            </div>

            {/* Suggestions Panel */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="autocomplete-suggestions-dropdown">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="suggestion-item-row"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <MapPin size={13} className="suggestion-icon" />
                    <div className="suggestion-text-block">
                      <strong>{suggestion.display_name.split(',')[0]}</strong>
                      <span>{suggestion.display_name.split(',').slice(1).join(',')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Luxury Geolocation Trigger Bar */}
          <div className="geolocation-action-bar">
            <button
              type="button"
              className="gps-detect-btn"
              disabled={detecting}
              onClick={handleDetectLocation}
            >
              {detecting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Locating via satellites...
                </>
              ) : (
                <>
                  <Compass size={14} />
                  Detect My Location / GPS Auto-Fill
                </>
              )}
            </button>

            {lat && lng && (
              <span className="gps-coordinate-badge">
                <CheckCircle size={11} />
                GPS Linked ({lat.toFixed(4)}, {lng.toFixed(4)})
              </span>
            )}
          </div>

          <div className="form-double-row">
            <div className="input-field-group">
              <label htmlFor="addr-fullName">Recipient Name</label>
              <div className="input-wrapper">
                <User size={15} className="input-icon" />
                <input
                  id="addr-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="E.g. John Doe"
                />
              </div>
            </div>

            <div className="input-field-group">
              <label htmlFor="addr-phone">Contact Number</label>
              <div className="input-wrapper">
                <Phone size={15} className="input-icon" />
                <input
                  id="addr-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="10-digit mobile"
                />
              </div>
            </div>
          </div>

          <div className="input-field-group">
            <label htmlFor="addr-line1">House / Flat No., Building, Street</label>
            <div className="input-wrapper">
              <Building size={15} className="input-icon" />
              <input
                id="addr-line1"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                placeholder="E.g. Flat 302, Silver Oak Towers"
              />
            </div>
          </div>

          <div className="form-double-row">
            <div className="input-field-group">
              <label htmlFor="addr-line2">Area / Locality / Street</label>
              <div className="input-wrapper">
                <MapPin size={15} className="input-icon" />
                <input
                  id="addr-line2"
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="E.g. Sector 5, Salt Lake"
                />
              </div>
            </div>

            <div className="input-field-group">
              <label htmlFor="addr-landmark">Landmark (Optional)</label>
              <div className="input-wrapper">
                <Flag size={15} className="input-icon" />
                <input
                  id="addr-landmark"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="E.g. Opposite City Mall"
                />
              </div>
            </div>
          </div>

          <div className="form-triple-row">
            <div className="input-field-group">
              <label htmlFor="addr-pincode">Pincode</label>
              <input
                id="addr-pincode"
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="6-digits"
              />
            </div>

            <div className="input-field-group">
              <label htmlFor="addr-city">City</label>
              <input
                id="addr-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="City"
              />
            </div>

            <div className="input-field-group">
              <label htmlFor="addr-state">State</label>
              <input
                id="addr-state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                placeholder="State"
              />
            </div>
          </div>

          {/* Set Default checkbox */}
          <div className="modal-checkbox-row">
            <input
              id="addr-isDefault"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              disabled={editAddress?.isDefault} // Cannot unset default flag from here, must mark another default
            />
            <label htmlFor="addr-isDefault">Make this my default shipping address</label>
          </div>

          {/* Action Footer */}
          <div className="modal-actions-footer">
            <button type="button" className="action-btn cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="action-btn save-btn" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;
