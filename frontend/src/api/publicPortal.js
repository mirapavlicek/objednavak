import axios from 'axios';

// Separate axios instance for public portal — uses its own token
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

publicApi.interceptors.request.use(config => {
  const token = localStorage.getItem('vetbook_public_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Send language preference for backend i18n
  const lang = localStorage.getItem('vetbook_lang') || 'cs';
  config.headers['Accept-Language'] = lang;
  return config;
});

export const publicRegister = (data) => publicApi.post('/public/register', data);
export const publicLogin = (email, password) => publicApi.post('/public/login', { email, password });
export const getMyPets = () => publicApi.get('/public/my-pets');
export const getMyAppointments = () => publicApi.get('/public/my-appointments');
export const submitBookingRequest = (data) => publicApi.post('/public/booking-request', data);
export const getPublicSlots = (params) => publicApi.get('/public/available-slots', { params });
export const getPublicProcedures = () => publicApi.get('/public/procedures');
export const getPublicDoctors = () => publicApi.get('/public/doctors');

// Password & Profile
export const changePassword = (data) => publicApi.post('/public/change-password', data);
export const updateProfile = (data) => publicApi.put('/public/profile', data);

// Pet CRUD
export const createPet = (data) => publicApi.post('/public/pets', data);
export const updatePet = (id, data) => publicApi.put(`/public/pets/${id}`, data);
export const deletePet = (id) => publicApi.delete(`/public/pets/${id}`);

// Cancel appointment
export const cancelAppointment = (id) => publicApi.post(`/public/appointments/${id}/cancel`);

// 2FA
export const verifyTwoFactor = (email, code) => publicApi.post('/public/verify-2fa', { email, code });
export const resendTwoFactor = (email) => publicApi.post('/public/resend-2fa', { email });

// Forgot / Reset password
export const forgotPassword = (email) => publicApi.post('/public/forgot-password', { email });
export const resetPassword = (data) => publicApi.post('/public/reset-password', data);
