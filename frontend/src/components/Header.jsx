import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  ChevronDown,
  LogIn,
  Search,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
const brandLogo = '/images/logo-muwas.jpg';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Products' },
  { path: '/story', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const cartCount = getCartCount();
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleNavSearchSubmit = (event) => {
    event.preventDefault();
    const query = navSearch.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <header className="muwas-header">
      <div className="muwas-header__inner">
        <div className="muwas-header__bar">
          <Link to="/" className="muwas-brand" aria-label="Muwas home">
            <span className="muwas-brand__mark" aria-hidden="true">
              <img src={brandLogo} alt="" className="muwas-brand__mark-image" />
            </span>
            <span className="muwas-brand__copy">
              <span className="muwas-brand__title">Muwas Distilling</span>
              <span className="muwas-brand__subtitle">Ugandan craft distilling</span>
            </span>
          </Link>

          <nav className="muwas-header__nav" aria-label="Primary">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`muwas-header__nav-link ${isActive(link.path) ? 'is-active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <form className="muwas-header__search-form" onSubmit={handleNavSearchSubmit}>
            <Search size={15} strokeWidth={2} />
            <input
              type="search"
              value={navSearch}
              onChange={(event) => setNavSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <div className="muwas-header__actions">
            <Link to="/contact" className="muwas-header__circle-action" aria-label="Tasting bookings">
              <Camera size={19} strokeWidth={1.9} />
            </Link>

            <Link to="/cart" className="muwas-header__cart-chip" aria-label="Cart">
              <ShoppingCart size={20} strokeWidth={1.9} />
              <span>Cart</span>
              {cartCount > 0 && <strong>{cartCount}</strong>}
            </Link>

            {isAuthenticated ? (
              <div className="muwas-account">
                <button
                  type="button"
                  className="muwas-header__account-chip"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                >
                  <span className="muwas-account__avatar">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" />
                    ) : (
                      <User size={22} strokeWidth={1.8} />
                    )}
                  </span>
                  <span className="muwas-header__account-copy">
                    <strong>{user?.name || 'Account'}</strong>
                    <small>{user?.role || 'user'}</small>
                  </span>
                  <ChevronDown size={15} strokeWidth={1.8} />
                </button>

                {isDropdownOpen && (
                  <div className="muwas-account__menu">
                    <Link to="/profile" className="muwas-account__link">
                      Profile
                    </Link>
                    <Link to="/orders" className="muwas-account__link">
                      Orders
                    </Link>
                    {(user?.role === 'wholesale' || user?.role === 'admin') && (
                      <Link to="/wholesale" className="muwas-account__link">
                        Wholesale Portal
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="muwas-account__link">
                        Admin Dashboard
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout} className="muwas-account__link">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="muwas-header__register-button muwas-header__signin-button">
                <LogIn size={17} strokeWidth={2} />
                Sign in
              </Link>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

export default Header;
