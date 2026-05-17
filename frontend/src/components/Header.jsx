import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogIn,
  Phone,
  Search,
  ShoppingCart,
  User,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { showSuccessToast } from '../utils/toast';
const brandLogo = '/images/logo-muwas.jpg';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Products' },
  { path: '/story', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const { user, logout, isAuthenticated, api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = React.useRef(0);
  const hasLoadedNotificationsRef = React.useRef(false);
  const notificationsEnabledRef = React.useRef(true);
  const notificationsRequestInFlightRef = React.useRef(false);
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

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!isAuthenticated || !notificationsEnabledRef.current || notificationsRequestInFlightRef.current) {
      return;
    }

    notificationsRequestInFlightRef.current = true;

    try {
      if (!silent) {
        setNotificationsLoading(true);
      }
      const response = await api.get('/notifications?limit=10');
      const nextNotifications = Array.isArray(response.data?.notifications) ? response.data.notifications : [];
      const nextUnreadCount = Number(response.data?.unreadCount);
      const previousUnread = unreadCountRef.current;
      const nextUnread = Number.isFinite(nextUnreadCount)
        ? Math.max(0, nextUnreadCount)
        : nextNotifications.filter((entry) => !entry.isRead).length;

      if (hasLoadedNotificationsRef.current && nextUnread > previousUnread) {
        showSuccessToast('You have new notifications');
      }

      unreadCountRef.current = nextUnread;
      hasLoadedNotificationsRef.current = true;
      setNotifications(nextNotifications);
      setUnreadCount(nextUnread);
    } catch (error) {
      const statusCode = Number(error?.response?.status || 0);
      if (statusCode === 404 || statusCode >= 500) {
        notificationsEnabledRef.current = false;
        setNotificationsEnabled(false);
      }
      setNotifications([]);
      setUnreadCount(0);
      unreadCountRef.current = 0;
    } finally {
      notificationsRequestInFlightRef.current = false;
      if (!silent) {
        setNotificationsLoading(false);
      }
    }
  };

  React.useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  React.useEffect(() => {
    if (!notificationsEnabled) {
      return;
    }
    fetchNotifications({ silent: false });
  }, [isAuthenticated, notificationsEnabled]);

  React.useEffect(() => {
    if (!isAuthenticated || !notificationsEnabled) {
      return undefined;
    }

    const refreshTimer = window.setInterval(() => {
      fetchNotifications({ silent: true });
    }, 20000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [isAuthenticated, notificationsEnabled]);

  const handleOpenNotifications = async () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);

    if (nextOpen && notificationsEnabledRef.current) {
      await fetchNotifications({ silent: false });
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((entry) =>
          entry._id === notificationId ? { ...entry, isRead: true } : entry
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      unreadCountRef.current = Math.max(0, unreadCountRef.current - 1);
    } catch {
      // Ignore silent failure and keep current state.
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      try {
        await api.patch('/notifications/read-all');
      } catch (error) {
        if (error?.response?.status === 405) {
          await api.post('/notifications/read-all');
        } else {
          throw error;
        }
      }
      setNotifications((current) => current.map((entry) => ({ ...entry, isRead: true })));
      setUnreadCount(0);
      unreadCountRef.current = 0;
    } catch {
      // Ignore silent failure and keep current state.
    }
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
          <div className="muwas-header__mobile-quick-actions">
            {isAuthenticated && (
              <div className="muwas-notifications">
                <button
                  type="button"
                  className="muwas-header__circle-action"
                  onClick={handleOpenNotifications}
                  aria-label="Notifications"
                >
                  <Bell size={18} strokeWidth={1.9} />
                  {unreadCount > 0 && <em className="muwas-notifications__count">{unreadCount}</em>}
                </button>
                {isNotificationsOpen && notificationsEnabled && (
                  <div className="muwas-notifications__menu">
                    <div className="muwas-notifications__header">
                      <strong>Notifications</strong>
                      <button type="button" onClick={markAllNotificationsRead}>
                        Mark all read
                      </button>
                    </div>
                    {notificationsLoading && notifications.length === 0 ? (
                      <p className="muwas-notifications__empty">Loading...</p>
                    ) : !notificationsEnabled ? (
                      <p className="muwas-notifications__empty">Notifications are not enabled yet.</p>
                    ) : notifications.length === 0 ? (
                      <p className="muwas-notifications__empty">No notifications yet.</p>
                    ) : (
                      <div className="muwas-notifications__list">
                        {notifications.map((entry) => (
                          <button
                            key={entry._id}
                            type="button"
                            className={`muwas-notifications__item ${entry.isRead ? '' : 'is-unread'}`}
                            onClick={() => markNotificationRead(entry._id)}
                          >
                            <strong>{entry.title}</strong>
                            <span>{entry.message}</span>
                            <small className="muwas-notifications__source">
                              From {entry?.metadata?.sourceLabel || 'Muwas Admin'}
                            </small>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                className="muwas-header__circle-action"
                aria-label="Open profile"
                title="Open profile"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="muwas-header__circle-avatar"
                  />
                ) : (
                  <UserRound size={18} strokeWidth={1.9} />
                )}
              </Link>
            )}
            <a
              href="/business-card"
              className="muwas-header__circle-action"
              aria-label="Open business card"
              title="Open business card"
            >
              <Phone size={18} strokeWidth={1.9} />
            </a>
          </div>

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
            <Link to="/cart" className="muwas-header__cart-chip" aria-label="Cart">
              <ShoppingCart size={20} strokeWidth={1.9} />
              <span>Cart</span>
              {cartCount > 0 && <strong>{cartCount}</strong>}
            </Link>
            <Link
              to="/business-card"
              className="muwas-header__circle-action"
              aria-label="Open business card"
              title="Open business card"
            >
              <Phone size={19} strokeWidth={1.9} />
            </Link>

            {isAuthenticated ? (
              <>
                <div className="muwas-notifications">
                  <button
                    type="button"
                    className="muwas-header__circle-action"
                    onClick={handleOpenNotifications}
                    aria-label="Notifications"
                  >
                    <Bell size={19} strokeWidth={1.9} />
                    {unreadCount > 0 && <em className="muwas-notifications__count">{unreadCount}</em>}
                  </button>

                  {isNotificationsOpen && notificationsEnabled && (
                    <div className="muwas-notifications__menu">
                      <div className="muwas-notifications__header">
                        <strong>Notifications</strong>
                        <button type="button" onClick={markAllNotificationsRead}>
                          Mark all read
                        </button>
                      </div>
                      {notificationsLoading && notifications.length === 0 ? (
                        <p className="muwas-notifications__empty">Loading...</p>
                      ) : !notificationsEnabled ? (
                        <p className="muwas-notifications__empty">Notifications are not enabled yet.</p>
                      ) : notifications.length === 0 ? (
                        <p className="muwas-notifications__empty">No notifications yet.</p>
                      ) : (
                        <div className="muwas-notifications__list">
                          {notifications.map((entry) => (
                            <button
                              key={entry._id}
                              type="button"
                              className={`muwas-notifications__item ${entry.isRead ? '' : 'is-unread'}`}
                              onClick={() => markNotificationRead(entry._id)}
                            >
                              <strong>{entry.title}</strong>
                              <span>{entry.message}</span>
                              <small className="muwas-notifications__source">
                                From {entry?.metadata?.sourceLabel || 'Muwas Admin'}
                              </small>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
              </>
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
