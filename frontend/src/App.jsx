import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './shared/components/Navbar';

// Modular Routes
import UserRoutes from './routes/UserRoutes';
import SellerRoutes from './routes/SellerRoutes';
import AdminRoutes from './routes/AdminRoutes';

// Auth Pages (User module)
import LoginPage from './modules/user/pages/LoginPage';
import RegisterPage from './modules/user/pages/RegisterPage';

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Admin Panel (fully isolated, no public Navbar) ─────────── */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* ── Public Site & Seller Dashboard (with Navbar) ───────────── */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/*" element={<UserRoutes />} />
                  <Route path="/seller/*" element={<SellerRoutes />} />
                  
                  {/* 404 Fallback */}
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
