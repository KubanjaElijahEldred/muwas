import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, Menu, ShoppingCart, User, UserRound, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import brandLogo from '../assets/logo muwas.jpg';

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/products', label: 'PRODUCTS' },
  { path: '/story', label: 'ABOUT' },
  { path: '/contact', label: 'CONTACT' },
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
    navigate('/');
  };

  return (
    <header className="muwas-header">
      <div className="muwas-header__inner">
        <div className="muwas-header__bar">
          <Link to="/" className="muwas-brand">
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
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsDropdownOpen(false)}
                className={`muwas-header__nav-link ${isActive(link.path) ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="muwas-header__actions">
            <a
              href="https://www.instagram.com/"
              className="muwas-header__action muwas-header__action--icon"
              aria-label="Muwas Distilling on Instagram"
            >
              <Camera size={17} strokeWidth={1.9} />
            </a>

            <Link to="/cart" className="muwas-header__action">
              <ShoppingCart size={17} strokeWidth={1.8} />
              <span>Cart</span>
              {cartCount > 0 && <strong>{cartCount}</strong>}
            </Link>

            {isAuthenticated ? (
              <div className="muwas-account">
                <button
                  type="button"
                  className="muwas-header__action"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                >
                  <div className="muwas-account__avatar">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="muwas-account__avatar-img"
                      />
                    ) : (
                      <User size={17} strokeWidth={1.8} />
                    )}
                  </div>
                  <span>{user?.name || 'Account'}</span>
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
              <div className="muwas-header__auth-links">
                <Link to="/login" className="muwas-header__mini-link">
                  <UserRound size={17} strokeWidth={1.8} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="muwas-header__mini-link">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            className="muwas-header__menu-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
          </button>
        </div>

        <div className="muwas-header__subbar">
          <span className="muwas-header__subbar-note">Wholesale and tasting bookings are open now.</span>
          <Link to={wholesalePath} className="muwas-outline-button">
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
            </nav>

            <div className="muwas-mobile-menu__actions">
              <Link to="/cart" className="muwas-mobile-menu__link">
                Cart {cartCount > 0 ? `(${cartCount})` : ''}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="muwas-mobile-menu__link">
                    Profile
                  </Link>
                  <Link to="/orders" className="muwas-mobile-menu__link">
                    Orders
                  </Link>
                  {(user?.role === 'wholesale' || user?.role === 'admin') && (
                    <Link to="/wholesale" className="muwas-mobile-menu__link">
                      Wholesale Portal
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="muwas-mobile-menu__link">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="muwas-mobile-menu__link muwas-mobile-menu__button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="muwas-mobile-menu__link">
                    Login
                  </Link>
                  <Link to="/register" className="muwas-mobile-menu__link">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
