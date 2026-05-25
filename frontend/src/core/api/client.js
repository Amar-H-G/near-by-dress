import axios from 'axios';
import { attachAuthInterceptors } from './interceptors';

const API = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

attachAuthInterceptors(API);

export default API;
