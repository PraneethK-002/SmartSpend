import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Strip trailing slash
rawApiUrl = rawApiUrl.replace(/\/$/, '');
// Ensure it ends with /api
if (!rawApiUrl.endsWith('/api')) {
  rawApiUrl += '/api';
}

const api = axios.create({
  baseURL: rawApiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
