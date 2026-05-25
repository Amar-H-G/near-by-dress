import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../auth/AuthProvider';
import { SettingsProvider } from './SettingsProvider';

export const AppProviders = ({ children }) => (
  <SettingsProvider>
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
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      {children}
    </AuthProvider>
  </SettingsProvider>
);
