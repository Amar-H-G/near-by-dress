import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Mail, ShoppingBag, Sparkles } from 'lucide-react';
import { useAuth } from '../../core/auth/useAuth';
import { useSettings } from '../../core/contexts/useSettings';
import InputField from '../../shared/components/form/InputField';
import NBDLogo from '../../shared/components/NBDLogo';
import { BRAND } from '../../shared/config/branding';

const LoginPage = () => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((current) => ({ ...current, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   // ← must be FIRST, before any async work
    e.stopPropagation();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name || 'User'}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'shop_owner') navigate('/seller/dashboard');
      else navigate('/');
    } catch (err) {
      // Extract the most meaningful error message available
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Wrong email or password. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <NBDLogo variant="auth" />
      </div>

      <section className="auth-visual">
        <span className="luxury-eyebrow fashion-hero-kicker">
          <Sparkles size={14} /> Premium local fashion
        </span>
        <h1>Sign in to shop curated drops from verified boutiques.</h1>
        <p>Return to saved conversations, seller dashboards, admin tools, or your personal profile based on your account role.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-header">
          <span className="luxury-eyebrow">Welcome back</span>
          <h2>Sign in</h2>
          <p>Access your {BRAND.short} account.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <InputField
            id="login-email"
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
            id="login-password"
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            required
            autoComplete="current-password"
            error={errors.password}
            icon={<Lock size={16} />}
          />

          <button id="login-submit" type="submit" className="luxury-btn luxury-btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Do not have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
