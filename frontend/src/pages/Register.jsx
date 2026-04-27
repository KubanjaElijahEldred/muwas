import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Clock3,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  Truck,
  User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toAbsoluteApiUrl } from '../utils/api';

const authFeatures = [
  { icon: Leaf, label: 'Leaf' },
  { icon: Truck, label: 'Truck' },
  { icon: Clock3, label: 'Clock' },
  { icon: BadgeCheck, label: 'Approved Seal' },
];

const phoneCountryOptions = [
  { code: '+256', label: 'Uganda', flag: '🇺🇬' },
  { code: '+254', label: 'Kenya', flag: '🇰🇪' },
  { code: '+255', label: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', label: 'Rwanda', flag: '🇷🇼' },
  { code: '+211', label: 'South Sudan', flag: '🇸🇸' },
];

const normalizePhoneNumber = (countryCode, phoneNumber) => {
  const rawPhone = String(phoneNumber || '').trim();

  if (!rawPhone) {
    return '';
  }

  if (rawPhone.startsWith('+')) {
    return rawPhone.replace(/\s+/g, '');
  }

  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  const normalizedLocalNumber = digits.replace(/^0+/, '');
  const normalizedCountryCode = String(countryCode || '+256')
    .replace(/[^\d+]/g, '')
    .replace(/^(?!\+)/, '+');

  return `${normalizedCountryCode}${normalizedLocalNumber}`;
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: '+256',
    role: 'customer',
    street: '',
    city: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleAuthUrl = useMemo(() => {
    const authUrl = new URL(toAbsoluteApiUrl('/auth/google/start'));

    if (typeof window !== 'undefined') {
      authUrl.searchParams.set('redirect', `${window.location.origin}/login`);
    }

    return authUrl.toString();
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const registrationData = { ...formData };
    const countryCode = registrationData.countryCode;
    delete registrationData.confirmPassword;
    delete registrationData.countryCode;

    registrationData.phone = normalizePhoneNumber(countryCode, registrationData.phone);

    if (registrationData.street || registrationData.city) {
      registrationData.address = {
        street: registrationData.street,
        city: registrationData.city,
        country: 'Uganda',
      };
      delete registrationData.street;
      delete registrationData.city;
    }

    const result = await register(registrationData);

    if (result.success) {
      navigate('/');
      return;
    }

    setError(result.message);
    setLoading(false);
  };

  const handleGoogleContinue = () => {
    window.location.assign(googleAuthUrl);
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-shell auth-shell--wide">
        <section className="auth-visual">
          <img
            src="/images/home.png"
            alt="Muwas bottles displayed with fruit, botanicals, and farmland"
            className="auth-visual__image"
          />
          <div className="auth-visual__overlay" />
          <div className="auth-visual__content">
            <p className="auth-visual__eyebrow">Wholesale and retail access</p>
            <h1>Create your Muwas account in under a minute.</h1>
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

          <form className="auth-form auth-form--grid" onSubmit={handleSubmit}>
            {error && <div className="auth-form__alert auth-form__alert--full">{error}</div>}

            <label className="auth-field auth-field--full">
              <span>Full name</span>
              <div className="auth-field__control">
                <User size={18} strokeWidth={1.8} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </div>
            </label>

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
              <span>Phone number</span>
              <div className="auth-field__control auth-field__control--phone">
                <Phone size={18} strokeWidth={1.8} />
                <select
                  id="countryCode"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="auth-phone-code"
                  aria-label="Country code"
                >
                  {phoneCountryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="7XXXXXXXX"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Account type</span>
              <div className="auth-field__control auth-field__control--select">
                <select id="role" name="role" value={formData.role} onChange={handleChange}>
                  <option value="customer">Customer</option>
                  <option value="wholesale">Wholesale (approval required)</option>
                </select>
              </div>
            </label>

            <label className="auth-field">
              <span>City</span>
              <div className="auth-field__control">
                <MapPin size={18} strokeWidth={1.8} />
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
            </label>

            <label className="auth-field auth-field--full">
              <span>Street address</span>
              <div className="auth-field__control">
                <MapPin size={18} strokeWidth={1.8} />
                <input
                  id="street"
                  name="street"
                  type="text"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-field__control">
                <Lock size={18} strokeWidth={1.8} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
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
              </div>
            </label>

            <label className="auth-field">
              <span>Confirm password</span>
              <div className="auth-field__control">
                <Lock size={18} strokeWidth={1.8} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
              </div>
            </label>

            <button type="submit" disabled={loading} className="auth-submit auth-submit--full">
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <div className="auth-form__or auth-form__or--full">or</div>

            <button
              type="button"
              onClick={handleGoogleContinue}
              className="auth-google-button auth-google-button--full"
            >
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

            <p className="auth-form__footer auth-form__footer--full">
              Already have an account? <Link to="/login">Sign in instead</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Register;
