import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../../../shared/components/ProtectedRoute';

// Layout & Components
import SellerLayout from '../components/SellerLayout';

// Pages
import ShopDashboardPage from '../pages/ShopDashboardPage';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import EditProduct from '../pages/EditProduct';
import Profile from '../pages/Profile';

const SellerRoutes = () => {
  return (
    <Routes>
      <Route 
        path="*" 
        element={
          <ProtectedRoute roles={['shop_owner']}>
            <SellerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ShopDashboardPage />} />
        <Route path="products" element={<Products />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default SellerRoutes;
