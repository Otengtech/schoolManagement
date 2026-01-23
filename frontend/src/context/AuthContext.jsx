import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://school-management-system-backend-three.vercel.app";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  // ================= LOGIN =================
  const login = async (email, password) => {
    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { accessToken, refreshToken, user: userData } = res.data;

      // Store tokens
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(accessToken);
      setUser(userData);

      toast.success(`Welcome back, ${userData.firstName || "Admin"}!`);

      return { success: true, user: userData };
    } catch (error) {
      let msg = "Login failed";

      if (error.response?.status === 401) {
        msg = "Invalid email or password";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }

      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);

    toast.info("Logged out successfully");
    window.location.href = "/login";
  };

  // ================= AUTH CHECK =================
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
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
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
