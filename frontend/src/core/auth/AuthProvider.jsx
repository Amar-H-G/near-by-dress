import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './auth-context';
import { getMe, login as loginAPI, register as registerAPI, updateProfile } from './auth.service';

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem('nbd_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('nbd_token')));

  useEffect(() => {
    const token = localStorage.getItem('nbd_token');
    if (!token) return;

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

  const updateUser = useCallback(async (formData) => {
    const { data } = await updateProfile(formData);
    const updatedUser = data.data.user;
    localStorage.setItem('nbd_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success('Profile updated successfully');
    return updatedUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nbd_token');
    localStorage.removeItem('nbd_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, updateUser, logout, isAuthenticated: !!user }),
    [user, loading, login, register, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
