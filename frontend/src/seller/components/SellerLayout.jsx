import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import OnboardingModal from './OnboardingModal';
import { Menu, Bell, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../core/auth/useAuth';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { updateSellerProfile } from '../services/sellerApi';
import toast from 'react-hot-toast';

const SellerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const location = useLocation();
  const { profile, loading, refresh } = useSellerProfile();

  // Show onboarding modal if no profile exists
  useEffect(() => {
    const hasDismissed = sessionStorage.getItem('onboarding_dismissed');
    queueMicrotask(() => {
      if (!loading && !profile && !hasDismissed) {
        setShowOnboarding(true);
      }
    });
  }, [profile, loading]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('onboarding_dismissed', 'true');
  };

  const handleSaveProfile = async (formData, logoFile) => {
    setIsSubmitting(true);
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !(value instanceof File)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      }
    });
    if (logoFile) submitData.append('logo', logoFile);

    try {
      await updateSellerProfile(submitData);
      toast.success('Shop profile created successfully!');
      setShowOnboarding(false);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shop details');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {profile?.status === 'pending' && (
            <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 12, padding: '12px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, color: '#9A3412' }}>
              <Clock size={20} color="#F97316" />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700 }}>Shop Under Review</h4>
                <p style={{ fontSize: 12, opacity: 0.9 }}>Your shop is currently pending approval. It will be visible to customers once an admin approves it.</p>
              </div>
            </div>
          )}

          {profile?.status === 'rejected' && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14, color: '#991B1B' }}>
              <div style={{ marginTop: 2 }}>
                <XCircle size={20} color="#EF4444" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700 }}>Shop Rejected</h4>
                <p style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>Reason: <span style={{ fontWeight: 400 }}>{profile.rejectionReason || 'No reason provided.'}</span></p>
                <p style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>Please update your shop details and contact support to re-apply.</p>
              </div>
            </div>
          )}

          <Outlet context={{ profile }} />
        </div>
      </main>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={handleCloseOnboarding}
        onSave={handleSaveProfile}
        loading={isSubmitting}
        initialData={{ whatsappNumber: user?.phone || '' }}
      />
    </div>
  );
};

export default SellerLayout;
