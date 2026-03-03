import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('vetbook_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vetbook_token');
      localStorage.removeItem('vetbook_user');
      // Force reload to reset React state and redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      } else if (window.location.pathname === '/login') {
        // Already on login page, don't redirect
      } else {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
