import React, { useState } from "react";
import axios from "axios";
import {
  FaUserTie,
  FaBirthdayCake,
  FaPhone,
  FaEnvelope,
  FaImage,
  FaSave,
  FaRedo,
  FaIdBadge,
  FaBook
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    religion: "",
    email: "",
    subject: "",
    phone: "",
    bio: "",
    teacherPhoto: null
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) submitData.append(key, formData[key]);
      });

      await axios.post("https://api.yourdomain.com/teachers", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Teacher added successfully!");
      handleReset();
    } catch (error) {
      toast.error("Failed to save teacher data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      religion: "",
      email: "",
      subject: "",
      phone: "",
      bio: "",
      teacherPhoto: null
    });
    setPreviewImage(null);
  };

  const genderOptions = ["male", "female", "other"];
  const religionOptions = ["Christianity", "Islam", "Traditional", "Other"];
  const subjectOptions = ["Mathematics", "English", "Science", "ICT", "Social Studies"];

  return (
    <div className="p-6 bg-gray-200 h-full">
      <ToastContainer />

      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Add New Teacher</h2>
          <p className="text-indigo-100">Teacher registration form</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Teacher ID */}
          <div>
            <label className="font-medium text-gray-700">
              Teacher ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaIdBadge className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="teacherId"
                required
                value={formData.teacherId}
                onChange={handleChange}
                className="pl-10 w-full p-3 border rounded-lg"
                placeholder="TCH-001"
              />
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="font-medium text-gray-700">First Name *</label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="font-medium text-gray-700">Last Name *</label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="font-medium text-gray-700">Gender *</label>
            <select
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select Gender</option>
              {genderOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="font-medium text-gray-700">Date of Birth *</label>
            <div className="relative">
              <FaBirthdayCake className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="pl-10 w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-medium text-gray-700">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="font-medium text-gray-700">Subject *</label>
            <div className="relative">
              <FaBook className="absolute left-3 top-3 text-gray-400" />
              <select
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="pl-10 w-full p-3 border rounded-lg"
              >
                <option value="">Select Subject</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="font-medium text-gray-700">Phone</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10 w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="font-medium text-gray-700">Short Bio</label>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
              placeholder="Brief teacher profile..."
            />
          </div>

          {/* Photo */}
          <div className="md:col-span-2 flex items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <FaUserTie className="text-5xl text-gray-400" />
              )}
            </div>

            <label className="cursor-pointer flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-lg border">
              <FaImage />
              Upload Photo
              <input
                type="file"
                name="teacherPhoto"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg"
            >
              <FaSave /> {loading ? "Saving..." : "Save Teacher"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 py-3 rounded-lg"
            >
              <FaRedo /> Reset
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
