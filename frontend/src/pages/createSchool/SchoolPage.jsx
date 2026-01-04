import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSchool,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCode,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCrown,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const CreateSchoolPage = () => {
  const [schoolData, setSchoolData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
  });
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!schoolData.name.trim()) newErrors.name = "School name is required";
    if (!schoolData.code.trim()) newErrors.code = "School code is required";

    if (!schoolData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(schoolData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!schoolData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^0[0-9]{9}$/.test(schoolData.phone)) {
      newErrors.phone = "Phone must be 10 digits starting with 0";
    }

    if (!schoolData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);

    // Clear errors after 5 seconds
    setTimeout(() => {
      setErrors({});
    }, 5000);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSchoolData((prev) => ({
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

// In SchoolPage.jsx handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showToast("Please fix the form errors", "error");
    return;
  }

  setLoading(true);

  try {
    const API_URL = "https://school-management-system-backend-three.vercel.app";
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      showToast("Please login first", "error");
      navigate("/login");
      return;
    }

    // Use axios directly with token
    const response = await axios.post(
      `${API_URL}/create-school`,
      schoolData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Success handling...
    showToast("School created successfully!", "success");
    
    // Store school name for admin creation
    localStorage.setItem("createdSchoolName", schoolData.name);
    console.log("school name is ", localStorage.getItem("createdSchoolName"))
    
    if (response.data._id) {
      localStorage.setItem("createdSchoolId", response.data._id);
      console.log("school id is ", localStorage.getItem("createdSchoolId"))
    }

    setTimeout(() => {
      navigate("/create-admin");
    }, 2000);
    
  } catch (error) {
    console.error("Error creating school:", error);

    if (error.response?.status === 401) {
      showToast("Session expired. Please login again.", "error");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate("/login");
    } else {
      showToast(
        error.response?.data?.message || "Failed to create school",
        "error"
      );
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
                    <FaSchool className="text-2xl" />
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold">Create School</h1>
                </div>

                <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                  Register a new educational institution with the essential
                  details.
                </p>

                <div className="flex flex-col items-start justify-start space-y-2 mb-4">
                  <p className="text-white text-md">
                    Want to manage the system?
                  </p>
                  <Link to="/manage">
                    <button className="rounded-full px-6 py-2 cursor-pointer bg-[#ffa301]">Manage System</button>
                  </Link>
                </div>

                {/* Features Preview Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <FaCrown className="text-[#ffa301] text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-200">
                        Basic School Setup
                      </h3>
                      <p className="text-xs text-white">Essential information only</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-white">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      School name identification
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Unique school code
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Contact information
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Physical location address
                    </li>
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-blue-200 mb-1">Total Schools</p>
                    <p className="text-2xl font-bold text-[#ffa301]">1</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-blue-200 mb-1">Required Fields</p>
                    <p className="text-2xl font-bold text-[#ffa301]">5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - Form Section */}
            <div className="px-6 py-10 md:px-8 md:p-8 md:overflow-y-auto">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    New School
                  </h2>
                  <p className="text-sm text-gray-600">
                    Enter the school details below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* School Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaSchool className="text-[#ffa301]" />
                        School Name
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={schoolData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.name
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., KTU"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* School Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaCode className="text-[#ffa301]" />
                        School Code
                      </div>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={schoolData.code}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.code
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., KTU01"
                    />
                    {errors.code && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.code}
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
                      value={schoolData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., info@ktu.edu"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-[#ffa301]" />
                        Phone Number
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={schoolData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.phone
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., 024xxxxxxx"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#ffa301]" />
                        Address
                      </div>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={schoolData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.address
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#ffa301] focus:border-transparent"
                      }`}
                      placeholder="e.g., Some Street"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {errors.address}
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
                          Creating School...
                        </>
                      ) : (
                        <>
                          <FaSchool className="text-sm" />
                          Create School
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-3">
                      School will be registered in the system with provided
                      details.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSchoolPage;