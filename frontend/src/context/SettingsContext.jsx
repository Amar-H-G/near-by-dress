import { createContext, useContext, useState, useEffect } from 'react';
import API from '../shared/services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        API.get('/settings'),
        API.get('/categories')
      ]);
      
      const settingsData = settingsRes.data.data;
      setSettings(settingsData);
      setCategories(categoriesRes.data.data);

      if (settingsData.primaryColor) {
        document.documentElement.style.setProperty('--primary', settingsData.primaryColor);
      }
      if (settingsData.secondaryColor) {
        document.documentElement.style.setProperty('--accent', settingsData.secondaryColor);
      }
    } catch (error) {
      console.error('Failed to load global settings', error);
      // Provide defaults if backend fails
      setSettings({
        siteName: 'NearByDress',
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        contactEmail: 'support@nearbydress.com',
        contactPhone: '+91 99999 99999'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const refreshSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      setSettings(data.data);
      if (data.data.primaryColor) {
        document.documentElement.style.setProperty('--primary', data.data.primaryColor);
      }
      if (data.data.secondaryColor) {
        document.documentElement.style.setProperty('--accent', data.data.secondaryColor);
      }
    } catch (err) {
      console.error('Failed to refresh settings', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch (err) {
      console.error('Failed to refresh categories', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary, #2563EB)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{ settings, categories, refreshSettings, refreshCategories }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
