import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Mail, Phone, ShoppingBag, Store, User } from 'lucide-react';
import { useAuth } from '../../core/auth/useAuth';
import { useSettings } from '../../core/contexts/useSettings';
import InputField from '../../shared/components/form/InputField';
import NBDLogo from '../../shared/components/NBDLogo';
import { BRAND } from '../../shared/config/branding';

const RegisterPage = () => {
  const { register } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setForm((current) => ({ ...current, [name]: numericValue }));
      }
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
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
    <div className="auth-page auth-page-register">
      <div className="auth-brand">
        <NBDLogo variant="auth" />
      </div>

      <section className="auth-visual">
        <span className="luxury-eyebrow fashion-hero-kicker">Join the marketplace</span>
        <h1>Create a shopper account or launch a boutique storefront.</h1>
        <p>Customers can browse premium local fashion. Sellers can enter their dashboard and start building a verified shop presence.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-header">
          <span className="luxury-eyebrow">Create account</span>
          <h2>Start with {BRAND.short}</h2>
          <p>Choose your role and continue.</p>
        </div>

        <div className="role-selector" aria-label="Account role">
          <button
            type="button"
            id="role-customer"
            onClick={() => setForm((current) => ({ ...current, role: 'customer' }))}
            className={`role-card ${form.role === 'customer' ? 'role-card-active' : ''}`}
          >
            <User size={18} />
            Customer
          </button>
          <button
            type="button"
            id="role-shop_owner"
            onClick={() => setForm((current) => ({ ...current, role: 'shop_owner' }))}
            className={`role-card ${form.role === 'shop_owner' ? 'role-card-active' : ''}`}
          >
            <Store size={18} />
            Shop Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
            label="Phone Number"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            required
            autoComplete="tel"
            error={errors.phone}
            icon={<Phone size={16} />}
          />

          <button id="reg-submit" type="submit" className="luxury-btn luxury-btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;
