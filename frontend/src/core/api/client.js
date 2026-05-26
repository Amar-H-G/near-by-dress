import axios from 'axios';
import { attachAuthInterceptors } from './interceptors';

// Local dev: uses Vite proxy (/api → localhost:5000)
// Production (Render): set VITE_API_URL=https://near-by-dress.onrender.com/api
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

attachAuthInterceptors(API);

export default API;
