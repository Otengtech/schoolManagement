const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import axios from "axios"

// Login
export const loginUser = async (credentials) => {
    const res = await axios(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    return res.json();
};

// Register
export const registerUser = async (data) => {
    const res = await axios(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

// Forgot Password
export const forgotPassword = async (email) => {
    const res = await axios(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return res.json();
};

// Reset Password
export const resetPassword = async (token, password) => {
    const res = await axios(`${API_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });
    return res.json();
};
