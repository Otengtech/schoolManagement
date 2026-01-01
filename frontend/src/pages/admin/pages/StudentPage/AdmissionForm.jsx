import React, { useState } from "react";
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
  FaBirthdayCake,
  FaPhone,
  FaHome,
  FaIdCard,
  FaFlag
} from "react-icons/fa";

const StudentAdmission = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    age: "",
    religion: "",
    nationality: "",
    studentId: "",
    level: "",
    course: "",
    parentName: "",
    parentContact: "",
    email: "",
    phone: "",
    address: "",
    studentPhoto: null,
  });

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_URI || "http://localhost:5000/api";

  // Options Data
  const genderOptions = [
    { value: "male", label: "Male", icon: <FaMars className="inline mr-2" /> },
    { value: "female", label: "Female", icon: <FaVenus className="inline mr-2" /> },
    { value: "other", label: "Other", icon: <FaGenderless className="inline mr-2" /> },
  ];

  const religionOptions = [
    "Christianity",
    "Islam",
    "Traditional",
    "Hinduism",
    "Buddhism",
    "Other"
  ];

  const nationalityOptions = [
    "Ghanaian",
    "Nigerian",
    "Ivorian",
    "American",
    "British",
    "Canadian",
    "Indian",
    "Chinese",
    "Other"
  ];

  // Event Handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "studentPhoto" && files?.[0]) {
      setFormData({ ...formData, studentPhoto: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
      if (errors.studentPhoto) setErrors({ ...errors, studentPhoto: "" });
      return;
    }

    if (name === "dateOfBirth") {
      const birthYear = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      setFormData({ 
        ...formData, 
        dateOfBirth: value, 
        age: age.toString() 
      });
      if (errors.dateOfBirth || errors.age) {
        setErrors({ ...errors, dateOfBirth: "", age: "" });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleGenderChange = (value) => {
    const updatedGender = formData.gender.includes(value)
      ? formData.gender.filter((g) => g !== value)
      : [...formData.gender, value];
    
    setFormData({ ...formData, gender: updatedGender });
    if (errors.gender) setErrors({ ...errors, gender: "" });
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (formData.gender.length === 0) newErrors.gender = "Please select gender";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.age) newErrors.age = "Age is required";
    if (!formData.religion) newErrors.religion = "Religion is required";
    if (!formData.nationality) newErrors.nationality = "Nationality is required";
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    if (!formData.level.trim()) newErrors.level = "Level is required";
    if (!formData.course.trim()) newErrors.course = "Course is required";
    if (!formData.parentName.trim()) newErrors.parentName = "Parent name is required";
    if (!formData.parentContact.trim()) newErrors.parentContact = "Parent contact is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid phone number";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.studentPhoto) newErrors.studentPhoto = "Student photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fix all errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "gender") {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      });

      const response = await axios.post(
        `${API_BASE_URL}/students/admit`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Student admitted successfully!");
        handleReset();
      } else {
        throw new Error(response.data.message || "Admission failed");
      }
    } catch (error) {
      console.error("Admission error:", error);
      alert(error.response?.data?.message || "Failed to admit student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Form Reset
  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: [],
      dateOfBirth: "",
      age: "",
      religion: "",
      nationality: "",
      studentId: "",
      level: "",
      course: "",
      parentName: "",
      parentContact: "",
      email: "",
      phone: "",
      address: "",
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

  const checkboxClass = (isSelected) =>
    `flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition ${
      isSelected
        ? "bg-[#052954] text-white border-[#052954]"
        : "hover:bg-[#052954]/5 border-gray-300"
    }`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-2";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#052954] flex items-center gap-3">
          <FaUser className="text-[#ffa301]" />
          Student Admission Form
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#052954] border-b pb-3">
            <FaUser className="text-[#ffa301]" />
            <span>Personal Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              />
              {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
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
              />
              {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
            </div>

            {/* Gender - Checkboxes */}
            <div className="md:col-span-2">
  <label className={labelClass}>
    Gender <span className="text-red-500">*</span>
  </label>

  <div className="flex flex-col sm:flex-row gap-4 mt-2">
    {genderOptions.map((option) => (
      <label
        key={option.value}
        className="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="radio"
          name="gender"
          value={option.value}
          checked={formData.gender === option.value}
          onChange={() =>
            setFormData({ ...formData, gender: option.value })
          }
          className="w-4 h-4 accent-[#052954]"
        />
        {option.icon}
        <span>{option.label}</span>
      </label>
    ))}
  </div>

  {errors.gender && (
    <p className={errorClass}>{errors.gender}</p>
  )}
</div>


            {/* Date of Birth */}
            <div>
              <label className={labelClass}>
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClass("dateOfBirth")}
                />
              </div>
              {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth}</p>}
            </div>

            {/* Age */}
            <div>
              <label className={labelClass}>
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                readOnly
                placeholder="Auto-calculated"
                className={`${inputClass("age")} bg-gray-50`}
              />
              {errors.age && <p className={errorClass}>{errors.age}</p>}
            </div>

            {/* Religion Dropdown */}
            <div>
              <label className={labelClass}>
                Religion <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className={selectClass("religion")}
                >
                  <option value="">Select Religion</option>
                  {religionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.religion && <p className={errorClass}>{errors.religion}</p>}
            </div>

            {/* Nationality Dropdown */}
            <div>
              <label className={labelClass}>
                Nationality <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className={selectClass("nationality")}
                >
                  <option value="">Select Nationality</option>
                  {nationalityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FaFlag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.nationality && <p className={errorClass}>{errors.nationality}</p>}
            </div>
          </div>
        </div>

        {/* Academic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#052954] border-b pb-3">
            <FaBook className="text-[#ffa301]" />
            <span>Academic Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  placeholder="Enter student ID"
                  className={inputClass("studentId")}
                />
                <FaIdCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.studentId && <p className={errorClass}>{errors.studentId}</p>}
            </div>

            {/* Level */}
            <div>
              <label className={labelClass}>
                Level <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="e.g., JHS 1, Grade 10"
                className={inputClass("level")}
              />
              {errors.level && <p className={errorClass}>{errors.level}</p>}
            </div>

            {/* Course */}
            <div>
              <label className={labelClass}>
                Course <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g., Science, Arts"
                className={inputClass("course")}
              />
              {errors.course && <p className={errorClass}>{errors.course}</p>}
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#052954] border-b pb-3">
            <FaUserFriends className="text-[#ffa301]" />
            <span>Parent/Guardian Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parent Name */}
            <div>
              <label className={labelClass}>
                Parent/Guardian Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Enter full name"
                className={inputClass("parentName")}
              />
              {errors.parentName && <p className={errorClass}>{errors.parentName}</p>}
            </div>

            {/* Parent Contact */}
            <div>
              <label className={labelClass}>
                Parent Contact <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="parentContact"
                  value={formData.parentContact}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={inputClass("parentContact")}
                />
                <FaPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.parentContact && <p className={errorClass}>{errors.parentContact}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#052954] border-b pb-3">
            <FaEnvelope className="text-[#ffa301]" />
            <span>Contact Information</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className={labelClass}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass("email")}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={inputClass("phone")}
              />
              {errors.phone && <p className={errorClass}>{errors.phone}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className={labelClass}>
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows="3"
                className={inputClass("address")}
              />
              {errors.address && <p className={errorClass}>{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Student Photo Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-xl font-semibold text-[#052954] border-b pb-3">
            <FaImage className="text-[#ffa301]" />
            <span>Student Photo</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo Preview */}
            <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Student preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No photo selected</p>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-4">
              <div>
                <label className={labelClass}>
                  Upload Photo <span className="text-red-500">*</span>
                </label>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#052954] text-white rounded-xl cursor-pointer hover:bg-[#052954]/90 transition">
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
                  <p className={errorClass}>{errors.studentPhoto}</p>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>File formats: JPG, PNG, GIF</li>
                  <li>Maximum size: 5MB</li>
                  <li>Recommended: Square photo, clear face visible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#ffa301] to-[#ffb745] text-[#052954] font-semibold py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="text-lg" />
            {loading ? "Processing Admission..." : "Complete Admission"}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="flex-1 border-2 border-[#052954] text-[#052954] font-semibold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#052954]/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRedo className="text-lg" />
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentAdmission;