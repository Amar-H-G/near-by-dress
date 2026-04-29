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
export const getSellerProducts = (params) => API.get('/seller/products', { params });
export const addSellerProduct = (formData) => 
  API.post('/seller/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateSellerProduct = (id, formData) => 
  API.put(`/seller/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteSellerProduct = (id) => API.delete(`/seller/products/${id}`);
