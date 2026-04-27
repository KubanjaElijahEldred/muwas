import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
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
    }
  }, [user]);

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

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to view your profile.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gold-600 text-dark-900 font-semibold rounded-lg hover:bg-gold-500 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-white">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-gold-600 text-dark-900 font-medium rounded-lg hover:bg-gold-500 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-900/50 border border-green-600 text-green-200' 
              : 'bg-red-900/50 border border-red-600 text-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg border border-gold-600/20 p-6 text-center">
              <div className="w-24 h-24 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-dark-900" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{user.name}</h2>
              <p className="text-gray-400 mb-4">{user.email}</p>
              <div className="inline-flex items-center px-3 py-1 bg-gold-600/10 border border-gold-600/30 rounded-full">
                <span className="text-gold-500 text-sm font-medium capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-lg border border-gold-600/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-dark-700 border border-gold-600/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 bg-dark-700 border border-gold-600/20 text-gray-500 rounded-lg cursor-not-allowed"
                    />
                    <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-700 border border-gold-600/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="+256 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark-700 border border-gold-600/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-dark-700 border border-gold-600/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="Kampala"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-dark-700 border border-gold-600/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                        placeholder="256"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-gold-600 text-dark-900 font-medium rounded-lg hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-900 mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 border border-gold-600 text-gold-500 font-medium rounded-lg hover:bg-gold-600 hover:text-dark-900 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gold-500 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Full Name</p>
                      <p className="text-white">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gold-500 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Email Address</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gold-500 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Phone Number</p>
                      <p className="text-white">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gold-500 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Address</p>
                      <p className="text-white">
                        {user.address?.street && (
                          <>
                            {user.address.street}<br />
                          </>
                        )}
                        {user.address?.city && (
                          <>
                            {user.address.city}, {user.address?.country || 'Uganda'}
                          </>
                        )}
                        {!user.address?.street && !user.address?.city && 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gold-600/20">
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-400 text-sm">Account Type:</p>
                      <span className="inline-flex items-center px-3 py-1 bg-gold-600/10 border border-gold-600/30 rounded-full">
                        <span className="text-gold-500 text-sm font-medium capitalize">
                          {user.role}
                        </span>
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
