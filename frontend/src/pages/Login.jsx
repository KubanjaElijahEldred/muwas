import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BadgeCheck, Clock3, Eye, EyeOff, Leaf, Lock, Mail, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toAbsoluteApiUrl } from '../utils/api';
const brandLogo = '/images/logo-muwas.jpg';

const authFeatures = [
  { icon: Leaf, label: 'Leaf' },
  { icon: Truck, label: 'Truck' },
  { icon: Clock3, label: 'Clock' },
  { icon: BadgeCheck, label: 'Approved Seal' },
];

const oauthErrorMessages = {
  google_not_configured: 'Google sign-in is not configured yet.',
  google_access_denied: 'Google sign-in was cancelled. Please try again.',
  google_no_code: 'Google sign-in did not return an authorization code.',
  account_not_approved: 'Your account is not approved yet.',
  google_login_failed: 'Google sign-in failed. Please try again.',
};

const SUPER_ADMIN_EMAIL = String(import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'bryan@muwas.ca')
  .trim()
  .toLowerCase();
const SUPER_ADMIN_USERNAME_HINT =
  String(import.meta.env.VITE_SUPER_ADMIN_USERNAME || 'bryan anderson').trim() || 'bryan anderson';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isSuperAdminLogin = formData.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
  const redirectPath = location.state?.from || '/products';
  const googleAuthUrl = useMemo(() => {
    const authUrl = new URL(toAbsoluteApiUrl('/auth/google/start'));

    if (typeof window !== 'undefined') {
      authUrl.searchParams.set('redirect', `${window.location.origin}/login`);
    }

    return authUrl.toString();
  }, []);
  const oauthErrorMessage = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('oauth_error');

    return oauthError
      ? oauthErrorMessages[oauthError] || 'Authentication failed. Please try again.'
      : '';
  }, [location.search]);
  const visibleError = error || oauthErrorMessage;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthProvider = params.get('oauth');
    const oauthToken = params.get('token');

    if (oauthProvider === 'google' && oauthToken) {
      localStorage.setItem('token', oauthToken);
      window.location.assign('/products');
    }
  }, [location.search]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const resolvePostLoginPath = (userData) => {
    if (redirectPath && redirectPath !== '/login' && redirectPath !== '/register') {
      return redirectPath;
    }

    if (userData?.role === 'admin') {
      return '/admin';
    }

    if (userData?.role === 'wholesale') {
      return '/wholesale';
    }

    return '/products';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    navigate(resolvePostLoginPath(result.user));
  };

  const handleGoogleContinue = () => {
    window.location.assign(googleAuthUrl);
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-visual">
          <img
            src="/images/home.png"
            alt="Muwas bottles displayed with fruit, botanicals, and farmland"
            className="auth-visual__image"
          />
          <div className="auth-visual__overlay" />
          <div className="auth-visual__content">
            <p className="auth-visual__eyebrow">Farm-grown botanicals</p>
            <h1>Crafted in Uganda, bottled for every shelf.</h1>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-brand">
            <span className="auth-brand__mark">
              <img src={brandLogo} alt="" />
            </span>
            <div className="auth-brand__copy">
              <strong>MUWAS</strong>
              <small>DISTILLING</small>
            </div>
          </div>

          <ul className="auth-feature-list" aria-label="Account highlights">
            {authFeatures.map((feature) => (
              <li key={feature.label}>
                {React.createElement(feature.icon, { size: 21, strokeWidth: 1.9 })}
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>

          <div className="auth-divider" />

          <form className="auth-form" onSubmit={handleSubmit}>
            {visibleError && <div className="auth-form__alert">{visibleError}</div>}

            <label className="auth-field">
              <span>Email address</span>
              <div className="auth-field__control">
                <Mail size={18} strokeWidth={1.8} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>{isSuperAdminLogin ? 'Username' : 'Password'}</span>
              <div className="auth-field__control">
                <Lock size={18} strokeWidth={1.8} />
                <input
                  id="password"
                  name="password"
                  type={isSuperAdminLogin ? 'text' : (showPassword ? 'text' : 'password')}
                  autoComplete={isSuperAdminLogin ? 'off' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isSuperAdminLogin ? SUPER_ADMIN_USERNAME_HINT : 'Password'}
                />
                {!isSuperAdminLogin && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="auth-field__toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                )}
              </div>
            </label>

            <div className="auth-form__meta">
              <label className="auth-checkbox">
                <input id="remember-me" name="remember-me" type="checkbox" />
                <span>Remember me</span>
              </label>

              <span className="auth-form__hint">
                {isSuperAdminLogin
                  ? `Super admin login uses your username in this field (${SUPER_ADMIN_USERNAME_HINT}).`
                  : 'Remember me and use your registered email for faster access.'}
              </span>
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-form__or">or</div>

            <button type="button" onClick={handleGoogleContinue} className="auth-google-button">
              <span className="auth-google-button__icon" aria-hidden="true">G</span>
              Continue with Google
            </button>

            <p className="auth-form__footer">
              New here? <Link to="/register">Create an account</Link>
            </p>
            <p className="auth-form__footer auth-form__footer--muted">
              Need wholesale access? <Link to="/register">Register for approval</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
