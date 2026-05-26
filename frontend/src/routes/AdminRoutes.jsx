import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../core/router/ProtectedRoute';

const AdminLayout = lazy(() => import('../admin/components/layout/AdminLayout'));
const Dashboard = lazy(() => import('../admin/pages/Dashboard'));
const Users = lazy(() => import('../admin/pages/Users'));
const Sellers = lazy(() => import('../admin/pages/Sellers'));
const Shops = lazy(() => import('../admin/pages/Shops'));
const Products = lazy(() => import('../admin/pages/Products'));
const Settings = lazy(() => import('../admin/pages/Settings'));
const Categories = lazy(() => import('../admin/pages/Categories'));
const Filters = lazy(() => import('../admin/pages/Filters'));
const AdminAddShop = lazy(() => import('../admin/pages/AdminAddShop'));
const AdminShopEdit = lazy(() => import('../admin/pages/AdminShopEdit'));

const AdminRoutes = () => (
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
            <Route path="shops/add" element={<AdminAddShop />} />
            <Route path="shops/edit/:id" element={<AdminShopEdit />} />
            <Route path="products" element={<Products />} />
            <Route path="settings" element={<Settings />} />
            <Route path="categories" element={<Categories />} />
            <Route path="filters" element={<Filters />} />
        </Route>
    </Routes>
);

export default AdminRoutes;
