import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../core/auth/useAuth';
import InputField from '../../shared/components/form/InputField';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setFormData((current) => ({ ...current, name: user.name || '', phone: user.phone || '' }));
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((current) => ({ ...current, [e.target.name]: '' }));
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
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const updatePayload = { name: formData.name, phone: formData.phone };
      if (formData.password) updatePayload.password = formData.password;
      await updateUser(updatePayload);
      setFormData((current) => ({ ...current, password: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marketplace-page luxury-shell profile-page">
      <div className="container profile-shell">
        <section className="profile-summary">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span className="luxury-eyebrow">My account</span>
          <h1 className="luxury-title luxury-title-sm">{user?.name || 'Account'}</h1>
          <p>Manage your public profile details and account security.</p>
          <div className="profile-trust">
            <ShieldCheck size={18} />
            Protected account settings
          </div>
        </section>

        <section className="profile-form-card">
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
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

            <div className="profile-security">
              <h3>Security</h3>
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
                helper={!errors.password ? 'Min. 6 characters; only fill this if you want to change your password' : undefined}
                icon={<Lock size={16} />}
              />
            </div>

            <button type="submit" className="luxury-btn luxury-btn-primary auth-submit" disabled={loading}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save changes'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default UserProfilePage;
