import { useState, useEffect } from 'react';
import { useSettings } from '../../core/contexts/useSettings';
import API from '../../core/api/client';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const AdminSettings = () => {
  const { settings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    siteName: '',
    primaryColor: '#000000',
    secondaryColor: '#000000',
    contactEmail: '',
    contactPhone: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      queueMicrotask(() => {
        setFormData({
          siteName: settings.siteName || '',
          primaryColor: settings.primaryColor || '#2563eb',
          secondaryColor: settings.secondaryColor || '#10b981',
          contactEmail: settings.contactEmail || '',
          contactPhone: settings.contactPhone || ''
        });
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (logoFile) data.append('logo', logoFile);

      await API.put('/admin/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Settings updated successfully');
      refreshSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 12, background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: 12 }}>
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Global Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure site-wide preferences and branding</p>
        </div>
      </div>

      <div className="card" style={{ padding: 32, maxWidth: 800 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Site Name</label>
              <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Site Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {settings?.logo && !logoFile && (
                  <img src={settings.logo} alt="Logo" style={{ height: 40, width: 'auto', objectFit: 'contain', background: '#f1f5f9', padding: 4, borderRadius: 8 }} />
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="input" style={{ flex: 1, padding: '8px 12px' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Primary Color (Hex)</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} style={{ width: 48, height: 48, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="input" style={{ flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Secondary Color (Hex)</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} style={{ width: 48, height: 48, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                <input type="text" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="input" style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Contact Phone</label>
              <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="input" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }} disabled={loading}>
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
