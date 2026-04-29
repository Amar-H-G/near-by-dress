import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import AdminLayout from '../modules/admin/components/layout/AdminLayout';

import Dashboard from '../modules/admin/pages/Dashboard';
import Users from '../modules/admin/pages/Users';
import Sellers from '../modules/admin/pages/Sellers';
import Shops from '../modules/admin/pages/Shops';
import Products from '../modules/admin/pages/Products';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="sellers" element={<Sellers />} />
        <Route path="shops" element={<Shops />} />
        <Route path="products" element={<Products />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
