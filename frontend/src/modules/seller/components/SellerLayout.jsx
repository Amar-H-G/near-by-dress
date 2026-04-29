import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSellerProfile } from '../hooks/useSellerProfile';

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useSellerProfile();

  // Enforce profile completion
  useEffect(() => {
    if (!loading && !profile && location.pathname !== '/seller/profile') {
      navigate('/seller/profile');
    }
  }, [profile, loading, location.pathname, navigate]);

  return (
    <div className="admin-shell">
      <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="admin-main">
        <header className="admin-navbar">
          <div className="admin-navbar-left">
            <button className="admin-menu-toggle lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="admin-breadcrumb hidden sm:flex">
              <span className="admin-breadcrumb-root">Seller Portal</span>
              <span className="admin-breadcrumb-sep">/</span>
              <span className="admin-breadcrumb-page capitalize">
                {location.pathname.split('/').pop().replace('-', ' ')}
              </span>
            </div>
          </div>
          <div className="admin-navbar-right">
            <button className="admin-navbar-icon-btn">
              <Bell size={18} />
              <span className="admin-notif-dot" />
            </button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet context={{ profile }} />
        </div>
      </main>
    </div>
  );
};

export default SellerLayout;
