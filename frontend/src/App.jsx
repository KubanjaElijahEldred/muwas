import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import SiteAssistant from './components/SiteAssistant';
import Landing from './pages/Landing';
import Story from './pages/Story';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wholesale from './pages/Wholesale';
import AdminDashboard from './pages/AdminDashboard';
import MTNMomoAPI from './pages/MTNMomoAPI';
import MTNMomoDocs from './pages/MTNMomoDocs';
import MTNMomoSandbox from './pages/MTNMomoSandbox';
import AirtelMoneyAPI from './pages/AirtelMoneyAPI';
import MuwasSimulation from './pages/MuwasSimulation';
import ProtectedRoute from './components/ProtectedRoute';
import { fetchWithApiFallback } from './utils/api';
import './App.css';

function parseBooleanFlag(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return fallback;
}

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem('muwas-theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function App() {
  const [siteProducts, setSiteProducts] = useState([]);
  const [theme, setTheme] = useState(getInitialTheme);
  const shouldFetchSiteProducts = parseBooleanFlag(
    import.meta.env.VITE_FETCH_SITE_PRODUCTS,
    false
  );

  useEffect(() => {
    if (!shouldFetchSiteProducts) {
      return undefined;
    }

    let isMounted = true;

    const fetchSiteProducts = async () => {
      try {
        const response = await fetchWithApiFallback('/products');

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (isMounted && Array.isArray(data.products) && data.products.length > 0) {
          setSiteProducts(data.products);
        }
      } catch (error) {
        // Keep UI running with empty assistant catalog when API is offline.
      }
    };

    fetchSiteProducts();

    return () => {
      isMounted = false;
    };
  }, [shouldFetchSiteProducts]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('muwas-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-dark-900 text-white">
            <Header siteProducts={siteProducts} theme={theme} onToggleTheme={toggleTheme} />
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/story" element={<Story />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/mtn-momo" element={<MTNMomoAPI />} />
                <Route path="/mtn-momo/docs" element={<MTNMomoDocs />} />
                <Route path="/mtn-momo/sandbox" element={<MTNMomoSandbox />} />
                <Route path="/airtel-money" element={<AirtelMoneyAPI />} />
                <Route path="/muwas-simulation" element={<MuwasSimulation />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/wholesale" 
                  element={
                    <ProtectedRoute roles={['wholesale', 'admin']}>
                      <Wholesale />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <SiteAssistant siteProducts={siteProducts} />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
