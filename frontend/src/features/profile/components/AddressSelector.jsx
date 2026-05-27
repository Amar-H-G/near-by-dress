import { MapPin, Plus, Check, Edit2 } from 'lucide-react';

const AddressSelector = ({ addresses = [], selectedAddressId, onSelect, onAddNew, onEditAddress }) => {
  return (
    <div className="premium-checkout-address-selector">
      <div className="selector-title-row">
        <span>Delivery Address</span>
        <button 
          type="button" 
          className="selector-add-new-btn"
          onClick={onAddNew}
        >
          <Plus size={12} />
          Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="selector-empty-alert" onClick={onAddNew}>
          <MapPin size={16} />
          <div>
            <strong>No addresses saved yet.</strong>
            <span>Tap to add your delivery address now.</span>
          </div>
        </div>
      ) : (
        <div className="selector-addresses-stack">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr._id;
            return (
              <div 
                key={addr._id}
                className={`selector-address-row-card ${isSelected ? 'active-selected' : ''}`}
                onClick={() => onSelect(addr._id)}
              >
                {/* Radio indicator */}
                <div className="radio-circle-indicator">
                  {isSelected && <div className="checked-dot" />}
                </div>

                <div className="row-card-content">
                  <div className="row-card-header">
                    <span className="row-card-label">{addr.label}</span>
                    <strong className="row-card-name">{addr.fullName}</strong>
                    <span className="row-card-phone">({addr.phone})</span>
                  </div>

                  <p className="row-card-details">
                    {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                    {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                  </p>
                </div>

                {/* Edit inline button */}
                <button
                  type="button"
                  className="row-card-edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAddress(addr);
                  }}
                  title="Quick Edit Address"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
