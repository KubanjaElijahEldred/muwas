import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_FALLBACK_BASE_URL } from '../utils/api';

const AuthContext = createContext();
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

const buildFallbackUrl = (url = '') => {
  if (!API_FALLBACK_BASE_URL) {
    return '';
  }

  const normalizedUrl = String(url || '');

  if (!normalizedUrl || /^https?:\/\//i.test(normalizedUrl)) {
    return '';
  }

  return `${API_FALLBACK_BASE_URL}${normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`}`;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [api] = useState(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const requestConfig = error?.config;
        const hasFallbackTarget = Boolean(API_FALLBACK_BASE_URL);

        if (!hasFallbackTarget || !requestConfig || requestConfig.__fallbackRetried) {
          return Promise.reject(error);
        }

        const statusCode = error.response?.status;
        const isNetworkError = !error.response;
        const isRetryableStatus = RETRYABLE_STATUS_CODES.has(statusCode);

        if (!isNetworkError && !isRetryableStatus) {
          return Promise.reject(error);
        }

        const fallbackUrl = buildFallbackUrl(requestConfig.url);
        if (!fallbackUrl) {
          return Promise.reject(error);
        }

        requestConfig.__fallbackRetried = true;
        requestConfig.baseURL = undefined;
        requestConfig.url = fallbackUrl;

        return instance.request(requestConfig);
      }
    );

    return instance;
  });

  useEffect(() => {
    if (!token) {
      delete api.defaults.headers.common.Authorization;
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    fetchUser();
  }, [api, token]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      localStorage.setItem('token', newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      setToken(newToken);
      localStorage.setItem('token', newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    token,
    api,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isWholesale: user?.role === 'wholesale',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
