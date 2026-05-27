import LocationSearchInput from './LocationSearchInput';

const AddressAutocomplete = ({ onAddressSelected, placeholder }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
        Quick Address Autocomplete Search
      </label>
      <LocationSearchInput onSelect={onAddressSelected} placeholder={placeholder} />
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.7 }}>
        Start typing place, street, pincode or city names to quickly search and snap position.
      </span>
    </div>
  );
};

export default AddressAutocomplete;
