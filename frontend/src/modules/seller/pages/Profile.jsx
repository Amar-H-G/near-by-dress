import { useState, useEffect } from 'react';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { updateSellerProfile } from '../services/sellerApi';
import toast from 'react-hot-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import InputField from '../../../shared/components/form/InputField';
import TextArea from '../../../shared/components/form/TextArea';
import FileUpload from '../../../shared/components/form/FileUpload';

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

  const [logoFile, setLogoFile] = useState([]);
  const [logoPreview, setLogoPreview] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        shopName: profile.name || '',
        phone: profile.whatsappNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        description: profile.description || '',
      });
      if (profile.logo) setLogoPreview([profile.logo]);
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((err) => ({ ...err, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.shopName.trim()) errs.shopName = 'Shop name is required';
    if (!formData.phone.trim()) errs.phone = 'WhatsApp number is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsSubmitting(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submitData.append(key, value));
    if (logoFile[0]) submitData.append('logo', logoFile[0]);

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
    <div style={{ maxWidth: 800 }}>
      {!profile && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C',
          padding: '16px 20px', borderRadius: 14, marginBottom: 24,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>Complete your Shop Profile</h4>
            <p style={{ fontSize: 14 }}>You must complete your shop profile before adding products to the marketplace.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" noValidate>
        {/* Logo Section */}
        <div className="admin-section" style={{ padding: 28, borderBottom: '1px solid var(--border)' }}>
          <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Shop Logo</h3>
          <FileUpload
            id="seller-logo"
            label="Upload your shop logo"
            accept="image/*"
            multiple={false}
            maxFiles={1}
            files={logoFile}
            previews={logoPreview}
            onFilesChange={(f) => setLogoFile(f)}
            onRemove={(idx, isExisting) => {
              if (isExisting) setLogoPreview([]);
              else setLogoFile([]);
            }}
            helper="PNG or JPG, recommended 200×200px"
            compact
          />
        </div>

        {/* Details Section */}
        <div className="admin-section" style={{ padding: 28 }}>
          <h3 className="admin-section-title" style={{ marginBottom: 24 }}>Shop Details</h3>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <InputField
              id="seller-shop-name"
              label="Shop Name"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              placeholder="e.g. Priya Fashion House"
              required
              error={errors.shopName}
            />
            <InputField
              id="seller-phone"
              label="WhatsApp Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              error={errors.phone}
            />
          </div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <InputField
              id="seller-city"
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Mumbai"
              required
              error={errors.city}
            />
            <InputField
              id="seller-address"
              label="Full Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, area, landmark"
              required
              error={errors.address}
            />
          </div>

          <TextArea
            id="seller-description"
            label="Shop Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell customers about your shop, specialties, brands you carry…"
            rows={4}
            maxLength={500}
            helper="Optional — helps customers discover your shop"
          />

          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '13px 32px', minWidth: 160, borderRadius: 14 }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
