/**
 * Used by: admin, user, seller (all roles)
 * Purpose: centralized Axios instance with auth interceptors
 */
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Attach token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nbd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — force logout
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nbd_token');
      localStorage.removeItem('nbd_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
