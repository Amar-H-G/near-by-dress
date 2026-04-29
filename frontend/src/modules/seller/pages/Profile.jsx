import { useState } from 'react';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { updateSellerProfile } from '../services/sellerApi';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle, CheckCircle, Edit3 } from 'lucide-react';
import ShopForm from '../components/ShopForm';

const Profile = () => {
  const { profile, loading, refresh } = useSellerProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = async (formData, logoFile) => {
    setIsSubmitting(true);
    const submitData = new FormData();
    
    // Fields to exclude from update payload
    const excludeFields = ['owner', '_id', '__v', 'createdAt', 'updatedAt', 'status', 'rejectionReason'];

    Object.entries(formData).forEach(([key, value]) => {
      if (!excludeFields.includes(key) && value !== undefined && value !== null) {
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
      setIsEditing(false);
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
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Shop Profile</h1>
          <p className="admin-page-subtitle">Manage your shop details, location and business hours.</p>
        </div>
        {!isEditing && profile && (
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12 }}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        )}
      </div>

      <div style={{ maxWidth: 800 }}>
        {/* Alerts... (already there) */}
        {!profile && (
          <div className="glass-strong" style={{
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#DC2626', padding: '20px', borderRadius: 20, marginBottom: 32,
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <AlertCircle size={24} style={{ flexShrink: 0, color: '#DC2626' }} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 4, color: '#991B1B' }}>Complete Your Shop Profile</h4>
              <p style={{ fontSize: 14, margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
                You haven't completed your shop profile yet. Please provide your business details to start listing products.
              </p>
            </div>
          </div>
        )}

        {profile && profile.status === 'pending' && (
          <div className="glass-strong" style={{
            background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', 
            color: '#D97706', padding: '20px', borderRadius: 20, marginBottom: 32,
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}>
            <Loader2 size={24} className="animate-spin" style={{ flexShrink: 0, color: '#D97706' }} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 4, color: '#92400E' }}>Shop Approval Pending</h4>
              <p style={{ fontSize: 14, margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
                Your shop profile is under review by the admin. You can add products but they will only be visible after approval.
              </p>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 2 }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Shop Information</h2>
          </div>
          <div style={{ height: 1, background: 'var(--border)', marginBottom: 32, opacity: 0.5 }} />
          
          <ShopForm 
            initialData={profile} 
            onSubmit={handleSaveProfile} 
            loading={isSubmitting} 
            readOnly={!isEditing}
            showCancel={true}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
