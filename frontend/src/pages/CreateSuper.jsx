import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaUserTie,
  FaEnvelope,
  FaLock,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCrown,
} from "react-icons/fa";
import axios from "axios";

const CreateSuper = () => {
  const [superData, setSuperData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!superData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!superData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!superData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(superData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!superData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (superData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    // Clear errors after 5 seconds
    setTimeout(() => {
      setErrors({});
    }, 5000);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSuperData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the form errors", "error");
      return;
    }

    setLoading(true);

    try {
      const API_URL = "https://school-management-system-backend-three.vercel.app";

      const response = await axios.post(
        `${API_URL}/create-super`,
        superData
        // No token required for this endpoint
      );

      // Reset form
      setSuperData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

      showToast("Super Admin created successfully!", "success");
      
      console.log("✅ Super Admin created response:", response.data);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("Error creating super admin:", error);

      if (error.response?.data?.message) {
        showToast(error.response.data.message, "error");
      } else if (error.response?.status === 409) {
        showToast("Super Admin already exists", "error");
      } else {
        showToast("Failed to create Super Admin", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toast Notification Component
  const Toast = ({ message, type, onClose }) => {
    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const Icon = type === "success" ? FaCheckCircle : FaExclamationTriangle;

    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
        <div
          className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md backdrop-blur-sm bg-opacity-90`}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full min-h-screen bg-white overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full md:h-screen">
            {/* LEFT - Hero Section */}
            <div className="bg-gradient-to-br from-[#052954] to-[#041e42] p-6 md:p-16 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 rounded-full -translate-y-12 translate-x-12 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full translate-y-16 -translate-x-16 opacity-20"></div>

              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#ffa301] to-[#ff8c00] shadow-lg">
                    <FaCrown className="text-2xl" />
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold">Create Super Admin</h1>
                </div>

                <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                  Register the first Super Administrator for the system.
                </p>

                <div className="flex flex-col items-start justify-start space-y-2 mb-4">
                  <p className="text-blue-100 text-md">
                    Have already created a Super Admin?
                  </p>
                  <Link to="/login">
                    <button className="rounded-full px-6 py-2 cursor-pointer bg-[#ffa301]">Login</button>
                  </Link>
                </div>

                {/* Features Preview Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <FaUserTie className="text-[#ffa301] text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-200">
                        System Administrator Setup
                      </h3>
                      <p className="text-xs text-white">Complete access to all system features</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-white">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Full system administration rights
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Can create schools and admins
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Manage all system settings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Access to all reports and analytics
                    </li>
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-blue-200 mb-1">Super Admins</p>
                    <p className="text-2xl font-bold text-[#ffa301]">1</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-blue-200 mb-1">Required Fields</p>
                    <p className="text-2xl font-bold text-[#ffa301]">4</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - Form Section */}
            <div className="px-6 py-10 md:px-8 md:p-8 md:overflow-y-auto">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    Super Admin Registration
                  </h2>
                  <p className="text-sm text-gray-600">
                    Create the primary system administrator
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-[#ffa301]" />
                        First Name
                      </div>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={superData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.firstName
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-[#ffa301]" />
                        Last Name
                      </div>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={superData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.lastName
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-[#ffa301]" />
                        Email Address
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={superData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., admin@system.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaLock className="text-[#ffa301]" />
                        Password
                      </div>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={superData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="At least 6 characters"
                    />
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                        loading
                          ? "bg-[#ffa301]/70 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#052954] to-[#041e42] hover:opacity-90 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating Super Admin...
                        </>
                      ) : (
                        <>
                          <FaCrown className="text-sm" />
                          Create Super Admin
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-3">
                      This will create the primary system administrator account.
                    </p>
                  </div>
                </form>

                {/* Note for Super Admin */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Important Note
                      </p>
                      <p className="text-xs text-blue-600">
                        This endpoint should only be used for initial system setup.
                        The Super Admin account will have full access to all system
                        features and data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSuper;