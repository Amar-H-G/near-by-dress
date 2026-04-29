import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingBag, Mail, Lock, User, Phone } from 'lucide-react';
import InputField from '../../../shared/components/form/InputField';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((err) => ({ ...err, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name}! Account created.`);
      if (user.role === 'shop_owner') navigate('/seller/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #7c3aed, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
          }}>
            <ShoppingBag size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Join NearByDress today</p>
        </div>

        <div className="glass-strong" style={{ borderRadius: 24, padding: 32 }}>
          {/* Role Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            {['customer', 'shop_owner'].map((role) => (
              <button
                key={role}
                type="button"
                id={`role-${role}`}
                onClick={() => setForm((f) => ({ ...f, role }))}
                style={{
                  padding: '13px 12px', borderRadius: 14, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  background: form.role === role ? 'linear-gradient(135deg, #7c3aed, #9333EA)' : 'var(--surface-2)',
                  color: form.role === role ? '#fff' : 'var(--text-muted)',
                  border: `1.5px solid ${form.role === role ? '#7c3aed' : 'var(--border)'}`,
                  transition: 'all 0.2s ease',
                  boxShadow: form.role === role ? '0 4px 14px rgba(124,58,237,0.3)' : 'none',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {role === 'customer' ? '🛍️ Customer' : '🏪 Shop Owner'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
            <InputField
              id="reg-name"
              label="Full Name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              error={errors.name}
              icon={<User size={16} />}
            />

            <InputField
              id="reg-email"
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
              error={errors.email}
              icon={<Mail size={16} />}
            />

            <InputField
              id="reg-password"
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
              error={errors.password}
              helper={!errors.password ? 'At least 6 characters' : undefined}
              icon={<Lock size={16} />}
            />

            <InputField
              id="reg-phone"
              label="Phone (optional)"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              icon={<Phone size={16} />}
            />

            <button
              id="reg-submit"
              type="submit"
              className="btn btn-primary"
              style={{ padding: '14px', fontSize: 16, marginTop: 4, borderRadius: 14, width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
