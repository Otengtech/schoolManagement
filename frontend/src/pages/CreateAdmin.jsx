// pages/CreateAdmin.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  FaUserShield,
  FaUser,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaBuilding,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaCamera,
  FaUpload,
  FaTrash,
} from "react-icons/fa";
import { adminStorage } from '../utils/adminStorage';

const CreateAdmin = () => {
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        return "";

      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";

      case "confirmPassword":
        if (!value) return "Please confirm password";
        if (value !== adminData.password) return "Passwords do not match";
        return "";

      default:
        return "";
    }
  };

  // Handle input changes
  const handleChange = (name, value) => {
    setAdminData((prev) => ({ ...prev, [name]: value }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Handle field blur
  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, adminData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle file change - Updated to match friend's code
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type - Updated to match friend's code
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setProfileImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    Object.keys(adminData).forEach((key) => {
      newErrors[key] = validateField(key, adminData[key]);
    });

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    return !Object.values(newErrors).some((error) => error !== "");
  };

  useEffect(() => {
    const checkSchoolName = () => {
      const schoolName = localStorage.getItem("createdSchoolName");
      
      if (!schoolName) {
        toast.error("No school found. Please create a school first.");
        return false;
      }
      
      return true;
    };
    
    checkSchoolName();
  }, [navigate]);

 // In CreateAdmin.js - Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error("Please fix the form errors");
    return;
  }

  setLoading(true);

  try {
    const schoolName = localStorage.getItem("createdSchoolName");
    const accessToken = localStorage.getItem("token");

    if (!schoolName) {
      toast.error("No school name found. Please create a school first.");
      navigate("/create-school");
      return;
    }

    if (!accessToken) {
      toast.error("No access token. Please login.");
      navigate("/login");
      return;
    }

    // Create FormData
    const formData = new FormData();
    
    // Add fields
    formData.append("school", schoolName);
    formData.append("firstName", adminData.firstName.trim());
    formData.append("lastName", adminData.lastName.trim());
    formData.append("email", adminData.email.trim());
    formData.append("password", adminData.password);
    
    // Add profile image if exists
    if (profileImage instanceof File) {
      formData.append("profileImage", profileImage);
    }

    console.log("Creating admin with email:", adminData.email);
    
    const response = await axios.post(
      "https://school-management-system-backend-three.vercel.app/create-admin",
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        timeout: 30000,
      }
    );

    console.log("✅ Success! Response:", response.data);
    toast.success("Admin account created successfully!");

    const schoolId = localStorage.getItem('createdSchoolId');
    const adminEmail = adminData.email.trim();

    // 🎯 UPDATED: Store admin data with email-based keys
    const completeAdminData = {
      ...response.data,
      school: {
        name: schoolName,
        id: schoolId,
        code: response.data.school?.code || ''
      },
      schoolName: schoolName,
      schoolId: schoolId,
      profileImage: profileImagePreview || response.data.profileImage,
      email: adminEmail,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    adminStorage.storeAdminData(completeAdminData);

    console.log("💾 Storing admin data for email:", adminEmail);
    
    // Store with email-based keys
    localStorage.setItem(`user_${adminEmail}`, JSON.stringify(completeAdminData));
    localStorage.setItem(`currentAdmin_${adminEmail}`, JSON.stringify(completeAdminData));
    
    // Store school info with email key
    const schoolInfo = {
      name: schoolName,
      id: schoolId,
      code: response.data.school?.code || ''
    };
    localStorage.setItem(`school_${adminEmail}`, JSON.stringify(schoolInfo));
    
    // Set this admin as current active
    localStorage.setItem('currentActiveEmail', adminEmail);
    
    // Also store in legacy format for backward compatibility
    localStorage.setItem('currentAdmin', JSON.stringify(completeAdminData));
    localStorage.setItem('schoolInfo', JSON.stringify(schoolInfo));
    localStorage.setItem('createdSchoolName', schoolName);
    
    console.log("✅ Admin data stored successfully for:", adminEmail);
    console.log("Current active email set to:", localStorage.getItem('currentActiveEmail'));
    
    // Redirect to admin dashboard
    setTimeout(() => {
      navigate("/admin");
    }, 1500);
    
  } catch (error) {
    console.error("❌ Create admin error:", error);
    
    if (error.response) {
      // ... existing error handling
    } else if (error.request) {
      console.log("❌ No response received. Network error.");
      toast.error("Network error: Cannot connect to server.");
    } else {
      toast.error("Request failed: " + error.message);
    }
  } finally {
    setLoading(false);
  }
};

  // Admin features list
  const getAdminFeatures = () => [
    "Full school management control",
    "User administration & permissions",
    "Student records management",
    "Teacher assignment & scheduling",
    "Financial oversight",
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full min-h-screen bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full md:h-screen">
          {/* Left Information Section */}
          <div className="bg-gradient-to-br from-[#052954] to-[#041e42] p-6 md:p-16 text-white relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#ffa301] to-[#ff8c00] shadow-lg">
                    <FaUserShield className="text-xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-1">
                      Create Admin Account
                    </h1>
                    <p className="text-sm text-blue-100">
                      School Management System
                    </p>
                  </div>
                </div>

                <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                  Create a new administrator account to manage your school's
                  operations, users, and academic activities.
                </p>

                {/* Admin Features Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <FaShieldAlt className="text-[#ffa301]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-200">
                        Administrator Privileges
                      </h3>
                      <p className="text-xs text-white">
                        Full school management access
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3 text-sm text-white">
                    {getAdminFeatures().map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <FaCheckCircle className="text-[#ffa301] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Profile Image Tips */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/10 mt-1">
                    <FaCamera className="text-[#ffa301]" />
                  </div>
                  <div>
                    <p className="font-medium">Profile Image Storage</p>
                    <p className="text-xs text-blue-100">
                      Image will be stored as base64 in your database. 
                      Use JPEG or PNG format (max 5MB recommended).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Create Admin Form */}
          <div className="px-6 py-10 md:px-8 md:p-8 md:overflow-y-auto">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Admin Setup
                </h2>
                <p className="text-sm text-gray-600">
                  Create administrator account for your school
                </p>
              </div>

              {/* UPDATED: Added encType to form */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate encType="multipart/form-data">
                {/* School Info */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <FaBuilding className="text-[#ffa301]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        School Information
                      </h3>
                      <p className="text-xs text-gray-600">
                        This admin account will be associated with your school
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <FaCamera className="text-[#ffa301]" />
                      Profile Image
                    </div>
                  </label>

                  <div className="flex items-center gap-6">
                    {/* Image Preview */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaUser className="text-3xl text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Remove button */}
                      {profileImagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          disabled={loading}
                          className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        id="profile-image-upload"
                        disabled={loading}
                      />

                      <label
                        htmlFor="profile-image-upload"
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                          loading
                            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
                            : "hover:border-[#ffa301] hover:bg-yellow-50 border-gray-300"
                        }`}
                      >
                        <FaUpload className="text-[#ffa301]" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {profileImage ? "Change Image" : "Upload Image"}
                          </p>
                          <p className="text-xs text-gray-500">
                            JPEG, PNG • Max 5MB
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Optional: Image will be uploaded and stored
                  </p>
                </div>

                {/* First Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-[#ffa301]" />
                      First Name
                    </div>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={adminData.firstName}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      onBlur={() => handleBlur("firstName")}
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.firstName && touched.firstName
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-[#ffa301]"
                      } ${
                        loading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="John"
                    />
                    <FaUser
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        errors.firstName && touched.firstName
                          ? "text-red-400"
                          : "text-gray-400"
                      } ${loading ? "opacity-50" : ""}`}
                    />
                  </div>

                  {errors.firstName && touched.firstName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-[#ffa301]" />
                      Last Name
                    </div>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={adminData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.lastName && touched.lastName
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-[#ffa301]"
                      } ${
                        loading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="Doe"
                    />
                    <FaUser
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        errors.lastName && touched.lastName
                          ? "text-red-400"
                          : "text-gray-400"
                      } ${loading ? "opacity-50" : ""}`}
                    />
                  </div>

                  {errors.lastName && touched.lastName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-[#ffa301]" />
                      Email Address
                    </div>
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      required
                      value={adminData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.email && touched.email
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-[#ffa301]"
                      } ${
                        loading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="admin@school.edu"
                    />
                    <FaEnvelope
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        errors.email && touched.email
                          ? "text-red-400"
                          : "text-gray-400"
                      } ${loading ? "opacity-50" : ""}`}
                    />
                  </div>

                  {errors.email && touched.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaLock className="text-[#ffa301]" />
                      Password
                    </div>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={adminData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      disabled={loading}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.password && touched.password
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-[#ffa301]"
                      } ${
                        loading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <FaLock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        errors.password && touched.password
                          ? "text-red-400"
                          : "text-gray-400"
                      } ${loading ? "opacity-50" : ""}`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {errors.password && touched.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaLock className="text-[#ffa301]" />
                      Confirm Password
                    </div>
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={adminData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      onBlur={() => handleBlur("confirmPassword")}
                      disabled={loading}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword && touched.confirmPassword
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-[#ffa301]"
                      } ${
                        loading
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <FaLock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        errors.confirmPassword && touched.confirmPassword
                          ? "text-red-400"
                          : "text-gray-400"
                      } ${loading ? "opacity-50" : ""}`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.confirmPassword}
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
                        <FaSpinner className="animate-spin" />
                        <span>Creating Admin Account...</span>
                      </>
                    ) : (
                      <>
                        <FaUserShield />
                        <span>Create Admin Account</span>
                      </>
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className={`text-sm font-medium hover:underline ${
                        loading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-[#ffa301] hover:text-[#e59400]"
                      }`}
                      disabled={loading}
                    >
                      ← Back to login
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;