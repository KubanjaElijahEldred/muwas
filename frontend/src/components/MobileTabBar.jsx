import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, LayoutDashboard, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const MobileTabBar = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const accountTab = user?.role === 'admin'
    ? { to: '/admin', label: 'Admin', icon: LayoutDashboard }
    : isAuthenticated
      ? { to: '/profile', label: 'Profile', icon: UserRound }
      : { to: '/login', label: 'Login', icon: UserRound };

  const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Shop', icon: ShoppingBag },
    { to: '/story', label: 'Story', icon: BookOpen },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, count: cartCount },
    accountTab,
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="muwas-mobile-tabs" aria-label="Mobile screen tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`muwas-mobile-tabs__item ${isActive(tab.to) ? 'is-active' : ''}`}
        >
          <span className="muwas-mobile-tabs__icon">
            {tab.to === accountTab.to && user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="muwas-mobile-tabs__avatar"
              />
            ) : (
              React.createElement(tab.icon, { size: 20, strokeWidth: 1.9 })
            )}
            {tab.count > 0 && <strong>{tab.count}</strong>}
          </span>
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileTabBar;
