import API from './api';

// ─── Stats ────────────────────────────────────────────────────────────────────
export const adminGetStats = () => API.get('/admin/stats');

// ─── Users ───────────────────────────────────────────────────────────────────
export const adminGetUsers = (params) => API.get('/admin/users', { params });
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);

// ─── Sellers ─────────────────────────────────────────────────────────────────
export const adminGetSellers = (params) => API.get('/admin/sellers', { params });

// ─── Shops ───────────────────────────────────────────────────────────────────
export const adminGetShops = (params) => API.get('/admin/shops', { params });
export const adminUpdateShopStatus = (id, data) => API.patch(`/admin/shops/${id}/status`, data);

// ─── Products ────────────────────────────────────────────────────────────────
export const adminGetProducts = (params) => API.get('/admin/products', { params });
export const adminCreateProduct = (formData) =>
  API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteProduct = (id) => API.delete(`/products/${id}`);
