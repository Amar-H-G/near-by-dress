/**
 * Used by: user, seller (public/seller layout)
 * Purpose: Main navigation bar
 */
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../core/auth/useAuth';
import { useSettings } from '../../core/contexts/useSettings';

const navLinks = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Products', to: '/products', icon: ShoppingBag },
  { label: 'Shops', to: '/shops', icon: Store },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { settings, categories } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const catDropRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
      setDropdownOpen(false);
      setCatDropdownOpen(false);
    });
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      if (catDropRef.current && !catDropRef.current.contains(e.target)) setCatDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  const queryParams = new URLSearchParams(location.search);
  const selectedCategoryId = queryParams.get('category');
  const selectedCategory = categories?.find((category) => category._id === selectedCategoryId);
  const rootCategories = categories?.filter((category) => !category.parentId) || [];
  const isDetailRoute = /^\/products\/[^/]+/.test(location.pathname) || /^\/shops\/[^/]+/.test(location.pathname);

  return (
    <>
      <nav className={`marketplace-nav ${scrolled ? 'marketplace-nav-scrolled' : ''} ${mobileOpen ? 'marketplace-nav-open' : ''}`} id="navbar">
        <div className="container marketplace-nav-inner">
          <Link to="/" className="marketplace-brand" aria-label={settings?.siteName || 'NearByDress'}>
            <span className="marketplace-brand-mark">
              {settings?.logo ? <img src={settings.logo} alt={settings.siteName} /> : <ShoppingBag size={21} />}
            </span>
            <span>
              <span className="marketplace-brand-name">{settings?.siteName || 'NearByDress'}</span>
              <span className="marketplace-brand-sub">Fashion marketplace</span>
            </span>
          </Link>

          <div className="marketplace-nav-links">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={`marketplace-nav-link ${isActive(link.to) ? 'marketplace-nav-link-active' : ''}`}>
                {link.label}
              </Link>
            ))}

            {categories?.length > 0 && (
              <div className="marketplace-category-menu" ref={catDropRef}>
                <button
                  type="button"
                  className="marketplace-nav-menu-btn"
                  onClick={() => setCatDropdownOpen((open) => !open)}
                >
                  {selectedCategory?.name || 'Categories'}
                  <ChevronDown size={14} className={catDropdownOpen ? 'rotate-180' : ''} />
                </button>

                {catDropdownOpen && (
                  <div className="marketplace-dropdown marketplace-dropdown-left">
                    <Link to="/products" className="marketplace-dropdown-heading" onClick={() => setCatDropdownOpen(false)}>
                      All categories
                    </Link>
                    {rootCategories.map((root) => (
                      <div key={root._id}>
                        <Link
                          to={`/products?category=${root._id}`}
                          className="marketplace-dropdown-item"
                          onClick={() => setCatDropdownOpen(false)}
                        >
                          {root.name}
                        </Link>
                        {categories
                          .filter((sub) => {
                            const parentId = sub.parentId ? (typeof sub.parentId === 'object' ? sub.parentId._id : sub.parentId) : null;
                            return parentId === root._id;
                          })
                          .map((sub) => (
                            <Link
                              key={sub._id}
                              to={`/products?category=${sub._id}`}
                              className="marketplace-dropdown-item marketplace-dropdown-child"
                              onClick={() => setCatDropdownOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="marketplace-nav-actions">
            <Link to="/products" className="marketplace-icon-btn" aria-label="Search products" title="Search">
              <Search size={18} />
            </Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="marketplace-nav-link">Login</Link>
                <Link to="/register" className="luxury-btn luxury-btn-primary">Get Started</Link>
              </>
            ) : (
              <div className="marketplace-user-menu" ref={dropRef}>
                <button
                  type="button"
                  className="marketplace-nav-menu-btn"
                  onClick={() => setDropdownOpen((open) => !open)}
                  id="user-menu-btn"
                >
                  <span className="marketplace-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                  <span className="marketplace-user-name">{user?.name}</span>
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div className="marketplace-dropdown marketplace-dropdown-right">
                    {user?.role === 'shop_owner' && (
                      <Link to="/seller/dashboard" className="marketplace-dropdown-item">
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="marketplace-dropdown-item">
                        <Shield size={16} />
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" className="marketplace-dropdown-item">
                      <User size={16} />
                      Profile
                    </Link>
                    <button type="button" onClick={handleLogout} className="marketplace-dropdown-item marketplace-danger" id="logout-btn">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="marketplace-icon-btn marketplace-mobile-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="marketplace-mobile-panel">
            <div className="container">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="marketplace-mobile-link">
                  {link.label}
                  <link.icon size={17} />
                </Link>
              ))}
              {rootCategories.slice(0, 6).map((category) => (
                <Link key={category._id} to={`/products?category=${category._id}`} className="marketplace-mobile-link">
                  {category.name}
                </Link>
              ))}

              {!isAuthenticated ? (
                <div className="marketplace-mobile-actions">
                  <Link to="/login" className="luxury-btn luxury-btn-secondary">Login</Link>
                  <Link to="/register" className="luxury-btn luxury-btn-primary">Register</Link>
                </div>
              ) : (
                <div className="marketplace-mobile-actions marketplace-mobile-actions-auth">
                  {user?.role === 'shop_owner' && <Link to="/seller/dashboard" className="luxury-btn luxury-btn-secondary">Dashboard</Link>}
                  {user?.role === 'admin' && <Link to="/admin" className="luxury-btn luxury-btn-secondary">Admin</Link>}
                  <Link to="/profile" className="luxury-btn luxury-btn-secondary">Profile</Link>
                  <button type="button" onClick={handleLogout} className="luxury-btn luxury-btn-primary">Logout</button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {!isDetailRoute && (
        <div className="marketplace-bottom-nav" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={isActive(link.to) ? 'active' : ''}>
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
          <Link to={isAuthenticated ? '/profile' : '/login'} className={isActive('/profile') || isActive('/login') ? 'active' : ''}>
            <User size={18} />
            <span>{isAuthenticated ? 'Profile' : 'Login'}</span>
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
