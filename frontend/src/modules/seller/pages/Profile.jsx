import { useState } from 'react';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { updateSellerProfile } from '../services/sellerApi';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import ShopForm from '../components/ShopForm';

const Profile = () => {
  const { profile, loading, refresh } = useSellerProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveProfile = async (formData, logoFile) => {
    setIsSubmitting(true);
    const submitData = new FormData();
    
    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        submitData.append(key, value);
      }
    });

    // Append logo if new file selected
    if (logoFile) {
      submitData.append('logo', logoFile);
    }

    try {
      await updateSellerProfile(submitData);
      toast.success('Shop profile updated successfully');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
      <Loader2 className="animate-spin" size={40} style={{ color: '#7c3aed' }} />
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Shop Profile</h1>
          <p className="admin-page-subtitle">Manage your shop details, location and business hours.</p>
        </div>
      </div>

      <div style={{ maxWidth: 800 }}>
        {!profile && (
          <div className="glass-strong" style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#F87171', padding: '20px', borderRadius: 20, marginBottom: 32,
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 4, color: '#fff' }}>Complete Your Shop Profile</h4>
              <p style={{ fontSize: 14, margin: 0, opacity: 0.8 }}>
                You haven't completed your shop profile yet. Please provide your business details to start listing products.
              </p>
            </div>
          </div>
        )}

        {profile && profile.status === 'pending' && (
          <div className="glass-strong" style={{
            background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', 
            color: '#FBBF24', padding: '20px', borderRadius: 20, marginBottom: 32,
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <Loader2 size={24} className="animate-spin" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 4, color: '#fff' }}>Shop Approval Pending</h4>
              <p style={{ fontSize: 14, margin: 0, opacity: 0.8 }}>
                Your shop profile is under review by the admin. You can add products but they will only be visible after approval.
              </p>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 32 }}>
          <ShopForm 
            initialData={profile} 
            onSubmit={handleSaveProfile} 
            loading={isSubmitting} 
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
