import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api/client';
import { SettingsContext } from '../contexts/settings-context';

const DEFAULT_SETTINGS = {
  siteName: 'NearByDress',
  primaryColor: '#2563EB',
  secondaryColor: '#10B981',
  contactEmail: 'support@nearbydress.com',
  contactPhone: '+91 99999 99999',
};

const applyThemeColors = (settingsData) => {
  if (settingsData.primaryColor) {
    document.documentElement.style.setProperty('--primary', settingsData.primaryColor);
  }
  if (settingsData.secondaryColor) {
    document.documentElement.style.setProperty('--accent', settingsData.secondaryColor);
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchGlobalData = async () => {
      try {
        const [settingsRes, categoriesRes, filtersRes] = await Promise.all([
          API.get('/settings'),
          API.get('/categories'),
          API.get('/filters'),
        ]);

        if (!mounted) return;
        const settingsData = settingsRes.data.data;
        setSettings(settingsData);
        setCategories(categoriesRes.data.data);
        setFilters(filtersRes.data.data || []);
        applyThemeColors(settingsData);
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to load global settings', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchGlobalData();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const { data } = await API.get('/settings');
      setSettings(data.data);
      applyThemeColors(data.data);
    } catch (err) {
      console.error('Failed to refresh settings', err);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch (err) {
      console.error('Failed to refresh categories', err);
    }
  }, []);

  const refreshFilters = useCallback(async () => {
    try {
      const { data } = await API.get('/filters');
      setFilters(data.data || []);
    } catch (err) {
      console.error('Failed to refresh filters', err);
    }
  }, []);

  const value = useMemo(
    () => ({ settings, categories, filters, refreshSettings, refreshCategories, refreshFilters }),
    [settings, categories, filters, refreshSettings, refreshCategories, refreshFilters],
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary, #2563EB)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
