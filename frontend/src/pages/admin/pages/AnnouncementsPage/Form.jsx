import React, { useState } from "react";
import {
  FaBullhorn,
  FaSave,
  FaRedo,
  FaImage,
  FaFileAlt,
} from "react-icons/fa";

const AnnouncementForm = () => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    author: "",
    image: null,
  });

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.author.trim()) newErrors.author = "Author is required";
    
    // Date validation - ensure not a past date (optional)
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.date && selectedDate < today) {
      newErrors.date = "Date cannot be in the past";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "image" && files[0]) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(files[0].type)) {
        setErrors(prev => ({ ...prev, image: "Please upload a valid image (JPEG, PNG, GIF, WebP)" }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size should be less than 5MB" }));
        return;
      }

      setFormData({ ...formData, image: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
      setErrors(prev => ({ ...prev, image: "" }));
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fill in all required fields correctly");
      return;
    }
    
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Announcement Submitted:", formData);
      
      // Create FormData for actual file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // In real app, you would do:
      // fetch('/api/announcements', {
      //   method: 'POST',
      //   body: submitData
      // })
      
      alert("Announcement submitted successfully!");
      handleReset();
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      author: "",
      image: null,
    });
    setPreviewImage(null);
    setErrors({});
    
    // Revoke object URL to prevent memory leaks
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
  };

  /* ---------------- STYLES ---------------- */
  const smallInput =
    "w-full px-4 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none transition";

  const largeTextarea =
    "w-full px-4 py-6 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none transition resize-none";

  const errorInput =
    "w-full px-4 py-2 rounded-xl border border-red-500 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 outline-none transition";

  const errorTextarea =
    "w-full px-4 py-6 rounded-xl border border-red-500 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 outline-none transition resize-none";

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-10 w-full mx-auto">
      {/* ===== HEADER ===== */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#052954] flex items-center gap-2">
          <FaBullhorn /> Post a New Announcement
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details to post a new announcement
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ===== ANNOUNCEMENT INFO ===== */}
        <Section title="Announcement Details" icon={<FaFileAlt />}>
          <div className="space-y-2">
            <input
              name="title"
              placeholder="Announcement Title *"
              value={formData.title}
              required
              className={errors.title ? errorInput : smallInput}
              onChange={handleChange}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2 lg:col-span-2">
            <textarea
              name="description"
              placeholder="Announcement Description *"
              value={formData.description}
              rows="8"
              required
              className={errors.description ? errorTextarea : largeTextarea}
              onChange={handleChange}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="date"
              name="date"
              value={formData.date}
              required
              min={new Date().toISOString().split('T')[0]}
              className={errors.date ? errorInput : smallInput}
              onChange={handleChange}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <input
              name="author"
              placeholder="Posted By *"
              value={formData.author}
              required
              className={errors.author ? errorInput : smallInput}
              onChange={handleChange}
            />
            {errors.author && (
              <p className="text-red-500 text-xs mt-1">{errors.author}</p>
            )}
          </div>
        </Section>

        {/* ===== IMAGE UPLOAD ===== */}
        <Section title="Announcement Image" icon={<FaImage />}>
          <div className="flex flex-col sm:flex-row items-start gap-6 lg:col-span-4">
            <div className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaImage className="text-6xl text-gray-400" />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <label className="cursor-pointer inline-block bg-[#052954] text-white px-6 py-3 rounded-xl hover:bg-[#052954]/90 transition">
                <input
                  type="file"
                  hidden
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                />
                Upload Image
              </label>
              <p className="text-sm text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
              </p>
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
              {formData.image && (
                <p className="text-sm text-green-600">
                  ✓ Selected: {formData.image.name}
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* ===== ACTIONS ===== */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#ffa301] text-[#052954] py-4 rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-[#ff9800] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave /> {loading ? "Posting..." : "Post Announcement"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex-1 border border-[#052954] text-[#052954] py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-100 transition"
          >
            <FaRedo /> Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

/* ===== REUSABLE COMPONENT ===== */
const Section = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-4 text-[#052954] font-semibold">
      {icon} {title}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{children}</div>
  </div>
);

export default AnnouncementForm;