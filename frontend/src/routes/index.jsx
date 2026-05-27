import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import Navbar from '../public/components/Navbar';
import AnnouncementBar from '../public/components/AnnouncementBar';
import ProtectedRoute from '../core/router/ProtectedRoute';


const SellerRoutes = lazy(() => import('./sellerRoutes'));
const AdminRoutes = lazy(() => import('./AdminRoutes'));
const LoginPage = lazy(() => import('../public/pages/LoginPage'));
const RegisterPage = lazy(() => import('../public/pages/RegisterPage'));

// Public pages — inlined here to avoid double-Routes nesting
const HomePage = lazy(() => import('../public/pages/HomePage'));
const ProductsPage = lazy(() => import('../public/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../public/pages/ProductDetailPage'));
const ShopsPage = lazy(() => import('../public/pages/ShopsPage'));
const ShopDetailPage = lazy(() => import('../public/pages/ShopDetailPage'));
const UserProfilePage = lazy(() => import('../public/pages/UserProfilePage'));
const CMSPage = lazy(() => import('../public/pages/CMSPage'));

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '120px 24px' }}>
    <h1 style={{ fontSize: 64, marginBottom: 16 }}>404</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Page not found</p>
    <a href="/" className="btn btn-primary">Go Home</a>
  </div>
);

// Layout wrapper that includes the Navbar for public pages
const PublicLayout = ({ children }) => (
  <>
    <AnnouncementBar />
    <Navbar />
    {children}
  </>
);

const PremiumProgressBar = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
    zIndex: 99999,
    animation: 'loadingBar 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    transformOrigin: '0% 50%'
  }}>
    <style>{`
      @keyframes loadingBar {
        0% { transform: scaleX(0); }
        50% { transform: scaleX(0.7); }
        100% { transform: scaleX(1); }
      }
    `}</style>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<PremiumProgressBar />}>
    <Routes>
      {/* Auth routes — no Navbar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Seller routes — own layout handles Navbar */}
      <Route path="/seller/*" element={<SellerRoutes />} />

      {/* Admin routes — own layout handles Navbar */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Public routes — wrapped in PublicLayout for Navbar */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
      <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
      <Route path="/shops" element={<PublicLayout><ShopsPage /></PublicLayout>} />
      <Route path="/shops/:id" element={<PublicLayout><ShopDetailPage /></PublicLayout>} />
      <Route
        path="/profile"
        element={
          <PublicLayout>
            <ProtectedRoute roles={['customer', 'shop_owner', 'admin']}>
              <UserProfilePage />
            </ProtectedRoute>
          </PublicLayout>
        }
      />

      <Route path="/pages/:slug" element={<PublicLayout><CMSPage /></PublicLayout>} />

      {/* 404 fallback */}
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
