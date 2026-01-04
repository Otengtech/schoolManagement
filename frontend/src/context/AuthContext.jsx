// AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://school-management-system-backend-three.vercel.app';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
    
      const { accessToken, user: userData } = response.data;
      
      // Store data with email-based keys to prevent overwriting
      const adminEmail = userData.email;
      
      // Store with email-specific keys
      localStorage.setItem(`token_${adminEmail}`, accessToken);
      localStorage.setItem(`user_${adminEmail}`, JSON.stringify(userData));
      
      // Store which admin is currently active
      localStorage.setItem('currentActiveEmail', adminEmail);
      
      // Also store in regular keys for backward compatibility
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store additional admin data if available
      if (userData.role === 'admin') {
        localStorage.setItem(`currentAdmin_${adminEmail}`, JSON.stringify(userData));
      }
      
      // Set state
      setToken(accessToken);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.firstName || 'Admin'}!`);
      
      return { 
        success: true, 
        data: response.data,
        user: userData,
        role: userData.role
      };
      
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = 'Login failed';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
      
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    // Check if any admin is logged in
    const currentEmail = localStorage.getItem('currentActiveEmail');
    if (currentEmail) {
      return !!localStorage.getItem(`token_${currentEmail}`);
    }
    
    // Fallback to old method
    const storedToken = localStorage.getItem('token');
    return !!storedToken;
  };

  const logout = () => {
    // Clear all data for current admin
    const currentEmail = localStorage.getItem('currentActiveEmail');
    if (currentEmail) {
      localStorage.removeItem(`token_${currentEmail}`);
      localStorage.removeItem(`user_${currentEmail}`);
      localStorage.removeItem(`currentAdmin_${currentEmail}`);
    }
    
    // Clear general data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentActiveEmail');
    
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
    window.location.href = '/login';
  };

  const getCurrentUser = () => {
    try {
      // Try to get current admin by email first
      const currentEmail = localStorage.getItem('currentActiveEmail');
      if (currentEmail) {
        const userStr = localStorage.getItem(`user_${currentEmail}`);
        if (userStr) return JSON.parse(userStr);
      }
      
      // Fallback to old method
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  // Get all stored admin emails (for debugging)
  const getAllAdminEmails = () => {
    const emails = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('user_')) {
        emails.push(key.replace('user_', ''));
      }
    }
    return emails;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        getAllAdminEmails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);