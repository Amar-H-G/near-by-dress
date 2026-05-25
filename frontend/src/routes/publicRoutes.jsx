import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../core/router/ProtectedRoute';

const HomePage = lazy(() => import('../public/pages/HomePage'));
const ProductsPage = lazy(() => import('../public/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../public/pages/ProductDetailPage'));
const ShopsPage = lazy(() => import('../public/pages/ShopsPage'));
const ShopDetailPage = lazy(() => import('../public/pages/ShopDetailPage'));
const UserProfilePage = lazy(() => import('../public/pages/UserProfilePage'));

const PublicRoutes = () => (
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

export default PublicRoutes;
