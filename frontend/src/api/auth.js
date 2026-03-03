import api from './client';

export const login = (email, pin) => api.post('/auth/login', { email, pin });
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
