import API from '../../../shared/services/api';

// Dashboard Stats
export const getSellerDashboardStats = () => API.get('/seller/dashboard');

// Profile
export const getSellerProfile = () => API.get('/seller/profile');
export const updateSellerProfile = (formData) => 
  API.put('/seller/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Products
export const getSellerProducts = (params) => API.get('/seller/products', { params }); // Keep this for listing seller products if backend has it, or update if needed.
// Actually, the user wants both to use /api/products.
// If /api/products returns filtered products for seller when authenticated, then we should use it.
// However, typically /api/products is public list.
// Let's see what /api/seller/products does.

export const addSellerProduct = (formData) => 
  API.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateSellerProduct = (id, formData) => 
  API.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteSellerProduct = (id) => API.delete(`/products/${id}`);
