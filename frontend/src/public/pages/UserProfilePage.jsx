import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, Settings, Lock } from 'lucide-react';
import { useAuth } from '../../core/auth/useAuth';
import { fetchProfile, updateProfile as apiUpdateProfile, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../features/profile/services/profileService';

// Premium profile subcomponents
import ProfileHeader from '../../features/profile/components/ProfileHeader';
import EditProfileModal from '../../features/profile/components/EditProfileModal';
import AddressList from '../../features/profile/components/AddressList';
import AddressFormModal from '../../features/profile/components/AddressFormModal';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals visibility states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null); // address to edit

  // Load profile & address data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const prof = await fetchProfile();
        setProfile(prof);
        setAddresses(prof.addresses || []);
      } catch (err) {
        toast.error('Failed to load profile. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Update general profile details
  const handleUpdateProfile = async (payload) => {
    try {
      const updated = await apiUpdateProfile(payload);
      setProfile(updated);
      
      // Update global auth context
      if (user) {
        localStorage.setItem('nbd_user', JSON.stringify({ ...user, ...updated }));
      }
    } catch (err) {
      throw err; // propagates to modal error handler
    }
  };

  // Submit address (handles both Add and Edit)
  const handleAddressSubmit = async (payload) => {
    try {
      if (selectedAddress) {
        // Edit existing
        const updated = await updateAddress(selectedAddress._id, payload);
        setAddresses((prev) => 
          prev.map((addr) => (addr._id === selectedAddress._id ? updated : { ...addr, isDefault: payload.isDefault ? false : addr.isDefault }))
        );
      } else {
        // Add new
        const added = await addAddress(payload);
        setAddresses((prev) => {
          if (payload.isDefault) {
            return prev.map(a => ({ ...a, isDefault: false })).concat(added);
          }
          return prev.concat(added);
        });
      }
      
      // Refresh full profile data silently
      const freshProf = await fetchProfile();
      setProfile(freshProf);
    } catch (err) {
      throw err;
    }
  };

  // Delete address action
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const remaining = await deleteAddress(addressId);
      setAddresses(remaining);
      toast.success('Address deleted successfully');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  // Set default address action
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const updated = await setDefaultAddress(addressId);
      setAddresses(updated);
      toast.success('Default address updated');
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  if (loading) {
    return (
      <div className="marketplace-page flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="marketplace-page luxury-shell profile-page">
      <div className="container" style={{ maxWidth: '960px', padding: '40px 16px' }}>
        
        {/* Profile Header Block */}
        {profile && (
          <ProfileHeader 
            profile={profile} 
            onEditClick={() => setIsEditProfileOpen(true)}
          />
        )}

        {/* Addresses Management Block */}
        <AddressList 
          addresses={addresses}
          onAddClick={() => {
            setSelectedAddress(null);
            setIsAddressModalOpen(true);
          }}
          onEditClick={(addr) => {
            setSelectedAddress(addr);
            setIsAddressModalOpen(true);
          }}
          onDelete={handleDeleteAddress}
          onSetDefault={handleSetDefaultAddress}
        />

        {/* Additional security note */}
        <div className="profile-security-notice" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '32px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: '16px' }}>
          <ShieldCheck size={20} style={{ color: '#10b981' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--text)' }}>Protected Security Controls</strong>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Only authenticated users can coordinate multi-address pipelines and preferences.</span>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal 
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          profile={profile}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* Add / Edit Address Form Modal */}
      <AddressFormModal 
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setSelectedAddress(null);
        }}
        onSubmit={handleAddressSubmit}
        editAddress={selectedAddress}
      />

    </div>
  );
};

export default UserProfilePage;
