import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, Moon, ShoppingCart, SunMedium, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import SiteSearch from './SiteSearch';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/story', label: 'Story' },
  { path: '/products', label: 'Products' },
  { path: '/contact', label: 'Contact Us' },
];

const brandLogo = '/images/image.png';

const Header = ({ siteProducts = [], theme = 'dark', onToggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const cartCount = getCartCount();
  const wholesalePath =
    isAuthenticated && (user?.role === 'wholesale' || user?.role === 'admin')
      ? '/wholesale'
      : '/login';
  const isLightTheme = theme === 'light';

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
              <span className="muwas-brand__subtitle">Single origin spirits, farm-grown botanicals</span>
            </span>
          </Link>

          <div className="muwas-header__search">
            <SiteSearch siteProducts={siteProducts} />
          </div>

          <nav className="muwas-header__nav" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`muwas-header__nav-link ${isActive(link.path) ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="muwas-header__actions">
            <button
              type="button"
              className="muwas-header__action muwas-header__theme-toggle"
              onClick={onToggleTheme}
              aria-label={`Switch to ${isLightTheme ? 'dark' : 'light'} mode`}
              aria-pressed={isLightTheme}
            >
              {isLightTheme ? <Moon size={17} strokeWidth={1.8} /> : <SunMedium size={17} strokeWidth={1.8} />}
              <span>{isLightTheme ? 'Dark' : 'Light'}</span>
            </button>

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
                  <User size={17} strokeWidth={1.8} />
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
                  Login
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
          <span className="muwas-header__subbar-note">
            Search the catalog, story, tours, and shop support
          </span>
          <Link to={wholesalePath} className="muwas-outline-button">
            Wholesale Login
          </Link>
        </div>

        {isMenuOpen && (
          <div className="muwas-mobile-menu">
            <SiteSearch
              siteProducts={siteProducts}
              mobile
              onNavigate={() => setIsMenuOpen(false)}
            />

            <nav className="muwas-mobile-menu__links" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`muwas-mobile-menu__link ${isActive(link.path) ? 'is-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="muwas-mobile-menu__actions">
              <button
                type="button"
                className="muwas-mobile-menu__link muwas-mobile-menu__button"
                onClick={onToggleTheme}
                aria-pressed={isLightTheme}
              >
                {isLightTheme ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </button>

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
