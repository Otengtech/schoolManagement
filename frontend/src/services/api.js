// src/services/api.js
import axios from 'axios';

// Check what your base URL actually is
const API_URL = import.meta.env.VITE_API_URL || 'https://school-management-system-backend-three.vercel.app';

console.log('📡 API_URL from env:', API_URL); // Add this line

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to see what's happening
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request URL:', config.baseURL + config.url); // Debug
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request');
    } else {
      console.log('⚠️ No token found');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default api;