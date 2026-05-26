import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import Navbar from '../public/components/Navbar';

const PublicRoutes = lazy(() => import('./publicRoutes'));
const SellerRoutes = lazy(() => import('./sellerRoutes'));
const AdminRoutes = lazy(() => import('./AdminRoutes'));
const LoginPage = lazy(() => import('../public/pages/LoginPage'));
const RegisterPage = lazy(() => import('../public/pages/RegisterPage'));

const NotFound = () => (
  <div style={{ paddingTop: 80, textAlign: 'center', padding: '120px 24px' }}>
    <h1 style={{ fontSize: 64, marginBottom: 16 }}>404</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Page not found</p>
    <a href="/" className="btn btn-primary">Go Home</a>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/seller/*" element={<SellerRoutes />} />
      <Route
        path="*"
        element={
          <>
            <Navbar />
            <Routes>
              <Route path="/*" element={<PublicRoutes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        }
      />
    </Routes>
  </Suspense>
);

export default AppRoutes;
