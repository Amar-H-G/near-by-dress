import API from '../../core/api/client';

export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (formData) =>
  API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Admin
export const adminGetProducts = (params) => API.get('/admin/products', { params });
export const adminGetStats = () => API.get('/admin/stats');
export const adminGetUsers = (params) => API.get('/admin/users', { params });
