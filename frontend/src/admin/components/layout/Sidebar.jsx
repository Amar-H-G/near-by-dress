import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/useAuth';
import {
  LayoutDashboard, Users, Store, ShoppingBag, Package, LogOut, X, ChevronRight, Settings as SettingsIcon, Tags, Filter
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/users',     icon: <Users size={18} />,           label: 'Users' },
  { to: '/admin/sellers',   icon: <ShoppingBag size={18} />,     label: 'Sellers' },
  { to: '/admin/shops',     icon: <Store size={18} />,           label: 'Shops' },
  { to: '/admin/products',  icon: <Package size={18} />,         label: 'Products' },
  { to: '/admin/categories',icon: <Tags size={18} />,            label: 'Categories' },
  { to: '/admin/filters',   icon: <Filter size={18} />,          label: 'Filters' },
  { to: '/admin/settings',  icon: <SettingsIcon size={18} />,    label: 'Settings' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${open ? 'admin-sidebar-open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon">
              <span>N</span>
            </div>
            <div>
              <p className="admin-brand-name">NearByDress</p>
              <span className="admin-brand-badge">Admin Panel</span>
            </div>
          </div>
          <button className="admin-sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        {/* Admin profile */}
        <div className="admin-sidebar-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="admin-sidebar-profile-info">
            <p className="admin-sidebar-profile-name">{user?.name || 'Admin'}</p>
            <p className="admin-sidebar-profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="admin-sidebar-divider" />

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          <p className="admin-nav-section-label">MAIN MENU</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'admin-nav-item-active' : ''}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
              <ChevronRight size={14} className="admin-nav-chevron" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout} id="admin-sidebar-logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
