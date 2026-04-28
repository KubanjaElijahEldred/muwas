import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
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

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      // Clear existing timeout
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      
      // Set new timeout to hide message
      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
      }, 5000);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [message]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
    
    // Add address as JSON string for proper parsing
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
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        body: submitData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        // Update user context with new data
        await updateProfile(formData);
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

  if (!user) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <User size={42} strokeWidth={1.7} />
            <h3>Please log in to view your profile</h3>
            <p>You need to be logged in to access your profile information.</p>
            <Link to="/login" className="products-showcase__cta products-showcase__cta--primary">
              Login to Your Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__inner">
        {/* Skip the hero section - start directly with toolbar */}
        <div className="products-toolbar">
          <label className="products-toolbar__search">
            <Search size={18} strokeWidth={1.9} />
            <input
              type="text"
              placeholder="Search profile information..."
              value=""
              readOnly
            />
          </label>

          <label className="products-toolbar__filter">
            <Filter size={18} strokeWidth={1.9} />
            <select value="" disabled>
              <option value="">Profile sections</option>
            </select>
          </label>

          <div className="products-toolbar__summary">
            <strong>{profileSections.length}</strong>
            <span>Profile sections available</span>
          </div>
        </div>

        <div className="products-categories" aria-label="Profile sections">
          {profileSections.map(({ key, label, description, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`products-categories__item ${activeSection === key ? 'is-active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              <span className="products-categories__icon">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <strong>{label}</strong>
              <span>{description}</span>
            </button>
          ))}
        </div>

        <div className="products-market-strip" aria-label="Profile summary">
          <div className="products-market-strip__card">
            <strong>{user.name}</strong>
            <span>Account holder</span>
          </div>
          <div className="products-market-strip__card">
            <strong>{user.role}</strong>
            <span>Account type</span>
          </div>
          <div className="products-market-strip__card">
            <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
            <span>Member since</span>
          </div>
        </div>

        {message && (
          <div className={`products-notice is-${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* Save Status Indicator */}
        {isEditing && (
          <div className="profile-save-indicator">
            <div className="profile-save-indicator__content">
              <Save size={16} strokeWidth={1.8} />
              <span>Editing mode - Don't forget to save your changes</span>
            </div>
          </div>
        )}

        {/* Profile Overview Section */}
        <section className="products-section">
          <div className="products-section__heading">
            <div>
              <p className="products-section__eyebrow">Profile Overview</p>
              <h2>Your account information.</h2>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="products-section__link"
            >
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              {isEditing ? <X size={16} strokeWidth={1.9} /> : <Edit size={16} strokeWidth={1.9} />}
            </button>
          </div>

          <div className="products-grid">
            {/* Profile Image Card */}
            <article className="products-card products-card--default">
              <div className="products-card__media">
                <span className="products-card__badge">Profile</span>
                <div className="products-card__profile-image">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="products-card__profile-img"
                    />
                  ) : (
                    <User size={48} strokeWidth={1.8} />
                  )}
                </div>
              </div>

              <div className="products-card__body">
                <div className="products-card__header">
                  <span className="products-card__category">Profile Picture</span>
                  <span className="products-card__stock">Click to update</span>
                </div>

                <h3>{user.name}</h3>
                <p>{user.email}</p>

                <div className="products-card__rating">
                  <div className="products-card__stars" aria-hidden="true">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={`${user._id}-star-${index}`}
                        className={index < 4 ? 'is-filled' : ''}
                        size={15}
                        strokeWidth={1.8}
                      />
                    ))}
                  </div>
                  <span>Active member</span>
                </div>

                <div className="products-card__facts">
                  <div>
                    <span>Role</span>
                    <strong>{user.role}</strong>
                  </div>
                  <div>
                    <span>Member</span>
                    <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>Active</strong>
                  </div>
                </div>

                <div className="products-card__footer">
                  <div className="products-card__price">
                    <strong>{user.name}</strong>
                    <span>Account holder</span>
                  </div>

                  <div className="products-card__actions">
                    <input
                      ref={fileInputRef}
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
                      type="email"
                      value={user.email}
                      disabled
                      className="form-input disabled"
                    />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+256 123 456 789"
                    />
                  </div>

                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Kampala"
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="256"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="products-showcase__cta products-showcase__cta--primary"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      ) : (
                        <Save size={16} strokeWidth={1.9} className="mr-2" />
                      )}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="products-showcase__cta"
                    >
                      <X size={16} strokeWidth={1.9} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </article>
            </div>
          </section>
        )}

        <section className="products-promo">
          <div className="products-promo__copy">
            <strong>Need help with your account?</strong>
            <span>
              Contact our support team for assistance with profile updates, 
              account security, or any other account-related questions.
            </span>
          </div>

          <div className="products-promo__actions">
            <Link to="/contact" className="products-showcase__cta products-showcase__cta--primary">
              <Mail size={16} strokeWidth={1.9} />
              Contact Support
            </Link>
            <Link to="/orders" className="products-showcase__cta">
              <Package size={16} strokeWidth={1.9} />
              View Orders
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
