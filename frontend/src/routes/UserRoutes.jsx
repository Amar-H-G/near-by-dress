import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import HomePage from '../modules/user/pages/HomePage';
import ProductsPage from '../modules/user/pages/ProductsPage';
import ProductDetailPage from '../modules/user/pages/ProductDetailPage';
import ShopsPage from '../modules/user/pages/ShopsPage';
import ShopDetailPage from '../modules/user/pages/ShopDetailPage';
import UserProfilePage from '../modules/user/pages/UserProfilePage';

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/shops" element={<ShopsPage />} />
      <Route path="/shops/:id" element={<ShopDetailPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={['customer', 'shop_owner', 'admin']}>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default UserRoutes;
