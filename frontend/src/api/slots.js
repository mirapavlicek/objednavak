import api from './client';

export const getAvailableSlots = (params) => api.get('/slots/available', { params });
