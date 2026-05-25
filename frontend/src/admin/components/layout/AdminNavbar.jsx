import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/auth/useAuth';
import { Bell, LogOut, Menu, ChevronRight } from 'lucide-react';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users':     'User Management',
  '/admin/sellers':   'Seller Management',
  '/admin/shops':     'Shop Management',
  '/admin/products':  'Product Management',
};

const AdminNavbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Admin Panel';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          className="admin-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          id="admin-menu-toggle"
        >
          <Menu size={20} />
        </button>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb-root">Admin</span>
          <ChevronRight size={14} className="admin-breadcrumb-sep" />
          <span className="admin-breadcrumb-page">{title}</span>
        </div>
      </div>

      <div className="admin-navbar-right">
        <button className="admin-navbar-icon-btn" aria-label="Notifications" id="admin-notif-btn">
          <Bell size={18} />
          <span className="admin-notif-dot" />
        </button>

        <div className="admin-navbar-profile">
          <div className="admin-avatar admin-avatar-sm">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="admin-navbar-name">{user?.name}</span>
        </div>

        <button
          className="admin-navbar-logout"
          onClick={handleLogout}
          id="admin-navbar-logout"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;
