import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api/client';
import { SettingsContext } from '../contexts/settings-context';
import NBDLogo from '../../shared/components/NBDLogo';
import { BRAND } from '../../shared/config/branding';
import { CONTACT } from '../../shared/config/contact';

const DEFAULT_SETTINGS = {
  siteName: BRAND.full,
  primaryColor: '#7c3aed',
  secondaryColor: '#10B981',
  contactEmail: CONTACT.email,
  contactPhone: '',
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#ffffff',
        gap: '24px'
      }}>
        {/* Cinematic Luxury Brand Reveal */}
        <div style={{ animation: 'pulseLogo 2.5s infinite ease-in-out' }}>
          <NBDLogo variant="loading" noLink />
        </div>
        
        {/* Minimal Luxury Loading Indicator */}
        <div style={{
          width: '28px',
          height: '28px',
          border: '1.5px solid rgba(0, 0, 0, 0.06)',
          borderTopColor: '#000000',
          borderRadius: '50%',
          animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }} />
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseLogo {
            0%, 100% { opacity: 0.8; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
