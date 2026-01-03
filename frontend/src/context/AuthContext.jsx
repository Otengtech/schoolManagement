// Updated AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = "https://school-management-system-backend-three.vercel.app";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const [loading, setLoading] = useState(true);

  // Initialize axios interceptors
  useEffect(() => {
    // Request interceptor to add token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // DON'T add token to login endpoint
        if (config.url.includes('/auth/login')) {
          // Remove Authorization header if it exists
          delete config.headers.Authorization;
          return config;
        }
        
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    setLoading(false);

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Login function - FIXED VERSION
const login = async (email, password, role) => {
  try {
    setLoading(true);
    
    const loginAxios = axios.create();
    
    console.log('Login attempt without token:', { email, password: '***' });
    
    const response = await loginAxios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    console.log('Login response:', response.data);
    
    const { accessToken, refreshToken, user: userData } = response.data;
    
    // Normalize role from backend (super_admin to super-admin)
    const normalizedRole = userData.role === 'super_admin' 
      ? 'super-admin' 
      : userData.role;
    
    // Store tokens and user data
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');
    localStorage.setItem('user', JSON.stringify({ 
      ...userData, 
      role: normalizedRole 
    }));
    
    setToken(accessToken);
    setUser({ ...userData, role: normalizedRole });
    
    toast.success(`Welcome back, ${userData.name || 'User'}!`);
    
    return { 
      success: true, 
      data: response.data, 
      role: normalizedRole 
    };
    
  } catch (error) {
    // ... error handling
  } finally {
    setLoading(false);
  }
};

 // Add isAuthenticated function
  const isAuthenticated = () => {
    // Check if token exists and is valid
    const token = localStorage.getItem('accessToken');
    return !!token; // Returns true if token exists, false otherwise
  };

  // ... rest of your AuthContext code (logout, etc.)
  
  return (
    <AuthContext.Provider value={{ 
      user,
      token, 
      login, 
      isAuthenticated,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);