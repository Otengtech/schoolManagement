import React, { useState, useEffect } from "react";
import {
  FaUserTie,
  FaEnvelope,
  FaImage,
  FaSave,
  FaRedo,
  FaMars,
  FaVenus,
  FaGenderless,
  FaBriefcase,
  FaChevronDown,
  FaPhone,
  FaCalendar,
  FaGraduationCap,
  FaBook,
  FaSchool,
  FaUserGraduate,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../../../services/api";

const initialState = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  age: "",
  religion: "",
  qualification: "",
  subject: "",
  department: "",
  phone: "",
  email: "",
  teacherPhoto: null
};

const TeacherForm = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(initialState);

  /* ---------------- OPTIONS ---------------- */
  const genderOptions = [
    { value: "male", label: "Male", icon: <FaMars /> },
    { value: "female", label: "Female", icon: <FaVenus /> },
    { value: "other", label: "Other", icon: <FaGenderless /> },
  ];

  const religions = ["Christianity", "Islam", "Hinduism", "Buddhism", "Traditional", "Other"];
  const qualifications = ["B.A", "B.Sc", "B.Ed", "M.A", "M.Sc", "M.Ed", "PhD", "Diploma", "Certificate"];
  const subjects = [
    "Mathematics", "English", "Science", "Physics", "Chemistry", "Biology",
    "ICT", "History", "Geography", "Economics", "Business Studies",
    "Accounting", "French", "Spanish", "Physical Education", "Music", "Art"
  ];
  const departments = ["Science", "Arts", "Languages", "ICT", "Commercial", "Technical"];

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "teacherPhoto") {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
          return;
        }
        setForm((p) => ({ ...p, teacherPhoto: file }));
        setPreview(URL.createObjectURL(file));
      }
      return;
    }

    if (name === "dateOfBirth") {
      const dob = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

      setForm((p) => ({ ...p, dateOfBirth: value, age: age.toString() }));
      return;
    }

    if (name === "employmentDate") {
      const empDate = new Date(value);
      const today = new Date();
      let experience = today.getFullYear() - empDate.getFullYear();
      const m = today.getMonth() - empDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < empDate.getDate())) experience--;
      
      setForm((p) => ({ ...p, employmentDate: value, experience: experience > 0 ? experience.toString() : "0" }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!form.firstName || !form.lastName || !form.email || !form.phone) {
        toast.error("Please fill in all required fields");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please login.");
        return;
      }

      // Prepare form data
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== undefined) {
          if (key === "teacherPhoto" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      console.log("Submitting teacher data...");
      
      await api.post("/teachers", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ Teacher registered successfully!");
      handleReset();
    } catch (error) {
      console.error("Registration error:", error.response || error);
      const message = error.response?.data?.message || "Failed to register teacher";
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialState);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:outline-none transition-all duration-200";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 rounded-2xl shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#052954] mb-2 flex items-center gap-2">
          <FaUserTie /> Teacher Registration
        </h2>
        <p className="text-gray-600">
          Fill in all required information to register a new teacher
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PERSONAL INFORMATION */}
        <Section title="Personal Information" icon={<FaUserTie className="text-[#052954]" />}>
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              placeholder="Enter first name"
              className={inputClass}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              placeholder="Enter last name"
              className={inputClass}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Gender *</label>
            <div className="flex gap-2">
              {genderOptions.map((g) => (
                <label
                  key={g.value}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border cursor-pointer transition-all ${
                    form.gender === g.value
                      ? "bg-[#052954] text-white border-[#052954]"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g.value}
                    checked={form.gender === g.value}
                    onChange={handleChange}
                    className="hidden"
                    required
                  />
                  {g.icon} {g.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Date of Birth *</label>
            <div className="relative">
              <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                className={`${inputClass} pl-10`}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Age</label>
            <input
              type="text"
              name="age"
              value={form.age}
              placeholder="Auto-calculated"
              className={`${inputClass} bg-gray-50`}
              readOnly
            />
          </div>

          <div>
            <label className={labelClass}>Religion</label>
            <Select
              name="religion"
              value={form.religion}
              options={religions}
              onChange={handleChange}
              placeholder="Select religion"
            />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              placeholder="Enter full address"
              className={inputClass}
              onChange={handleChange}
            />
          </div>
        </Section>

        {/* PROFESSIONAL INFORMATION */}
        <Section title="Professional Information" icon={<FaBriefcase className="text-[#052954]" />}>
          <div>
            <label className={labelClass}>Qualification *</label>
            <Select
              name="qualification"
              value={form.qualification}
              options={qualifications}
              onChange={handleChange}
              placeholder="Select qualification"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Department *</label>
            <Select
              name="department"
              value={form.department}
              options={departments}
              onChange={handleChange}
              placeholder="Select department"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Subject *</label>
            <Select
              name="subject"
              value={form.subject}
              options={subjects}
              onChange={handleChange}
              placeholder="Select subject"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Employment Date *</label>
            <div className="relative">
              <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="employmentDate"
                value={form.employmentDate}
                className={`${inputClass} pl-10`}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Years of Experience</label>
            <input
              type="text"
              name="experience"
              value={form.experience}
              placeholder="Auto-calculated"
              className={`${inputClass} bg-gray-50`}
              readOnly
            />
          </div>

          <div>
            <label className={labelClass}>Salary ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="salary"
                value={form.salary}
                placeholder="Enter salary"
                className={`${inputClass} pl-8`}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </Section>

        {/* CONTACT INFORMATION */}
        <Section title="Contact Information" icon={<FaEnvelope className="text-[#052954]" />}>
          <div>
            <label className={labelClass}>Email Address *</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                placeholder="teacher@school.edu"
                className={`${inputClass} pl-10`}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone Number *</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                placeholder="+1234567890"
                className={`${inputClass} pl-10`}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Emergency Contact</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="emergencyContact"
                value={form.emergencyContact}
                placeholder="Emergency contact number"
                className={`${inputClass} pl-10`}
                onChange={handleChange}
              />
            </div>
          </div>
        </Section>

        {/* PHOTO UPLOAD */}
        <Section title="Teacher Photo" icon={<FaImage className="text-[#052954]" />}>
          <div className="col-span-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
              {preview ? (
                <img
                  src={preview}
                  alt="Teacher Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <FaUserTie className="text-6xl text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No photo selected</p>
                  <p className="text-gray-400 text-xs">Max size: 5MB</p>
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="inline-flex items-center gap-2 bg-gradient-to-r from-[#052954] to-blue-700 text-white px-6 py-3 rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-md">
                <FaImage />
                Choose Profile Photo
                <input
                  type="file"
                  name="teacherPhoto"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              <p className="text-gray-500 text-sm mt-2">
                Recommended: Square photo, 500x500px, JPG/PNG format
              </p>
            </div>
          </div>
        </Section>

        {/* FORM ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#ffa301] to-orange-500 hover:opacity-90 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <FaSave />
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Registering...
              </span>
            ) : (
              "Register Teacher"
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            <FaRedo />
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

/* ---------------- REUSABLE COMPONENTS ---------------- */

const Section = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center gap-3 font-semibold text-[#052954] mb-6 pb-3 border-b border-gray-100">
      <span className="text-xl">{icon}</span>
      <h3 className="text-lg">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

const Select = ({ name, value, options, onChange, placeholder, required }) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-gray-300 appearance-none bg-white focus:ring-2 focus:ring-[#052954]/30 focus:outline-none transition-all"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

export default TeacherForm;