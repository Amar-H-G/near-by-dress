import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import ShopDashboardPage from '../modules/seller/pages/ShopDashboardPage';

const SellerRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['shop_owner']}>
            <ShopDashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default SellerRoutes;
