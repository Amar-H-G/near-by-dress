import { MapPin, Plus } from 'lucide-react';
import AddressCard from './AddressCard';

const AddressList = ({ addresses = [], onAddClick, onEditClick, onDelete, onSetDefault }) => {
  return (
    <div className="premium-address-list-section">
      <div className="section-title-header">
        <div>
          <h3>Saved Delivery Addresses</h3>
          <p>Manage your multiple shipping coordinates and default options</p>
        </div>
        <button 
          type="button" 
          className="add-address-trigger"
          onClick={onAddClick}
        >
          <Plus size={15} />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="address-empty-state">
          <div className="empty-icon-circle">
            <MapPin size={24} />
          </div>
          <h4>No Saved Addresses</h4>
          <p>Please add a delivery address to ensure lightning-fast WhatsApp ordering and standard fulfillment.</p>
          <button 
            type="button" 
            className="empty-cta-btn"
            onClick={onAddClick}
          >
            <Plus size={14} />
            Add First Address
          </button>
        </div>
      ) : (
        <div className="address-cards-grid">
          {addresses.map((address) => (
            <AddressCard 
              key={address._id}
              address={address}
              onEdit={onEditClick}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
