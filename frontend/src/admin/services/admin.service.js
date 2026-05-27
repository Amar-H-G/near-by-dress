import API from '../../core/api/client';

// ─── Stats ────────────────────────────────────────────────────────────────────
export const adminGetStats = () => API.get('/admin/stats');

// ─── Users ───────────────────────────────────────────────────────────────────
export const adminGetUsers = (params) => API.get('/admin/users', { params });
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);

// ─── Sellers ─────────────────────────────────────────────────────────────────
export const adminGetSellers = (params) => API.get('/admin/sellers', { params });

// ─── Shops ───────────────────────────────────────────────────────────────────
export const adminGetShops = (params) => API.get('/admin/shops', { params });
export const adminGetShop = (id) => API.get(`/admin/shops/${id}`);
export const adminUpdateShop = (id, formData) => API.put(`/admin/shops/${id}`, formData);
export const adminUpdateShopStatus = (id, data) => API.patch(`/admin/shops/${id}/status`, data);
export const adminCreateShop = (formData) => API.post('/admin/shops', formData);

// ─── Products ────────────────────────────────────────────────────────────────
export const adminGetProducts = (params) => API.get('/admin/products', { params });
export const adminCreateProduct = (formData) =>
  API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteProduct = (id) => API.delete(`/products/${id}`);
export const adminToggleFeature = (id, data) => API.put(`/admin/products/${id}/feature`, data);

// ─── Settings & Categories ───────────────────────────────────────────────────
export const adminUpdateSettings = (formData) =>
  API.put('/admin/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminGetCategories = () => API.get('/admin/categories');
export const adminCreateCategory = (formData) => API.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminUpdateCategory = (id, formData) => API.put(`/admin/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const adminDeleteCategory = (id) => API.delete(`/admin/categories/${id}`);

// ─── Filters ─────────────────────────────────────────────────────────────────
export const adminGetFilters = () => API.get('/admin/filters');
export const adminCreateFilter = (data) => API.post('/admin/filters', data);
export const adminUpdateFilter = (id, data) => API.put(`/admin/filters/${id}`, data);
export const adminToggleFilter = (id) => API.patch(`/admin/filters/${id}/toggle`);
export const adminDeleteFilter = (id) => API.delete(`/admin/filters/${id}`);
export const publicGetFilters = () => API.get('/filters');
