/**
 * Used by: user, seller (public/seller layout)
 * Purpose: Main navigation bar
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/useAuth';
import { useSettings } from '../../core/contexts/useSettings';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, Shield, ChevronDown } from 'lucide-react';

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      if (catDropRef.current && !catDropRef.current.contains(e.target)) setCatDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Products', to: '/products' },
    { label: 'Shops', to: '/shops' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      id="navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {settings?.logo ? (
            <img src={settings.logo} alt={settings.siteName} style={{ height: 36, width: 'auto', borderRadius: 8 }} />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={20} color="#fff" />
            </div>
          )}
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
            {settings?.siteName || 'NearByDress'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: location.pathname === link.to ? 'var(--primary-dark)' : 'var(--text-muted)',
                background: location.pathname === link.to ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
          {/* Categories Dropdown (Hierarchical) */}
          {categories?.length > 0 && (() => {
            const queryParams = new URLSearchParams(location.search);
            const selectedCategoryId = queryParams.get('category');
            const selectedCategory = categories.find(c => c._id === selectedCategoryId);
            const dropdownLabel = selectedCategory ? selectedCategory.name : 'Categories';

            return (
              <div style={{ position: 'relative' }} className="nav-dropdown-container" ref={catDropRef}>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: 14, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 4,
                    color: selectedCategory ? 'var(--primary)' : 'inherit',
                    fontWeight: selectedCategory ? 700 : 500
                  }}
                >
                  {dropdownLabel} <ChevronDown size={14} style={{ transform: catDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>
                    {catDropdownOpen && (
                  <div className="nav-dropdown glass-strong" style={{ 
                    position: 'absolute', top: '100%', left: 0, minWidth: 220, 
                    padding: '12px 8px', borderRadius: 16, display: 'block', 
                    boxShadow: 'var(--shadow-card)', zIndex: 100,
                    animation: 'fadeUp 0.15s ease'
                  }}>
                    <Link 
                      to="/products" 
                      onClick={() => setCatDropdownOpen(false)}
                      style={{ 
                        display: 'block', padding: '10px 14px', color: 'var(--primary)', 
                        textDecoration: 'none', borderRadius: 8, fontSize: 14, 
                        fontWeight: 700, borderBottom: '1px solid var(--border)',
                        marginBottom: 8
                      }}
                    >
                      All Categories
                    </Link>
                    {categories.filter(c => !c.parentId).map(root => (
                      <div key={root._id} style={{ marginBottom: 4 }}>
                        <Link 
                          to={`/products?category=${root._id}`} 
                          onClick={() => setCatDropdownOpen(false)}
                          style={{ display: 'block', padding: '8px 14px', color: 'var(--text)', textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
                        >
                          {root.name}
                        </Link>
                        {/* Render subcategories */}
                        {categories.filter(sub => {
                          const pId = sub.parentId ? (typeof sub.parentId === 'object' ? sub.parentId._id : sub.parentId) : null;
                          return pId === root._id;
                        }).map(sub => (
                          <Link 
                            key={sub._id} 
                            to={`/products?category=${sub._id}`} 
                            onClick={() => setCatDropdownOpen(false)}
                            style={{ display: 'block', padding: '6px 14px 6px 28px', color: 'var(--text-muted)', textDecoration: 'none', borderRadius: 8, fontSize: 13 }}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden md:flex">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 14 }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>Get Started</Link>
            </>
          ) : (
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                className="btn btn-ghost"
                style={{ gap: 8, padding: '8px 14px' }}
                onClick={() => setDropdownOpen((v) => !v)}
                id="user-menu-btn"
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), #60A5FA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="glass-strong" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  minWidth: 200, borderRadius: 12, padding: 8, zIndex: 200,
                  animation: 'fadeUp 0.15s ease',
                }}>
                  {user?.role === 'shop_owner' && (
                    <Link to="/seller/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', fontSize: 14 }}>
                      <LayoutDashboard size={16} color="var(--primary-light)" />
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', fontSize: 14 }}>
                      <Shield size={16} color="var(--primary)" />
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', fontSize: 14 }}>
                    <User size={16} color="var(--text-muted)" />
                    Profile
                  </Link>
                  <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, width: '100%', background: 'none', border: 'none', color: '#EF4444', fontSize: 14, cursor: 'pointer' }}
                    id="logout-btn"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost md:hidden"
          style={{ padding: 8 }}
          onClick={() => setMobileOpen((v) => !v)}
          id="mobile-menu-btn"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="glass-strong md:hidden" style={{ borderTop: '1px solid var(--border)', padding: 16 }}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{ display: 'block', padding: '12px 16px', color: 'var(--text)', textDecoration: 'none', borderRadius: 8, fontWeight: 500, marginBottom: 4 }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          {!isAuthenticated ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost" style={{ flex: 1, textDecoration: 'none' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }}>Register</Link>
            </div>
          ) : (
            <div>
              {user?.role === 'shop_owner' && <Link to="/seller/dashboard" style={{ display: 'block', padding: '12px 16px', color: 'var(--text)', textDecoration: 'none' }}>Dashboard</Link>}
              {user?.role === 'admin' && <Link to="/admin" style={{ display: 'block', padding: '12px 16px', color: 'var(--text)', textDecoration: 'none' }}>Admin</Link>}
              <button onClick={handleLogout} style={{ width: '100%', marginTop: 8 }} className="btn btn-danger">Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
