import api from './client';

export const getCalendar = (params) => api.get('/calendar', { params });
