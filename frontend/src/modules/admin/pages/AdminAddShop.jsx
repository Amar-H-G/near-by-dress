import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, User, Mail, Phone, Lock, MapPin, Hash, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { adminCreateShop } from '../services/admin.service';
import toast from 'react-hot-toast';
import InputField from '../../../shared/components/form/InputField';
import FileUpload from '../../../shared/components/form/FileUpload';

const AdminAddShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    shopNo: '',
    description: '',
    logo: '',
    openingTime: '',
    closingTime: ''
  });

  const [logoFile, setLogoFile] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) submitData.append(key, value);
    });

    if (logoFile[0]) {
      submitData.append('logo', logoFile[0]);
    }

    try {
      await adminCreateShop(submitData);
      toast.success('Shop and seller account created successfully!');
      navigate('/admin/shops');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button 
            className="btn btn-icon" 
            onClick={() => navigate('/admin/shops')}
            style={{ background: 'var(--surface-2)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="admin-page-title">Register New Shop</h1>
            <p className="admin-page-subtitle">Create a vendor account and shop directly from the admin panel.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-container">
        <div className="admin-grid-2">
          {/* Shop Information */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ padding: 8, background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', borderRadius: 8 }}>
                <Store size={20} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Shop Information</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="admin-grid-2">
                <InputField
                  label="Shop Name"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="Business name"
                  required
                />
                <InputField
                  label="Shop No / Suite"
                  name="shopNo"
                  value={formData.shopNo}
                  onChange={handleChange}
                  placeholder="e.g. Ground Floor, 102"
                  required
                />
              </div>

              <div className="form-field">
                <label className="form-label">Shop Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Tell us about the shop..."
                ></textarea>
              </div>

              <div className="admin-grid-2">
                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
                <InputField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>

              <div className="admin-grid-2">
                <InputField
                  label="Opening Time"
                  name="openingTime"
                  type="time"
                  value={formData.openingTime}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Closing Time"
                  name="closingTime"
                  type="time"
                  value={formData.closingTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-grid-2">
                <InputField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pin"
                  required
                />
                <InputField
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full street address"
                  required
                />
              </div>

              <FileUpload
                id="shop-logo-upload"
                label="Shop Logo"
                files={logoFile}
                onFilesChange={(f) => setLogoFile(f)}
                onRemove={() => setLogoFile([])}
                maxFiles={1}
                helper="Recommended: Square image, max 2MB"
              />
            </div>
          </div>

          {/* Owner Information */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ padding: 8, background: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', borderRadius: 8 }}>
                <User size={20} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Owner Details</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField
                label="Owner Full Name"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Name of the person"
                required
              />

              <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seller@example.com"
                required
              />

              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                required
              />

              <InputField
                label="Seller Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
              />

              <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <CheckCircle size={14} style={{ color: '#10B981', verticalAlign: 'middle', marginRight: 6 }} />
                  This shop will be <strong>automatically approved</strong>. The seller can login immediately using these credentials.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button 
            type="button" 
            className="btn btn-ghost" 
            onClick={() => navigate('/admin/shops')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '12px 32px' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Register & Approve Shop'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .admin-form-container {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 80px;
        }
        .admin-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 768px) {
          .admin-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAddShop;
