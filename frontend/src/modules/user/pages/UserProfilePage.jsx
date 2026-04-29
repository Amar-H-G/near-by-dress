import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { User, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import InputField from '../../../shared/components/form/InputField';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData((f) => ({ ...f, name: user.name || '', phone: user.phone || '' }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((err) => ({ ...err, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (formData.password && formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const updatePayload = { name: formData.name, phone: formData.phone };
      if (formData.password) updatePayload.password = formData.password;
      await updateUser(updatePayload);
      setFormData((f) => ({ ...f, password: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 60, minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        {/* Avatar Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c3aed, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 700, color: '#fff',
            boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>My Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal information</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>

            {/* Read-only email */}
            <InputField
              id="profile-email"
              label="Email Address (cannot be changed)"
              type="email"
              value={user?.email || ''}
              readOnly
              disabled
              icon={<Mail size={16} />}
            />

            <InputField
              id="profile-name"
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              error={errors.name}
              icon={<User size={16} />}
            />

            <InputField
              id="profile-phone"
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              icon={<Phone size={16} />}
            />

            {/* Security section */}
            <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>Security</h3>
              <InputField
                id="profile-password"
                label="New Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                autoComplete="new-password"
                error={errors.password}
                helper={!errors.password ? 'Min. 6 characters — only fill this if you want to change your password' : undefined}
                icon={<Lock size={16} />}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 8, borderRadius: 14 }}
              disabled={loading}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
