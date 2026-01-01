import React, { useState } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaImage,
  FaSave,
  FaRedo,
  FaChild,
} from "react-icons/fa";

const ParentAdmission = () => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    childName: "",
    childClass: "",
    parentPhoto: null,
  });

  const genderOptions = ["male", "female", "other"];
  const classOptions = ["JHS 1", "JHS 2", "JHS 3"];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "parentPhoto" && files[0]) {
      setFormData({ ...formData, parentPhoto: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log("Submitted Data:", formData);
      alert("Parent admitted successfully!");
      setLoading(false);
      handleReset();
    }, 1200);
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      childName: "",
      childClass: "",
      parentPhoto: null,
    });
    setPreviewImage(null);
  };

  const input =
    "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition";

  const select =
    "appearance-none w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none cursor-pointer";

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-4 md:p-8 w-full mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
          Parent Admission Form
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete all required fields to admit a new parent
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ===== PERSONAL INFO ===== */}
        <Section title="Parent Information" icon={<FaUser />}>
          <input
            name="firstName"
            placeholder="First Name *"
            required
            className={input}
            onChange={handleChange}
          />
          <input
            name="lastName"
            placeholder="Last Name *"
            required
            className={input}
            onChange={handleChange}
          />
          <select
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
            className={select}
          >
            <option value="">Select Gender *</option>
            {genderOptions.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </select>
          <input
            name="phone"
            placeholder="Phone Number *"
            required
            className={input}
            onChange={handleChange}
          />
          <input
            name="email"
            placeholder="Email Address"
            type="email"
            className={input}
            onChange={handleChange}
          />
          <input
            name="address"
            placeholder="Address"
            className={input}
            onChange={handleChange}
          />
        </Section>

        {/* ===== CHILD INFO ===== */}
        <Section title="Child Information" icon={<FaChild />}>
          <input
            name="childName"
            placeholder="Child's Name *"
            required
            className={input}
            onChange={handleChange}
          />
          <select
            name="childClass"
            required
            value={formData.childClass}
            onChange={handleChange}
            className={select}
          >
            <option value="">Select Class *</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Section>

        {/* ===== PHOTO ===== */}
        <Section title="Parent Photo" icon={<FaImage />}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-6xl text-gray-400" />
              )}
            </div>

            <label className="cursor-pointer bg-blue-700 text-white px-6 py-3 rounded-xl">
              Upload Photo
              <input
                type="file"
                hidden
                name="parentPhoto"
                accept="image/*"
                onChange={handleChange}
              />
            </label>
          </div>
        </Section>

        {/* ===== ACTIONS ===== */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold flex justify-center gap-2"
          >
            <FaSave /> {loading ? "Saving..." : "Complete Admission"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex-1 border border-green-600 text-green-600 py-4 rounded-xl flex justify-center gap-2"
          >
            <FaRedo /> Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

/* ===== REUSABLE SECTION COMPONENT ===== */
const Section = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-4 text-blue-900 font-semibold">
      {icon} {title}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{children}</div>
  </div>
);

export default ParentAdmission;
