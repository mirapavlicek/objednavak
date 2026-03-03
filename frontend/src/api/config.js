import api from './client';

export const getConfig = () => api.get('/config');
export const updateConfig = (data) => api.put('/config', data);
