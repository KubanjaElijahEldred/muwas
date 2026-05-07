import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShoppingCart,
  User,
  UserRound,
  X,
  Zap,
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
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
    setIsMenuOpen(false);
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
              <span className="muwas-brand__title">Muwas Shop</span>
              <span className="muwas-brand__subtitle">Local spirits store</span>
            </span>
          </Link>

          <form className="muwas-header__search-form" onSubmit={handleSearch}>
            <Search size={19} strokeWidth={1.9} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search for gin, whiskey, liqueurs, and more..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <div className="muwas-header__actions">
            <Link to="/contact" className="muwas-header__quick-link">
              <Zap size={16} strokeWidth={2} />
              <span>Quick delivery</span>
            </Link>

            <Link to="/products" className="muwas-header__shop-button">
              Shop now
            </Link>

            <Link to="/cart" className="muwas-header__circle-action" aria-label="Cart">
              <ShoppingCart size={20} strokeWidth={1.8} />
              {cartCount > 0 && <strong>{cartCount}</strong>}
            </Link>

            <Link to="/contact" className="muwas-header__circle-action" aria-label="Messages">
              <MessageCircle size={19} strokeWidth={1.8} />
            </Link>

            <Link to={wholesalePath} className="muwas-header__circle-action" aria-label="Wholesale portal">
              <Moon size={18} strokeWidth={1.8} />
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
              <Link to="/login" className="muwas-header__account-chip">
                <span className="muwas-account__avatar">
                  <UserRound size={22} strokeWidth={1.8} />
                </span>
                <span className="muwas-header__account-copy">
                  <strong>Login</strong>
                  <small>User</small>
                </span>
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

        {isMenuOpen && (
          <div className="muwas-mobile-menu">
            <form className="muwas-header__search-form muwas-header__search-form--mobile" onSubmit={handleSearch}>
              <Search size={18} strokeWidth={1.9} aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
              />
              <button type="submit">Search</button>
            </form>

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
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="muwas-mobile-menu__link">
                    Create account
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
