import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  ChevronDown,
  Menu,
  LogIn,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import brandLogo from '../assets/logo muwas.jpg';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Products' },
  { path: '/story', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const cartCount = getCartCount();
  const wholesalePath =
    isAuthenticated && (user?.role === 'wholesale' || user?.role === 'admin')
      ? '/wholesale'
      : '/login';

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
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

          <button
            type="button"
            className="muwas-header__menu-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={22} strokeWidth={1.9} /> : <Menu size={22} strokeWidth={1.9} />}
          </button>
        </div>

        <div className="muwas-header__subbar">
          <span className="muwas-header__subbar-note">
            <span className="muwas-header__subbar-dot" aria-hidden="true" />
            Wholesale and tasting bookings are open now.
          </span>
          <Link to={wholesalePath} className="muwas-header__subbar-button">
            Wholesale Login
          </Link>
        </div>

        {isMenuOpen && (
          <div className="muwas-mobile-menu">
            <nav className="muwas-mobile-menu__links" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`muwas-mobile-menu__link ${isActive(link.path) ? 'is-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="muwas-mobile-menu__link">
                Cart {cartCount > 0 ? `(${cartCount})` : ''}
              </Link>
              <Link to={wholesalePath} onClick={() => setIsMenuOpen(false)} className="muwas-mobile-menu__link">
                Wholesale Portal
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="muwas-mobile-menu__link muwas-mobile-menu__button"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="muwas-mobile-menu__link">
                    Sign in
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
