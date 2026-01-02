import React, { useState } from 'react';
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaSchool,
  FaMapMarkerAlt,
  FaImage,
  FaUpload,
  FaSpinner,
  FaShieldAlt,
  FaKey,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStar,
  FaExclamationCircle,
  FaUserTag,
  FaUserFriends,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCrown
} from 'react-icons/fa';
import axios from "axios"

const SuperAdminPage = () => {
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profilePic: '',
    school: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!adminData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!adminData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!adminData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!adminData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0[0-9]{9}$/.test(adminData.phone)) {
      newErrors.phone = 'Phone must be 10 digits starting with 0';
    }
    
    if (!adminData.address.trim()) newErrors.address = 'Address is required';
    if (!adminData.school.trim()) newErrors.school = 'School is required';
    
    setErrors(newErrors); // Set errors immediately
    
    // Clear errors after 5 seconds
    setTimeout(() => {
        setErrors({});
    }, 5000);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      setAdminData(prev => ({
        ...prev,
        profilePic: file
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    showToast('Please fix the form errors', 'error');
    return;
  }

  setLoading(true);

  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';
    
    let token = null;
    
    if (!BYPASS_AUTH) {
      token = localStorage.getItem('token');
      if (!token) {
        showToast('Please log in first', 'error');
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('firstName', adminData.firstName);
    formData.append('lastName', adminData.lastName);
    formData.append('email', adminData.email);
    formData.append('phone', adminData.phone);
    formData.append('address', adminData.address);
    formData.append('school', adminData.school);
    
    if (adminData.profilePic instanceof File) {
      formData.append('profilePic', adminData.profilePic);
    }

    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    
    if (token && !BYPASS_AUTH) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_URL}/create-admin`,
      formData,
      { headers }
    );

    // Reset form and show success
    setAdminData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      profilePic: '',
      school: '',
    });
    setImagePreview('');

    showToast('Administrator created successfully!', 'success');

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    // If it's a CORS error, show specific message
    if (error.response?.status === 500 && 
        error.response.data?.includes?.('CORS')) {
      showToast(
        `CORS Error: Backend needs to add 'http://localhost:5173' to allowed origins`,
        'error'
      );
    }
    // If it's auth error
    else if (error.response?.status === 401 || error.response?.status === 403) {
      showToast('Authentication required. Please log in as super admin.', 'error');
    }
    else {
      showToast(
        error.response?.data?.message || 'Failed to create admin',
        'error'
      );
    }
  } finally {
    setLoading(false);
  }
};

  // Toast Notification Component
  const Toast = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const Icon = type === 'success' ? FaCheckCircle : FaExclamationTriangle;

    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
        <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md backdrop-blur-sm bg-opacity-90`}>
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
                  <h1 className="text-3xl md:text-5xl font-bold">Create Admin</h1>
                </div>
                
                <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                  Add a new school administrator with comprehensive management privileges and system access.
                </p>

                {/* Features Preview Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <FaShieldAlt className="text-[#ffa301] text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-200">Super Admin Privileges</h3>
                      <p className="text-xs text-white">Complete system control</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-white">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Full system management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      User administration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      Security configuration
                    </li>
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-blue-200 mb-1">Total Admins</p>
                    <p className="text-2xl font-bold text-[#ffa301]">0</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-blue-200 mb-1">Active Schools</p>
                    <p className="text-2xl font-bold text-[#ffa301]">0</p>
                  </div>
                </div>

                {/* Quick Features */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <FaKey className="text-xs" />
                    </div>
                    <span className="text-xs">Full Access Control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <FaUsers className="text-xs" />
                    </div>
                    <span className="text-xs">Team Management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - Form Section */}
            <div className="px-6 py-10 md:px-8 md:p-8 md:overflow-y-auto">
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">New Administrator</h2>
                  <p className="text-sm text-gray-600">Fill in the administrator details below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Name Row */}
                  <div className="grid md:grid-cols-2 gap-4">
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
                        value={adminData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.firstName
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaExclamationCircle />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-[#ffa301]" />
                          Last Name
                        </div>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={adminData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.lastName
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaExclamationCircle />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email & Phone Row */}
                  <div className="grid md:grid-cols-2 gap-4">
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
                        value={adminData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.email
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="admin@school.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaExclamationCircle />
                          {errors.email}
                        </p>
                      )}
                    </div>

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
                        value={adminData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.phone
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="0241234567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaExclamationCircle />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* School & Address Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaSchool className="text-[#ffa301]" />
                          School Name
                        </div>
                      </label>
                      <input
                        type="text"
                        name="school"
                        value={adminData.school}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.school
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="Enter school name"
                      />
                      {errors.school && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaExclamationCircle />
                          {errors.school}
                        </p>
                      )}
                    </div>

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
                        value={adminData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.address
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="City, Country"
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaExclamationCircle />
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Picture Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <div className="flex items-center gap-2">
                        <FaImage className="text-[#ffa301]" />
                        Profile Picture
                      </div>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-[#ffa301] transition-colors">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Profile preview" 
                              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview('');
                                setAdminData(prev => ({ ...prev, profilePic: '' }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shadow-inner">
                            <FaUser className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#052954] to-[#041e42] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md">
                            <FaUpload className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {imagePreview ? 'Change Image' : 'Upload Image'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            PNG, JPG, or JPEG (max 5MB)
                          </p>
                        </label>
                      </div>
                    </div>
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
                          Creating Administrator...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="text-sm" />
                          Create Administrator Account
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-xs text-gray-500 mt-3">
                      The administrator will receive login credentials via email
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

export default SuperAdminPage;