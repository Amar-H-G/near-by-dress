import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../auth/AuthProvider';
import { SettingsProvider } from './SettingsProvider';
import { LocationProvider } from './LocationProvider';
import { OrderFlowProvider } from '../../shared/order/OrderFlowProvider';
import LocationPopup from '../../public/components/LocationPopup';
import { SmoothScroll } from '../../shared/animations/smoothScroll';

export const AppProviders = ({ children }) => (
  <SettingsProvider>
    <AuthProvider>
      <LocationProvider>
        <OrderFlowProvider>
          <SmoothScroll>
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
          {/* Global location permission popup — renders on all public pages */}
          <LocationPopup />
          </SmoothScroll>
        </OrderFlowProvider>
      </LocationProvider>
    </AuthProvider>
  </SettingsProvider>
);

