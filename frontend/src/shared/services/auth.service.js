/**
 * Used by: user module (all roles use this to login/register)
 * Purpose: Authentication API calls
 */
import API from './api';

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
