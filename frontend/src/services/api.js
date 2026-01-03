// src/services/api.js
import axios from 'axios';

// Check what your base URL actually is
const API_URL = import.meta.env.VITE_API_URL || 'https://school-management-system-backend-three.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to see what's happening
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('⚠️ No token found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;