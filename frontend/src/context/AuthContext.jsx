// AuthContext.jsx - Simple version without refresh
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://school-management-system-backend-three.vercel.app';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Simple login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
    
      
      const { accessToken, user: userData } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set state
      setToken(accessToken);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.name || userData.firstName || 'User'}!`);
      
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

  // Simple authentication check
  const isAuthenticated = () => {
    const storedToken = localStorage.getItem('token');
    return !!storedToken; // Just check if token exists
  };

  // Simple logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
    window.location.href = '/login';
  };

  // Get current user
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
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
        getCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);