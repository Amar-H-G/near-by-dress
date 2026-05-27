import { Home, Briefcase, MapPin, Edit3, Trash2, ShieldCheck, Phone } from 'lucide-react';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => {
  const { _id, label, fullName, phone, addressLine1, addressLine2, landmark, city, state, pincode, isDefault } = address;

  const getLabelIcon = (lbl) => {
    switch (lbl) {
      case 'Home': return <Home size={12} />;
      case 'Office': return <Briefcase size={12} />;
      default: return <MapPin size={12} />;
    }
  };

  return (
    <div className={`premium-address-card ${isDefault ? 'default-active' : ''}`}>
      {/* Label badging */}
      <div className="address-badge-header">
        <span className={`address-label-badge label-${label?.toLowerCase()}`}>
          {getLabelIcon(label)}
          {label}
        </span>
        {isDefault ? (
          <span className="default-address-pill">
            <ShieldCheck size={11} />
            Default
          </span>
        ) : (
          <button 
            type="button" 
            className="set-default-trigger"
            onClick={() => onSetDefault(_id)}
          >
            Set Default
          </button>
        )}
      </div>

      {/* Recipient Details */}
      <div className="address-recipient-info">
        <strong>{fullName}</strong>
        <span className="address-phone-row">
          <Phone size={11} />
          {phone}
        </span>
      </div>

      {/* Full Address details */}
      <p className="address-lines-text">
        {addressLine1}
        {addressLine2 && `, ${addressLine2}`}
        {landmark && (
          <span className="address-landmark-block">
            <strong>Landmark:</strong> {landmark}
          </span>
        )}
        <span className="address-locality-block">
          {city}, {state} — <strong>{pincode}</strong>
        </span>
      </p>

      {/* Actions toolbar */}
      <div className="address-actions-bar">
        <button 
          type="button" 
          className="address-action-btn edit-btn"
          onClick={() => onEdit(address)}
        >
          <Edit3 size={13} />
          Edit
        </button>
        
        <button 
          type="button" 
          className="address-action-btn delete-btn"
          disabled={isDefault}
          title={isDefault ? "Cannot delete default address" : "Delete address"}
          onClick={() => onDelete(_id)}
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
