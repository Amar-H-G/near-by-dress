import { useState, useRef, useEffect } from 'react';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { updateSellerProfile } from '../services/sellerApi';
import toast from 'react-hot-toast';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { profile, loading, refresh } = useSellerProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    address: '',
    city: '',
    description: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        shopName: profile.name || '',
        phone: profile.whatsappNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        description: profile.description || '',
      });
      setLogoPreview(profile.logo);
    }
  }, [profile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
    if (logoFile) submitData.append('logo', logoFile);

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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div style={{ maxWidth: 800 }}>
      {!profile && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: 16, borderRadius: 12, marginBottom: 24, display: 'flex', gap: 12 }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 4 }}>Complete your Shop Profile</h4>
            <p style={{ fontSize: 14 }}>You must complete your shop profile before you can add products to the marketplace.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="admin-section" style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
          <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Shop Logo</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--surface-2)' }}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>No Logo</div>
              )}
            </div>
            <div>
              <button type="button" className="btn btn-ghost" onClick={() => logoInputRef.current?.click()} style={{ padding: '8px 16px', fontSize: 14 }}>
                <UploadCloud size={16} /> Upload New Logo
              </button>
              <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" style={{ display: 'none' }} />
            </div>
          </div>
        </div>

        <div className="admin-section" style={{ padding: 24 }}>
          <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Shop Details</h3>
          
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Shop Name *</label>
              <input required type="text" name="shopName" value={formData.shopName} onChange={handleChange} className="admin-input" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">WhatsApp Number *</label>
              <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="admin-input" />
            </div>
          </div>

          <div className="admin-form-row" style={{ marginTop: 16 }}>
            <div className="admin-form-group">
              <label className="admin-form-label">City *</label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} className="admin-input" />
            </div>
            <div className="admin-form-group" style={{ flex: 2 }}>
              <label className="admin-form-label">Full Address *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="admin-input" />
            </div>
          </div>

          <div className="admin-form-group" style={{ marginTop: 16 }}>
            <label className="admin-form-label">Shop Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="admin-input" rows="4"></textarea>
          </div>
          
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '12px 24px', minWidth: 160 }}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
