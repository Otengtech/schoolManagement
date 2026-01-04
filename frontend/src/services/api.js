// src/services/api.js - Simple version
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://school-management-system-backend-three.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple request interceptor - just adds token if it exists
api.interceptors.request.use(
  (config) => {
    // Skip token for public endpoints
    const publicEndpoints = ['/auth/login', '/create-super'];
    if (publicEndpoints.some(endpoint => config.url.includes(endpoint))) {
      return config;
    }

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