import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../core/router/ProtectedRoute';

const SellerLayout = lazy(() => import('../seller/components/SellerLayout'));
const ShopDashboardPage = lazy(() => import('../seller/pages/ShopDashboardPage'));
const Products = lazy(() => import('../seller/pages/Products'));
const AddProduct = lazy(() => import('../seller/pages/AddProduct'));
const EditProduct = lazy(() => import('../seller/pages/EditProduct'));
const Profile = lazy(() => import('../seller/pages/Profile'));

const SellerRoutes = () => (
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

export default SellerRoutes;
