import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShopsPage from './pages/ShopsPage';
import ShopDetailPage from './pages/ShopDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopDashboardPage from './pages/ShopDashboardPage';

// Admin Layout + Pages
import AdminLayout from './admin/layout/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import Sellers from './admin/pages/Sellers';
import Shops from './admin/pages/Shops';
import Products from './admin/pages/Products';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* ── Auth Pages (no Navbar) ─────────────────────────────────── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Admin Panel (fully isolated, no public Navbar) ─────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users"     element={<Users />} />
            <Route path="sellers"   element={<Sellers />} />
            <Route path="shops"     element={<Shops />} />
            <Route path="products"  element={<Products />} />
          </Route>

          {/* ── Public Site (with Navbar) ──────────────────────────────── */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/"              element={<HomePage />} />
                  <Route path="/products"      element={<ProductsPage />} />
                  <Route path="/products/:id"  element={<ProductDetailPage />} />
                  <Route path="/shops"         element={<ShopsPage />} />
                  <Route path="/shops/:id"     element={<ShopDetailPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute roles={['shop_owner']}>
                        <ShopDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <div style={{ paddingTop: 80, textAlign: 'center', padding: '120px 24px' }}>
                        <h1 style={{ fontSize: 64, marginBottom: 16 }}>404</h1>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Page not found</p>
                        <a href="/" className="btn btn-primary">Go Home</a>
                      </div>
                    }
                  />
                </Routes>
              </>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
