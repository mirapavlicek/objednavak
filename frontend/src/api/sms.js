import api from './client';

export const sendSms = (data) => api.post('/sms/send', data);
