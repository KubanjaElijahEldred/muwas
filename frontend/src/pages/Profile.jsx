import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Filter,
  Package,
  Search,
  User,
  Edit,
  Save,
  X,
  Camera,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  Award,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast } from '../utils/toast';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const messageTimeoutRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      country: 'Uganda',
      postalCode: ''
    }
  });

  const profileSections = [
    { key: 'overview', label: 'Overview', description: 'Basic profile information', icon: User },
    { key: 'personal', label: 'Personal Info', description: 'Name and contact details', icon: Mail },
    { key: 'address', label: 'Address', description: 'Shipping and billing address', icon: MapPin },
    { key: 'security', label: 'Security', description: 'Account security settings', icon: ShieldCheck },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          country: user.address?.country || 'Uganda',
          postalCode: user.address?.postalCode || ''
        }
      });
      // Set existing profile image if available
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user]);

  useEffect(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
    }, 5000);

    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage('Image size should be less than 5MB');
      return;
    }

    setProfileImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Create FormData to handle file upload
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('phone', formData.phone);
    
    // Append address fields properly
    const addressData = {
      street: formData.address.street,
      city: formData.address.city,
      country: formData.address.country,
      postalCode: formData.address.postalCode
    };
    submitData.append('address', JSON.stringify(addressData));
    
    // Add profile image if changed
    if (profileImage) {
      submitData.append('profileImage', profileImage);
    }

    try {
      const result = await updateProfile(submitData);

      if (result.success) {
        setMessage('Profile updated successfully!');
        showSuccessToast('Changes saved');
        setIsEditing(false);
        setProfileImage(null);
      } else {
        setMessage(result.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Failed to update profile');
      console.error('Profile update error:', error);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          country: user.address?.country || 'Uganda',
          postalCode: user.address?.postalCode || ''
        }
      });
      // Restore original profile image
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <User size={42} strokeWidth={1.7} />
            <h2>Profile not available</h2>
            <p>Please log in to view your profile information</p>
            <Link to="/login" className="products-showcase__cta products-showcase__cta--primary">
              Login to Your Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page profile-page--unified">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header__background"></div>
        <div className="profile-header__content">
          <div className="profile-header__avatar">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="profile-header__avatar-img"
              />
            ) : (
              <div className="profile-header__avatar-placeholder">
                <User size={48} strokeWidth={1.8} />
              </div>
            )}
            <button
              type="button"
              className="profile-header__avatar-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} strokeWidth={1.8} />
            </button>
          </div>
          
          <div className="profile-header__info">
            <h1 className="profile-header__name">{user?.name || 'Guest User'}</h1>
            <p className="profile-header__email">{user?.email || 'No email'}</p>
            <div className="profile-header__meta">
              <span className="profile-header__role">{user?.role || 'Customer'}</span>
              <span className="profile-header__joined">
                Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="profile-header__actions">
            <button
              type="button"
              className={`profile-header__btn ${isEditing ? 'btn-cancel' : 'btn-edit'}`}
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <X size={16} strokeWidth={1.8} />
                  Cancel
                </>
              ) : (
                <>
                  <Edit size={16} strokeWidth={1.8} />
                  Edit Profile
                </>
              )}
            </button>
            
            {isEditing && (
              <button
                type="button"
                className="profile-header__btn btn-save"
                onClick={handleSubmit}
                disabled={loading}
              >
                <Save size={16} strokeWidth={1.8} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button
              type="button"
              className="profile-header__btn btn-cancel"
              onClick={handleLogout}
            >
              <LogOut size={16} strokeWidth={1.8} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-content profile-content--unified">
        <div className="profile-sidebar">
          <nav className="profile-nav">
            <button
              className={`profile-nav__item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <User size={18} strokeWidth={1.8} />
              <span>Overview</span>
            </button>
            <button
              className={`profile-nav__item ${activeSection === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveSection('personal')}
            >
              <Settings size={18} strokeWidth={1.8} />
              <span>Personal Info</span>
            </button>
            <button
              className={`profile-nav__item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => window.location.href = '/orders'}
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              <span>Orders</span>
            </button>
            <button
              className={`profile-nav__item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <ShieldCheck size={18} strokeWidth={1.8} />
              <span>Security</span>
            </button>
          </nav>
        </div>

        <div className="profile-main">
          {activeSection === 'overview' && (
            <div className="profile-section">
              <h2 className="profile-section__title">Profile Overview</h2>
              
              <div className="profile-cards">
                <div className="profile-card">
                  <div className="profile-card__icon">
                    <User size={24} strokeWidth={1.8} />
                  </div>
                  <div className="profile-card__content">
                    <h3>Personal Information</h3>
                    <p>Manage your name, email, and contact details</p>
                    <div className="profile-card__details">
                      <div className="profile-detail">
                        <span className="profile-detail__label">Name</span>
                        <span className="profile-detail__value">{user?.name || 'Not set'}</span>
                      </div>
                      <div className="profile-detail">
                        <span className="profile-detail__label">Email</span>
                        <span className="profile-detail__value">{user?.email || 'Not set'}</span>
                      </div>
                      <div className="profile-detail">
                        <span className="profile-detail__label">Phone</span>
                        <span className="profile-detail__value">{user?.phone || 'Not set'}</span>
                      </div>
                    </div>
                    <button
                      className="profile-card__btn"
                      onClick={() => setActiveSection('personal')}
                    >
                      <ChevronRight size={16} strokeWidth={1.8} />
                      Update Info
                    </button>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-card__icon">
                    <MapPin size={24} strokeWidth={1.8} />
                  </div>
                  <div className="profile-card__content">
                    <h3>Address Information</h3>
                    <p>Your shipping and billing address</p>
                    <div className="profile-card__details">
                      <div className="profile-detail">
                        <span className="profile-detail__label">Street</span>
                        <span className="profile-detail__value">{user?.address?.street || 'Not set'}</span>
                      </div>
                      <div className="profile-detail">
                        <span className="profile-detail__label">City</span>
                        <span className="profile-detail__value">{user?.address?.city || 'Not set'}</span>
                      </div>
                      <div className="profile-detail">
                        <span className="profile-detail__label">Country</span>
                        <span className="profile-detail__value">{user?.address?.country || 'Uganda'}</span>
                      </div>
                    </div>
                    <button
                      className="profile-card__btn"
                      onClick={() => setActiveSection('personal')}
                    >
                      <ChevronRight size={16} strokeWidth={1.8} />
                      Update Address
                    </button>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-card__icon">
                    <Award size={24} strokeWidth={1.8} />
                  </div>
                  <div className="profile-card__content">
                    <h3>Account Status</h3>
                    <p>Your membership and verification details</p>
                    <div className="profile-card__details">
                      <div className="profile-detail">
                        <span className="profile-detail__label">Account Type</span>
                        <span className="profile-detail__value">{user?.role || 'Customer'}</span>
                      </div>
                      <div className="profile-detail">
                        <span className="profile-detail__label">Verification</span>
                        <span className="profile-detail__value status-verified">Verified</span>
                      </div>
                      <div className="profile-detail">
                        <span className="profile-detail__label">Member Since</span>
                        <span className="profile-detail__value">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      className="profile-card__btn"
                      onClick={() => setActiveSection('security')}
                    >
                      <ChevronRight size={16} strokeWidth={1.8} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'personal' && (
            <div className="profile-section">
              <h2 className="profile-section__title">Personal Information</h2>
              
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-form__group">
                  <label className="profile-form__label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="profile-form__input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="profile-form__group">
                  <label className="profile-form__label">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="profile-form__input"
                    disabled
                    placeholder="Email cannot be changed here"
                  />
                  <small className="profile-form__help">Contact support to change your email</small>
                </div>

                <div className="profile-form__group">
                  <label className="profile-form__label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="profile-form__input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="profile-form__divider">
                  <h3>Address Information</h3>
                </div>

                <div className="profile-form__group">
                  <label className="profile-form__label">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    className="profile-form__input"
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__group">
                    <label className="profile-form__label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      className="profile-form__input"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div className="profile-form__group">
                    <label className="profile-form__label">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.address.postalCode}
                      onChange={handleAddressChange}
                      className="profile-form__input"
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>

                <div className="profile-form__group">
                  <label className="profile-form__label">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.address.country}
                    onChange={handleAddressChange}
                    className="profile-form__input"
                    placeholder="Enter your country"
                  />
                </div>

                <div className="profile-form__divider">
                  <h3>Profile Picture</h3>
                </div>

                <div className="profile-form__group">
                  <label className="profile-form__label">Profile Photo</label>
                  <div className="profile-image-upload">
                    {imagePreview ? (
                      <div className="profile-image-upload__preview">
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="profile-image-upload__img"
                        />
                        <div className="profile-image-upload__actions">
                          <button
                            type="button"
                            className="profile-image-upload__btn"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera size={16} strokeWidth={1.8} />
                            Change
                          </button>
                          <button
                            type="button"
                            className="profile-image-upload__btn btn-remove"
                            onClick={removeProfileImage}
                          >
                            <X size={16} strokeWidth={1.8} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="profile-image-upload__placeholder">
                        <User size={48} strokeWidth={1.8} />
                        <span>No profile picture</span>
                        <button
                          type="button"
                          className="profile-image-upload__btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={16} strokeWidth={1.8} />
                          Upload Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="profile-form__actions">
                  <button
                    type="button"
                    className="profile-form__btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-form__btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="profile-section">
              <h2 className="profile-section__title">Security Settings</h2>
              
              <div className="profile-cards">
                <div className="profile-card">
                  <div className="profile-card__icon">
                    <ShieldCheck size={24} strokeWidth={1.8} />
                  </div>
                  <div className="profile-card__content">
                    <h3>Password</h3>
                    <p>Change your account password</p>
                    <div className="profile-card__details">
                      <div className="profile-detail">
                        <span className="profile-detail__label">Last Changed</span>
                        <span className="profile-detail__value">Never</span>
                      </div>
                    </div>
                    <button className="profile-card__btn">
                      <ChevronRight size={16} strokeWidth={1.8} />
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="profile-card__icon">
                    <Award size={24} strokeWidth={1.8} />
                  </div>
                  <div className="profile-card__content">
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of security to your account</p>
                    <div className="profile-card__details">
                      <div className="profile-detail">
                        <span className="profile-detail__label">Status</span>
                        <span className="profile-detail__value status-disabled">Disabled</span>
                      </div>
                    </div>
                    <button className="profile-card__btn">
                      <ChevronRight size={16} strokeWidth={1.8} />
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Profile;
