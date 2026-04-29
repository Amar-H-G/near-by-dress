import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Phone, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((f) => ({
        ...f,
        name: user.name || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
      };
      // Only send password if user wants to change it
      if (formData.password) {
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        updatePayload.password = formData.password;
      }
      
      await updateUser(updatePayload);
      setFormData((f) => ({ ...f, password: '' })); // clear password field after successful update
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--primary), #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: '#fff'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>My Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal information</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Email Address (Cannot be changed)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input className="input" style={{ paddingLeft: 42, background: 'var(--bg-2)', color: 'var(--text-muted)' }} type="email" value={user?.email || ''} readOnly disabled />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input className="input" style={{ paddingLeft: 42 }} type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input className="input" style={{ paddingLeft: 42 }} type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div style={{ marginTop: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Security</h3>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 8 }}>New Password (leave blank to keep current)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                <input className="input" style={{ paddingLeft: 42 }} type="password" name="password" placeholder="Enter new password" value={formData.password} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 12 }} disabled={loading}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
