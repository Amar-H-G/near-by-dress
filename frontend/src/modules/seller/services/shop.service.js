import API from '../../../shared/services/api';

export const getShops = (params) => API.get('/shops', { params });
export const getShop = (id) => API.get(`/shops/${id}`);
export const getMyShop = () => API.get('/shops/my');
export const createShop = (formData) =>
  API.post('/shops', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateShop = (id, formData) =>
  API.put(`/shops/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getShopProducts = (shopId, params) =>
  API.get(`/shops/${shopId}/products`, { params });

// Admin
export const adminGetShops = (params) => API.get('/admin/shops', { params });
export const updateShopStatus = (id, data) => API.patch(`/admin/shops/${id}/status`, data);
