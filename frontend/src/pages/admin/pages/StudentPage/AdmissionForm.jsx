import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaBook,
  FaUserFriends,
  FaEnvelope,
  FaImage,
  FaSave,
  FaRedo,
  FaMars,
  FaVenus,
  FaGenderless,
  FaChevronDown,
  FaPhone,
  FaIdCard,
  FaCalendar,
  FaSchool,
  FaBuilding
} from "react-icons/fa";

const StudentAdmission = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Student Personal Information
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    
    // Academic Information
    studentId: "",
    admissionYear: new Date().getFullYear().toString(),
    admissionTerm: "",
    level: "",
    className: "",
    
    // Parent Information
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentPhone: "",
    
    // Student Photo
    studentPhoto: null,
  });

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_URI || "https://school-management-system-backend-three.vercel.app";

  // Options Data
  const genderOptions = [
    { value: "male", label: "Male", icon: <FaMars className="inline mr-2" /> },
    { value: "female", label: "Female", icon: <FaVenus className="inline mr-2" /> },
    { value: "other", label: "Other", icon: <FaGenderless className="inline mr-2" /> },
  ];

  const levelOptions = [
    "JHS 1",
    "JHS 2", 
    "JHS 3",
    "SHS 1",
    "SHS 2",
    "SHS 3",
  ];

  const classOptions = {
    "JHS 1": ["JHS 1A", "JHS 1B", "JHS 1C", "JHS 1D"],
    "JHS 2": ["JHS 2A", "JHS 2B", "JHS 2C", "JHS 2D"],
    "JHS 3": ["JHS 3A", "JHS 3B", "JHS 3C", "JHS 3D"],
    "SHS 1": ["SHS 1A", "SHS 1B", "SHS 1C", "SHS 1D"],
    "SHS 2": ["SHS 2A", "SHS 2B", "SHS 2C", "SHS 2D"],
    "SHS 3": ["SHS 3A", "SHS 3B", "SHS 3C", "SHS 3D"],
  };

  const admissionTermOptions = [
    "term1",
    "term2",
    "term3"
  ];

  const admissionYearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return year.toString();
  });

  // Calculate class options based on selected level
  const availableClassOptions = formData.level ? classOptions[formData.level] || [] : [];

  // Event Handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "studentPhoto" && files?.[0]) {
      // Validate file size (max 5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors({ ...errors, studentPhoto: "File size must be less than 5MB" });
        return;
      }
      
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(files[0].type)) {
        setErrors({ ...errors, studentPhoto: "Only JPG, PNG, GIF files are allowed" });
        return;
      }
      
      setFormData({ ...formData, studentPhoto: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
      if (errors.studentPhoto) setErrors({ ...errors, studentPhoto: "" });
      return;
    }

    // Reset className when level changes
    if (name === "level") {
      setFormData({ 
        ...formData, 
        [name]: value,
        className: "" 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleGenderChange = (value) => {
    setFormData({ ...formData, gender: value });
    if (errors.gender) setErrors({ ...errors, gender: "" });
  };

  // Auto-generate student ID
  useEffect(() => {
    if (!formData.studentId && formData.admissionYear && formData.level && formData.firstName && formData.lastName) {
      const levelCode = formData.level.includes("JHS") ? "JHS" : "SHS";
      const year = formData.admissionYear.slice(-2);
      const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      
      const generatedId = `${levelCode}-${year}${randomNum}`;
      setFormData(prev => ({ ...prev, studentId: generatedId }));
    }
  }, [formData.firstName, formData.lastName, formData.level, formData.admissionYear]);

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0[23459]\d{8}$/; // Ghana phone number format

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    else if (formData.firstName.length < 2) newErrors.firstName = "First name must be at least 2 characters";
    
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (formData.lastName.length < 2) newErrors.lastName = "Last name must be at least 2 characters";
    
    if (!formData.gender) newErrors.gender = "Please select gender";
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob >= today) newErrors.dateOfBirth = "Date of birth must be in the past";
    }
    
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    else if (formData.studentId.length < 3) newErrors.studentId = "Student ID must be at least 3 characters";
    
    if (!formData.admissionYear) newErrors.admissionYear = "Admission year is required";
    
    if (!formData.admissionTerm) newErrors.admissionTerm = "Admission term is required";
    
    if (!formData.level) newErrors.level = "Level is required";
    
    if (!formData.className) newErrors.className = "Class is required";
    
    // Parent Information
    if (!formData.parentFirstName.trim()) newErrors.parentFirstName = "Parent first name is required";
    if (!formData.parentLastName.trim()) newErrors.parentLastName = "Parent last name is required";
    
    if (!formData.parentEmail.trim()) newErrors.parentEmail = "Parent email is required";
    else if (!emailRegex.test(formData.parentEmail)) newErrors.parentEmail = "Invalid email format";
    
    if (!formData.parentPhone.trim()) newErrors.parentPhone = "Parent phone is required";
    else if (!phoneRegex.test(formData.parentPhone)) {
      newErrors.parentPhone = "Invalid Ghana phone number (e.g., 0241234567)";
    }
    
    if (!formData.studentPhoto) newErrors.studentPhoto = "Student photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    alert("Please fix the errors in the form before submitting.");
    return;
  }

  setLoading(true);

  try {
    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "" && value !== undefined) {
        submitData.append(key, value);
      }
    });

    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/students`,
      submitData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ✅ Success: Only handle here, no throwing
    if ((response.status === 200 || response.status === 201) && response.data) {
      alert("Student admitted successfully!");
      handleReset();
    } else {
      // Backend sent something weird
      alert(response.data?.message || "Admission completed, but unexpected response.");
    }

  } catch (error) {
    // Only actual request errors land here
    console.error("Admission error:", error);

    if (error.response?.data?.message?.includes("studentId")) {
      setErrors((prev) => ({ ...prev, studentId: "Student ID already exists" }));
      alert("Student ID already exists. Please use a different ID.");
    } else if (error.response?.data?.message?.includes("parentEmail")) {
      setErrors((prev) => ({ ...prev, parentEmail: "Parent email already registered" }));
      alert("Parent email already registered. Please use a different email.");
    } else {
      alert(error.response?.data?.message || "Failed to admit student. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  // Form Reset
  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      studentId: "",
      admissionYear: new Date().getFullYear().toString(),
      admissionTerm: "",
      level: "",
      className: "",
      parentFirstName: "",
      parentLastName: "",
      parentEmail: "",
      parentPhone: "",
      studentPhoto: null,
    });
    setPreviewImage(null);
    setErrors({});
  };

  // CSS Classes
  const inputClass = (fieldName) => 
    `w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none transition ${
      errors[fieldName] 
        ? "border-red-500 focus:ring-red-500/30 focus:border-red-500" 
        : "border-gray-300"
    }`;

  const selectClass = (fieldName) =>
    `appearance-none w-full px-4 py-3 pr-10 rounded-xl border text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none cursor-pointer ${
      errors[fieldName]
        ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
        : "border-gray-300"
    }`;

  const radioClass = (isSelected) =>
    `flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border cursor-pointer transition ${
      isSelected
        ? "bg-[#052954] text-white border-[#052954]"
        : "hover:bg-[#052954]/5 border-gray-300"
    }`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-2";
  const errorClass = "text-red-500 text-xs mt-1 flex items-center gap-1";
  const sectionHeaderClass = "flex items-center gap-3 text-lg md:text-xl font-semibold text-[#052954] border-b pb-2 md:pb-3";

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#052954] flex items-center gap-3">
          <FaUser className="text-[#ffa301]" />
          Student Admission Form
        </h1>
        <p className="text-gray-600 text-sm mt-2">Fill in all required fields marked with *</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
        {/* Personal Information Section */}
        <div className="space-y-4 md:space-y-6">
          <div className={sectionHeaderClass}>
            <FaUser className="text-[#ffa301]" />
            <span>Student Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* First Name */}
            <div>
              <label className={labelClass}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={inputClass("firstName")}
                maxLength={50}
              />
              {errors.firstName && <p className={errorClass}>⚠️ {errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className={labelClass}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={inputClass("lastName")}
                maxLength={50}
              />
              {errors.lastName && <p className={errorClass}>⚠️ {errors.lastName}</p>}
            </div>

            {/* Gender */}
            <div className="md:col-span-2">
              <label className={labelClass}>
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mt-2">
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className={radioClass(formData.gender === option.value)}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={(e) => handleGenderChange(e.target.value)}
                      className="hidden"
                    />
                    {option.icon}
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className={errorClass}>⚠️ {errors.gender}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className={labelClass}>
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`${inputClass("dateOfBirth")} pl-10`}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.dateOfBirth && <p className={errorClass}>⚠️ {errors.dateOfBirth}</p>}
            </div>
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="space-y-4 md:space-y-6">
          <div className={sectionHeaderClass}>
            <FaBook className="text-[#ffa301]" />
            <span>Academic Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Student ID */}
            <div>
              <label className={labelClass}>
                Student ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Auto-generated"
                  className={`${inputClass("studentId")} bg-gray-50`}
                  maxLength={20}
                />
                <FaIdCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.studentId && <p className={errorClass}>⚠️ {errors.studentId}</p>}
            </div>

            {/* Admission Year */}
            <div>
              <label className={labelClass}>
                Admission Year <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="admissionYear"
                  value={formData.admissionYear}
                  onChange={handleChange}
                  className={selectClass("admissionYear")}
                >
                  <option value="">Select Year</option>
                  {admissionYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <FaCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.admissionYear && <p className={errorClass}>⚠️ {errors.admissionYear}</p>}
            </div>

            {/* Admission Term */}
            <div>
              <label className={labelClass}>
                Admission Term <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="admissionTerm"
                  value={formData.admissionTerm}
                  onChange={handleChange}
                  className={selectClass("admissionTerm")}
                >
                  <option value="">Select Term</option>
                  {admissionTermOptions.map((term) => (
                    <option key={term} value={term}>
                      {term === "term1" ? "Term 1" : term === "term2" ? "Term 2" : "Term 3"}
                    </option>
                  ))}
                </select>
                <FaCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.admissionTerm && <p className={errorClass}>⚠️ {errors.admissionTerm}</p>}
            </div>

            {/* Level Dropdown */}
            <div>
              <label className={labelClass}>
                Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className={selectClass("level")}
                >
                  <option value="">Select Level</option>
                  {levelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FaSchool className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.level && <p className={errorClass}>⚠️ {errors.level}</p>}
            </div>

            {/* Class Dropdown */}
            <div>
              <label className={labelClass}>
                Class <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  className={selectClass("className")}
                  disabled={!formData.level}
                >
                  <option value="">Select Class</option>
                  {availableClassOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FaBuilding className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.className && <p className={errorClass}>⚠️ {errors.className}</p>}
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information Section */}
        <div className="space-y-4 md:space-y-6">
          <div className={sectionHeaderClass}>
            <FaUserFriends className="text-[#ffa301]" />
            <span>Parent/Guardian Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Parent First Name */}
            <div>
              <label className={labelClass}>
                Parent First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parentFirstName"
                value={formData.parentFirstName}
                onChange={handleChange}
                placeholder="Enter parent first name"
                className={inputClass("parentFirstName")}
                maxLength={50}
              />
              {errors.parentFirstName && <p className={errorClass}>⚠️ {errors.parentFirstName}</p>}
            </div>

            {/* Parent Last Name */}
            <div>
              <label className={labelClass}>
                Parent Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parentLastName"
                value={formData.parentLastName}
                onChange={handleChange}
                placeholder="Enter parent last name"
                className={inputClass("parentLastName")}
                maxLength={50}
              />
              {errors.parentLastName && <p className={errorClass}>⚠️ {errors.parentLastName}</p>}
            </div>

            {/* Parent Email */}
            <div>
              <label className={labelClass}>
                Parent Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  placeholder="parent@example.com"
                  className={`${inputClass("parentEmail")} pl-10`}
                  maxLength={100}
                />
              </div>
              {errors.parentEmail && <p className={errorClass}>⚠️ {errors.parentEmail}</p>}
            </div>

            {/* Parent Phone */}
            <div>
              <label className={labelClass}>
                Parent Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="0241234567"
                  className={`${inputClass("parentPhone")} pl-10`}
                />
              </div>
              {errors.parentPhone && <p className={errorClass}>⚠️ {errors.parentPhone}</p>}
            </div>
          </div>
        </div>

        {/* Student Photo Section */}
        <div className="space-y-4 md:space-y-6">
          <div className={sectionHeaderClass}>
            <FaImage className="text-[#ffa301]" />
            <span>Student Photo</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Photo Preview */}
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Student preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <FaUser className="text-5xl md:text-6xl text-gray-400 mx-auto mb-2 md:mb-4" />
                  <p className="text-gray-500 text-xs md:text-sm">No photo selected</p>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3 md:space-y-4">
              <div>
                <label className={labelClass}>
                  Upload Photo <span className="text-red-500">*</span>
                </label>
                <label className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-[#052954] text-white rounded-xl cursor-pointer hover:bg-[#052954]/90 transition text-sm md:text-base">
                  <FaImage />
                  Choose File
                  <input
                    type="file"
                    name="studentPhoto"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
                {formData.studentPhoto && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.studentPhoto.name}
                  </p>
                )}
                {errors.studentPhoto && (
                  <p className={errorClass}>⚠️ {errors.studentPhoto}</p>
                )}
              </div>
              
              <div className="text-xs md:text-sm text-gray-600">
                <p className="font-medium mb-1">Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>File formats: JPG, PNG, GIF</li>
                  <li>Maximum size: 5MB</li>
                  <li>Recommended: Square photo, clear face visible</li>
                  <li>Passport-size recommended</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 md:pt-8 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#ffa301] to-[#ffb745] text-[#052954] font-semibold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <FaSave className="text-base md:text-lg" />
            {loading ? "Processing Admission..." : "Complete Admission"}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="flex-1 border-2 border-[#052954] text-[#052954] font-semibold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 md:gap-3 hover:bg-[#052954]/5 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <FaRedo className="text-base md:text-lg" />
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentAdmission;