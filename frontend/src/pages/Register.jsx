import React, { useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Camera,
  Clock3,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  Truck,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toAbsoluteApiUrl } from '../utils/api';
const brandLogo = '/images/logo-muwas.jpg';

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

const evaluatePasswordStrength = (password = '') => {
  const value = String(password || '');
  const checks = {
    minLength: value.length >= 8,
    hasUpper: /[A-Z]/.test(value),
    hasLower: /[a-z]/.test(value),
    hasNumber: /\d/.test(value),
    hasSymbol: /[^A-Za-z0-9]/.test(value),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  let label = 'Weak';
  let level = 'weak';

  if (passed >= 5) {
    label = 'Strong';
    level = 'strong';
  } else if (passed >= 3) {
    label = 'Medium';
    level = 'medium';
  }

  return {
    ...checks,
    passed,
    label,
    level,
    isStrongEnough: checks.minLength && checks.hasUpper && checks.hasLower && checks.hasNumber,
  };
};

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
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
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const googleAuthUrl = useMemo(() => {
    const authUrl = new URL(toAbsoluteApiUrl('/auth/google/start'));

    if (typeof window !== 'undefined') {
      authUrl.searchParams.set('redirect', `${window.location.origin}/login`);
    }

    return authUrl.toString();
  }, []);
  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(formData.password),
    [formData.password]
  );

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Create input for camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleImageUpload;
    input.click();
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    if (!passwordStrength.isStrongEnough) {
      setError(
        'Password is too weak. Use at least 8 characters with uppercase, lowercase, and a number.'
      );
      setLoading(false);
      return;
    }

    // Create FormData to handle file upload
    const submitData = new FormData();
    
    // Add form fields
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('phone', normalizePhoneNumber(formData.countryCode, formData.phone));
    submitData.append('role', formData.role);
    
    if (formData.street || formData.city) {
      submitData.append('address[street]', formData.street);
      submitData.append('address[city]', formData.city);
      submitData.append('address[country]', 'Uganda');
    }
    
    // Add profile image if selected
    if (profileImage) {
      submitData.append('profileImage', profileImage);
    }

    const result = await register(submitData);

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      if (result.user?.role === 'wholesale') {
        navigate('/wholesale', { replace: true });
        return;
      }

      navigate('/', { replace: true });
      return;
    }

    setError(result.message);
    setLoading(false);
  };

  const handleGoogleContinue = () => {
    window.location.assign(googleAuthUrl);
  };

  React.useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    if (user.role === 'wholesale') {
      navigate('/wholesale', { replace: true });
      return;
    }

    navigate('/', { replace: true });
  }, [navigate, user]);

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

          <form className="auth-form auth-form--grid" onSubmit={handleSubmit}>
            {error && <div className="auth-form__alert auth-form__alert--full">{error}</div>}

            {/* Profile Picture Upload */}
            <div className="auth-field auth-field--full">
              <span>Profile picture (optional)</span>
              <div className="auth-profile-upload">
                <div className="auth-profile-upload__preview">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="auth-profile-upload__image"
                    />
                  ) : (
                    <div className="auth-profile-upload__placeholder">
                      <User size={48} strokeWidth={1.8} />
                      <span>Add profile picture</span>
                    </div>
                  )}
                </div>
                
                <div className="auth-profile-upload__controls">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="auth-profile-upload__btn"
                  >
                    <Upload size={16} strokeWidth={1.8} />
                    Choose Photo
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleCameraCapture}
                    className="auth-profile-upload__btn"
                  >
                    <Camera size={16} strokeWidth={1.8} />
                    Take Photo
                  </button>
                  
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      className="auth-profile-upload__btn auth-profile-upload__btn--remove"
                    >
                      <X size={16} strokeWidth={1.8} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

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
                  <option value="wholesale">Wholesale</option>
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
              <div className={`auth-password-strength auth-password-strength--${passwordStrength.level}`}>
                <strong>Strength: {passwordStrength.label}</strong>
                <ul>
                  <li className={passwordStrength.minLength ? 'is-pass' : ''}>At least 8 characters</li>
                  <li className={passwordStrength.hasUpper ? 'is-pass' : ''}>One uppercase letter</li>
                  <li className={passwordStrength.hasLower ? 'is-pass' : ''}>One lowercase letter</li>
                  <li className={passwordStrength.hasNumber ? 'is-pass' : ''}>One number</li>
                  <li className={passwordStrength.hasSymbol ? 'is-pass' : ''}>One symbol (recommended)</li>
                </ul>
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
              <span className="auth-google-button__icon" aria-hidden="true">G</span>
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
