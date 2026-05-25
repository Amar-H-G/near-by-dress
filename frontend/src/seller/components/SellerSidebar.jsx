import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  PlusSquare, 
  Store, 
  LogOut, 
  X,
  ShoppingBag
} from 'lucide-react';

const SellerSidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Products', path: '/seller/products', icon: <Package size={18} /> },
    { label: 'Add Product', path: '/seller/add-product', icon: <PlusSquare size={18} /> },
    { label: 'Shop Profile', path: '/seller/profile', icon: <Store size={18} /> },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`admin-sidebar-overlay ${open ? 'block' : 'hidden'} lg:hidden`} 
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon" style={{ background: 'var(--success)' }}>
              <Store size={20} color="#fff" />
            </div>
            <div>
              <div className="admin-brand-name">Seller Portal</div>
              <div className="admin-brand-badge" style={{ background: '#D1FAE5', color: '#059669' }}>SHOP OWNER</div>
            </div>
          </div>
          <button className="admin-sidebar-close lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="admin-sidebar-profile-name">{user?.name}</div>
            <div className="admin-sidebar-profile-email">{user?.email}</div>
          </div>
        </div>

        <div className="admin-sidebar-divider" />

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Management</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-item-active' : ''}`}
            >
              <div className="admin-nav-icon">{item.icon}</div>
              <div className="admin-nav-label">{item.label}</div>
            </NavLink>
          ))}
          
          <div className="admin-nav-section-label" style={{ marginTop: 16 }}>Storefront</div>
          <NavLink
            to="/"
            className="admin-nav-item"
          >
            <div className="admin-nav-icon"><ShoppingBag size={18} /></div>
            <div className="admin-nav-label">Return to Marketplace</div>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;
