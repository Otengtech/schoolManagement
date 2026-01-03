// src/services/authService.js
import api from './api';

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store user data if returned (adjust based on actual response)
      if (response.data.admin) {
        localStorage.setItem('user', JSON.stringify(response.data.admin));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

  // Check if user is authenticated
  async checkAuth() {
    try {
      // You might need to create a specific endpoint for this
      // Or check by making a simple authenticated request
      const response = await api.get('/some-protected-endpoint');
      return { authenticated: true, user: JSON.parse(localStorage.getItem('user')) };
    } catch (error) {
      return { authenticated: false, user: null };
    }
  }
};