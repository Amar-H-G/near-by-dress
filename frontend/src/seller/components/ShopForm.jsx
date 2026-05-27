import { useState, useEffect } from 'react';
import InputField from '../../shared/components/form/InputField';
import FileUpload from '../../shared/components/form/FileUpload';
import { Store, MapPin, Clock, Info, Hash, Phone } from 'lucide-react';
import {
  AddressAutocomplete,
  CurrentLocationButton,
  GeoMapPicker,
  LocationPreviewCard
} from '../../shared/location';
import { reverseGeocode } from '../../shared/location/services/locationService';

const ShopForm = ({ initialData = {}, onSubmit, loading, showCancel = false, onCancel, readOnly = false }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    shopNo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    logo: '',
    openingTime: '',
    closingTime: '',
    whatsappNumber: '',
    ...initialData
  });

  const [logoFile, setLogoFile] = useState([]);
  const [logoPreview, setLogoPreview] = useState(initialData?.logo ? [initialData.logo] : []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      queueMicrotask(() => {
        setForm(prev => ({ ...prev, ...initialData }));
        if (initialData.logo) setLogoPreview([initialData.logo]);
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'whatsappNumber') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setForm(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, logoFile[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="shop-form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InputField
            label="Shop Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Elegant Threads"
            required
            icon={<Store size={16} />}
            readOnly={readOnly}
            disabled={readOnly}
          />
          <InputField
            label="Shop Number / Unit"
            name="shopNo"
            value={form.shopNo}
            onChange={handleChange}
            placeholder="e.g. G-12 or Suite 4"
            icon={<Hash size={16} />}
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div className="form-field">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={16} /> Shop Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            readOnly={readOnly}
            disabled={readOnly}
            className={`form-input ${readOnly ? 'form-input-disabled' : ''}`}
            style={{ minHeight: '100px', resize: readOnly ? 'none' : 'vertical', padding: '12px' }}
            placeholder="Describe your shop and what you sell..."
          ></textarea>
        </div>

        {/* Geocoding & Map Selection */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--surface-2)',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="var(--primary)" /> Storefront Location Intelligence
          </h3>

          {!readOnly && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'flex-end' }}>
              <AddressAutocomplete
                onAddressSelected={(geo) => {
                  setForm(prev => ({
                    ...prev,
                    address: geo.road || geo.formattedAddress?.split(',')[0] || prev.address || '',
                    city: geo.city || prev.city || '',
                    state: geo.state || prev.state || '',
                    pincode: geo.pincode || prev.pincode || '',
                    location: {
                      type: 'Point',
                      coordinates: [Number(geo.lng), Number(geo.lat)]
                    }
                  }));
                }}
                placeholder="Search street, area, city, pincode..."
              />
              <div style={{ marginBottom: 20 }}>
                <CurrentLocationButton
                  onLocationFetched={(geo) => {
                    setForm(prev => ({
                      ...prev,
                      address: geo.road || geo.formattedAddress?.split(',')[0] || prev.address || '',
                      city: geo.city || prev.city || '',
                      state: geo.state || prev.state || '',
                      pincode: geo.pincode || prev.pincode || '',
                      location: {
                        type: 'Point',
                        coordinates: [Number(geo.lng), Number(geo.lat)]
                      }
                    }));
                  }}
                />
              </div>
            </div>
          )}

          {/* Draggable Map */}
          <GeoMapPicker
            center={form.location?.coordinates ? { lat: form.location.coordinates[1], lng: form.location.coordinates[0] } : undefined}
            markerPos={form.location?.coordinates ? { lat: form.location.coordinates[1], lng: form.location.coordinates[0] } : null}
            onChange={async (lat, lng) => {
              if (readOnly) return;
              try {
                const geo = await reverseGeocode(lat, lng);
                setForm(prev => ({
                  ...prev,
                  address: geo?.road || geo?.formattedAddress?.split(',')[0] || prev.address || '',
                  city: geo?.city || prev.city || '',
                  state: geo?.state || prev.state || '',
                  pincode: geo?.pincode || prev.pincode || '',
                  location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                  }
                }));
              } catch (_) {
                setForm(prev => ({
                  ...prev,
                  location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                  }
                }));
              }
            }}
            readOnly={readOnly}
            height="300px"
          />

          {/* Selected coordinates details snapshot preview */}
          <LocationPreviewCard
            lat={form.location?.coordinates?.[1]}
            lng={form.location?.coordinates?.[0]}
            address={form.address}
            city={form.city}
            state={form.state}
            pincode={form.pincode}
          />
        </div>

        {/* Location Form Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <InputField
            label="Street Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full street address"
            required
            icon={<MapPin size={16} />}
            readOnly={readOnly}
            disabled={readOnly}
          />
          <InputField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="e.g. Kolkata"
            required
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InputField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="e.g. West Bengal"
            required
            readOnly={readOnly}
            disabled={readOnly}
          />
          <InputField
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="6-digit PIN"
            required
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>

        {/* Extra Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <InputField
            label="WhatsApp Number"
            name="whatsappNumber"
            value={form.whatsappNumber || ''}
            onChange={handleChange}
            placeholder="10-digit number"
            required
            icon={<Phone size={16} />}
            readOnly={readOnly}
            disabled={readOnly}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <InputField
              label="Opening Time"
              name="openingTime"
              type="time"
              value={form.openingTime}
              onChange={handleChange}
              icon={<Clock size={16} />}
              readOnly={readOnly}
              disabled={readOnly}
            />
            <InputField
              label="Closing Time"
              name="closingTime"
              type="time"
              value={form.closingTime}
              onChange={handleChange}
              icon={<Clock size={16} />}
              readOnly={readOnly}
              disabled={readOnly}
            />
          </div>
        </div>

        <FileUpload
          id="shop-logo-upload"
          label="Shop Logo"
          files={logoFile}
          previews={logoPreview}
          onFilesChange={(f) => setLogoFile(f)}
          onRemove={(idx, isExisting) => {
            if (isExisting) setLogoPreview([]);
            else setLogoFile([]);
          }}
          maxFiles={1}
          helper="Recommended: Square image, max 2MB"
          readOnly={readOnly}
          disabled={readOnly}
        />

        {!readOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
            {showCancel && (
              <button type="button" onClick={onCancel} className="btn btn-ghost" disabled={loading}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .shop-form {
          width: 100%;
        }
        .form-input-disabled {
          background-color: var(--surface-2) !important;
          cursor: not-allowed !important;
          border-color: transparent !important;
          color: var(--text-muted) !important;
        }
      `}</style>
    </form>
  );
};

export default ShopForm;
