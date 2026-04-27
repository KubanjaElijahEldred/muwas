import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BadgeCheck, Clock3, Eye, EyeOff, Leaf, Lock, Mail, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toAbsoluteApiUrl } from '../utils/api';

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthProvider = params.get('oauth');
    const oauthToken = params.get('token');
    const oauthError = params.get('oauth_error');

    if (oauthProvider === 'google' && oauthToken) {
      localStorage.setItem('token', oauthToken);
      window.location.assign('/products');
      return;
    }

    if (oauthError) {
      setError(oauthErrorMessages[oauthError] || 'Authentication failed. Please try again.');
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
            <span className="auth-brand__mark">MW</span>
            <div className="auth-brand__copy">
              <strong>MUWAS</strong>
              <small>DISTILLING</small>
            </div>
          </div>

          <ul className="auth-feature-list" aria-label="Account highlights">
            {authFeatures.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={21} strokeWidth={1.9} />
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <div className="auth-divider" />

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-form__alert">{error}</div>}

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
              <span className="auth-google-button__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.42c-.24 1.26-.95 2.32-2.02 3.03l3.27 2.53c1.91-1.76 3.01-4.35 3.01-7.42 0-.71-.06-1.39-.19-2.03z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 22c2.73 0 5.02-.9 6.69-2.45l-3.27-2.53c-.9.61-2.05.98-3.42.98-2.62 0-4.83-1.77-5.62-4.15H3v2.61A10 10 0 0 0 12 22"
                  />
                  <path
                    fill="#4A90E2"
                    d="M6.38 13.85A6 6 0 0 1 6.03 12c0-.64.12-1.25.35-1.85V7.54H3A10 10 0 0 0 2 12c0 1.61.39 3.14 1 4.46z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 5.98c1.48 0 2.8.51 3.84 1.52l2.88-2.88C17.01 3.02 14.72 2 12 2A10 10 0 0 0 3 7.54l3.38 2.61C7.17 7.75 9.38 5.98 12 5.98"
                  />
                </svg>
              </span>
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
