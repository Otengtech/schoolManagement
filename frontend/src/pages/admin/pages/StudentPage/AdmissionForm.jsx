import React, { useState } from 'react';
import axios from 'axios';
import { FaUserGraduate, FaBirthdayCake, FaPhone, FaEnvelope, FaImage, FaSave, FaRedo } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentsAdmission = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    rollNumber: '',
    religion: '',
    email: '',
    className: '',
    section: '',
    admissionId: '',
    phone: '',
    bio: '',
    studentPhoto: null
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // API endpoint - replace with your actual API
      const response = await axios.post('https://api.yourdomain.com/students/admission', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      toast.success('Student admitted successfully!', {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form after successful submission
      handleReset();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to admit student. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      rollNumber: '',
      religion: '',
      email: '',
      className: '',
      section: '',
      admissionId: '',
      phone: '',
      bio: '',
      studentPhoto: null
    });
    setPreviewImage(null);
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const classOptions = [
    'Nursery', 'KG', '1st', '2nd', '3rd', '4th', '5th', 
    '6th', '7th', '8th', '9th', '10th', '11th', '12th'
  ];

  const sectionOptions = ['A', 'B', 'C', 'D', 'E'];

  const religionOptions = [
    'Christianity', 'Islam', 'Hinduism', 'Buddhism', 
    'Sikhism', 'Judaism', 'Other'
  ];

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaUserGraduate className="text-2xl text-blue-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Student Admission</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-700 to-purple-600 p-6 text-white">
            <h2 className="text-xl md:text-2xl font-bold">Add New Student</h2>
            <p className="text-blue-100 mt-1">Fill in the details below to admit a new student</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Information Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserGraduate className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter last name"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {genderOptions.map((option) => (
                    <label 
                      key={option.value}
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition ${
                        formData.gender === option.value 
                          ? 'bg-blue-50 border-blue-500 text-blue-600' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={handleChange}
                        required
                        className="sr-only"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBirthdayCake className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-sm">
                    dd/mm/yyyy
                  </div>
                </div>
              </div>

              {/* Roll Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter roll number"
                />
              </div>

              {/* Religion */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Religion <span className="text-red-500">*</span>
                </label>
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Select Religion</option>
                  {religionOptions.map((religion) => (
                    <option key={religion} value={religion.toLowerCase()}>
                      {religion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Information Section */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Academic Information
                </h3>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              {/* Class */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Select Class</option>
                  {classOptions.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="">Select Section</option>
                  {sectionOptions.map((section) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admission ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Admission ID
                </label>
                <input
                  type="text"
                  name="admissionId"
                  value={formData.admissionId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter admission ID"
                />
              </div>

              {/* Contact Information Section */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Contact Information
                </h3>
              </div>

              {/* Phone */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Upload Photo Section */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Student Photo
                </h3>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  
                  {/* Preview Area */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Student preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaImage className="text-gray-400 text-5xl" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                        150px × 150px
                      </div>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Student Photo
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <FaImage className="text-gray-500" />
                            <span className="text-gray-700 font-medium">Choose File</span>
                          </div>
                          <input
                            type="file"
                            name="studentPhoto"
                            onChange={handleChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                        <span className="ml-4 text-gray-500 text-sm">
                          {formData.studentPhoto ? formData.studentPhoto.name : 'No file chosen'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Recommended: Square image, JPG or PNG format, max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Student Record</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center space-x-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg border border-gray-300 transition-colors"
              >
                <FaRedo />
                <span>Reset Form</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentsAdmission;