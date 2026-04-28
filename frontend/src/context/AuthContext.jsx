import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginAPI, register as registerAPI, getMe } from '../services/auth.service';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nbd_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('nbd_token');
    if (!token) { setLoading(false); return; }

    getMe()
      .then(({ data }) => {
        setUser(data.data.user);
        localStorage.setItem('nbd_user', JSON.stringify(data.data.user));
      })
      .catch(() => {
        localStorage.removeItem('nbd_token');
        localStorage.removeItem('nbd_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await loginAPI(credentials);
    const { user: u, token } = data.data;
    localStorage.setItem('nbd_token', token);
    localStorage.setItem('nbd_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await registerAPI(formData);
    const { user: u, token } = data.data;
    localStorage.setItem('nbd_token', token);
    localStorage.setItem('nbd_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nbd_token');
    localStorage.removeItem('nbd_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
