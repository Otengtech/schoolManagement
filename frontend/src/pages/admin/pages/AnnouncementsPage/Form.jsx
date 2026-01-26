import React, { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaSave,
  FaRedo,
  FaFileAlt,
  FaUsers,
  FaEnvelope,
  FaSms,
  FaMobileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserFriends,
  FaGlobeAmericas,
  FaUserTie,
} from "react-icons/fa";
import api from "../../../../services/api";

const AnnouncementForm = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState(null);

  // Initial form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    // author: "",
    // Recipients section - fixed structure
    recipients: {
      roles: [], // Array of strings like ["parent", "teacher"]
      specificUsers: [], // Array of specific user IDs or emails
    },
    // Channels section - Email always true by default
    channels: {
      email: true, // Always true as per requirement
      sms: false,
      inApp: true,
    },
  });

  // Get token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Available roles for selection
  const availableRoles = [
    { id: "parent", label: "Parent", icon: <FaUserFriends /> },
    { id: "teacher", label: "Teacher", icon: <FaChalkboardTeacher /> },
    { id: "student", label: "Student", icon: <FaUserGraduate /> },
    { id: "all", label: "Everyone", icon: <FaGlobeAmericas /> },
  ];

  // Channel options
  const channelOptions = [
    { id: "email", label: "Email", icon: <FaEnvelope />, description: "Send via email", alwaysOn: true },
    { id: "sms", label: "SMS", icon: <FaSms />, description: "Send text message" },
    { id: "inApp", label: "In-App", icon: <FaMobileAlt />, description: "Show in app notifications" },
  ];

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    // if (!formData.author.trim()) newErrors.author = "Author is required";
    
    // Recipients validation - at least one role selected
    if (formData.recipients.roles.length === 0) {
      newErrors.recipients = "Please select at least one recipient group";
    }
    
    // Date validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.date && selectedDate < today) {
      newErrors.date = "Date cannot be in the past";
    }
    
    // Token validation
    if (!token) {
      newErrors.token = "Please login to post announcements";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Handle regular inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle role selection
  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const currentRoles = [...prev.recipients.roles];
      const index = currentRoles.indexOf(roleId);
      
      if (index > -1) {
        // Remove role if already selected
        currentRoles.splice(index, 1);
      } else {
        // Add role if not selected
        // If "all" is selected, clear other selections
        if (roleId === "all") {
          currentRoles.length = 0;
          currentRoles.push("all");
        } else {
          // Remove "all" if selecting specific roles
          const allIndex = currentRoles.indexOf("all");
          if (allIndex > -1) {
            currentRoles.splice(allIndex, 1);
          }
          currentRoles.push(roleId);
        }
      }
      
      return {
        ...prev,
        recipients: {
          ...prev.recipients,
          roles: currentRoles
        }
      };
    });
    
    // Clear recipients error if any roles are selected
    if (errors.recipients) {
      setErrors(prev => ({ ...prev, recipients: "" }));
    }
  };

  // Handle channel toggle (except email which is always true)
  const handleChannelToggle = (channelId) => {
    if (channelId === "email") return; // Email cannot be toggled off
    
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelId]: !prev.channels[channelId]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    
    if (!validateForm()) {
      // Show first error message
      const firstError = Object.values(errors)[0];
      if (firstError) {
        alert(firstError);
      }
      return;
    }
    
    setLoading(true);

    try {
      // Prepare data for API - match the exact structure expected by backend
      const submitData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        // author: formData.author,
        recipients: {
          roles: formData.recipients.roles,
          specificUsers: formData.recipients.specificUsers
        },
        channels: formData.channels,
      };

      console.log("Submitting data:", submitData); // For debugging

      const API_BASE_URL = import.meta.env.VITE_API_URI || "https://school-management-system-backend-three.vercel.app";

      const response = await fetch(`${API_BASE_URL}/announce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to post announcement. Status: ${response.status}`);
      }

      // Success
      setSuccessMessage("Announcement posted successfully!");
      
      // Show success details
      const selectedRoles = availableRoles
        .filter(role => formData.recipients.roles.includes(role.id))
        .map(role => role.label)
        .join(", ");
      
      const selectedChannels = [
        "Email (always)",
        ...(formData.channels.sms ? ['SMS'] : []),
        ...(formData.channels.inApp ? ['In-App'] : [])
      ].join(", ");
      
      alert(`✅ Announcement posted successfully!\n\nRecipients: ${selectedRoles}\nChannels: ${selectedChannels}`);
      
      handleReset();
      
    } catch (error) {
      console.error("Error posting announcement:", error);
      
      // Handle specific error cases
      if (error.message.includes("401") || error.message.includes("403")) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        setToken(null);
      } else if (error.message.includes("Network")) {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "An error occurred while posting the announcement");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      author: "",
      recipients: {
        roles: [],
        specificUsers: [],
      },
      channels: {
        email: true,
        sms: false,
        inApp: true,
      },
    });
    setErrors({});
    setSuccessMessage("");
  };

  /* ---------------- STYLES ---------------- */
  const smallInput =
    "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none transition";

  const largeTextarea =
    "w-full px-4 py-4 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#052954]/30 focus:border-[#052954] outline-none transition resize-none";

  const errorInput =
    "w-full px-4 py-3 rounded-xl border-2 border-red-500 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 outline-none transition";

  const errorTextarea =
    "w-full px-4 py-4 rounded-xl border-2 border-red-500 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 outline-none transition resize-none";

  // Check if user is logged in
  const isLoggedIn = !!token;

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
        
        {/* Login Status Indicator */}
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${isLoggedIn ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
          {isLoggedIn ? (
            <>
              <FaCheckCircle /> <span className="text-sm font-medium">Logged in</span>
            </>
          ) : (
            <>
              <FaExclamationTriangle /> 
              <span className="text-sm font-medium">Please login to post announcements</span>
            </>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl flex items-center gap-2">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

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
              disabled={loading || !isLoggedIn}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" /> {errors.title}
              </p>
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
              disabled={loading || !isLoggedIn}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" /> {errors.description}
              </p>
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
              disabled={loading || !isLoggedIn}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" /> {errors.date}
              </p>
            )}
          </div>
{/* 
          <div className="space-y-2">
            <input
              name="author"
              placeholder="Posted By *"
              value={formData.author}
              required
              className={errors.author ? errorInput : smallInput}
              onChange={handleChange}
              disabled={loading || !isLoggedIn}
            />
            {errors.author && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="text-xs" /> {errors.author}
              </p>
            )}
          </div> */}
        </Section>

        {/* ===== RECIPIENTS SELECTION ===== */}
        <Section title="Recipients" icon={<FaUsers />}>
          <div className="lg:col-span-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Select who should receive this announcement:</p>
              {errors.recipients && (
                <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
                  <FaExclamationTriangle /> {errors.recipients}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleToggle(role.id)}
                  disabled={loading || !isLoggedIn}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.recipients.roles.includes(role.id)
                      ? "border-[#052954] bg-[#052954]/10"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`text-xl mb-2 ${
                    formData.recipients.roles.includes(role.id)
                      ? "text-[#052954]"
                      : "text-gray-500"
                  }`}>
                    {role.icon}
                  </div>
                  <span className="font-medium text-sm">{role.label}</span>
                  {formData.recipients.roles.includes(role.id) && (
                    <span className="text-xs text-[#052954] mt-1 flex items-center gap-1">
                      <FaCheckCircle /> Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Selected Recipients:
              </p>
              <p className="text-sm text-gray-600">
                {formData.recipients.roles.length === 0 
                  ? "None selected" 
                  : formData.recipients.roles.map(roleId => 
                      availableRoles.find(r => r.id === roleId)?.label
                    ).join(", ")}
              </p>
            </div>
          </div>
        </Section>

        {/* ===== CHANNELS SELECTION ===== */}
        <Section title="Delivery Channels" icon={<FaEnvelope />}>
          <div className="lg:col-span-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Choose how to deliver this announcement:</p>
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-[#052954] mb-1 flex items-center gap-1">
                  <FaExclamationTriangle /> Note
                </p>
                <p>Email notifications are always enabled for announcements to ensure all recipients receive a permanent record.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {channelOptions.map((channel) => (
                <div 
                  key={channel.id} 
                  className={`p-4 rounded-xl border-2 ${
                    formData.channels[channel.id] || channel.alwaysOn
                      ? "border-[#052954] bg-[#052954]/5"
                      : "border-gray-200"
                  } ${channel.alwaysOn ? "cursor-default" : "cursor-pointer"}`}
                  onClick={() => !channel.alwaysOn && !loading && isLoggedIn && handleChannelToggle(channel.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${
                      formData.channels[channel.id] || channel.alwaysOn
                        ? "bg-[#052954] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {channel.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{channel.label}</h3>
                        {channel.alwaysOn && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Always On
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{channel.description}</p>
                      <div className="mt-3 flex items-center">
                        {channel.alwaysOn ? (
                          <div className="text-sm text-[#052954] font-medium flex items-center gap-1">
                            <FaCheckCircle /> Required for announcements
                          </div>
                        ) : (
                          <>
                            <div className={`w-10 h-6 rounded-full mr-2 transition-colors ${
                              formData.channels[channel.id] ? "bg-[#052954]" : "bg-gray-300"
                            }`}>
                              <div className={`w-4 h-4 rounded-full bg-white mt-1 ml-1 transition-transform ${
                                formData.channels[channel.id] ? "transform translate-x-4" : ""
                              }`} />
                            </div>
                            <span className="text-sm">
                              {formData.channels[channel.id] ? "Enabled" : "Disabled"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FaEnvelope /> Delivery Summary:
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="p-1 rounded bg-green-100">
                    <FaEnvelope className="text-green-600 text-xs" />
                  </div>
                  <span>✓ Email: Will be sent to all selected recipients</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className={`p-1 rounded ${formData.channels.sms ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <FaSms className={formData.channels.sms ? "text-green-600 text-xs" : "text-gray-400 text-xs"} />
                  </div>
                  <span>{formData.channels.sms ? "✓ SMS: Will be sent" : "✗ SMS: Will not be sent"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className={`p-1 rounded ${formData.channels.inApp ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <FaMobileAlt className={formData.channels.inApp ? "text-green-600 text-xs" : "text-gray-400 text-xs"} />
                  </div>
                  <span>{formData.channels.inApp ? "✓ In-App: Will show notifications" : "✗ In-App: No notifications"}</span>
                </li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ===== ACTIONS ===== */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading || !isLoggedIn}
            className="flex-1 bg-[#ffa301] text-[#052954] py-4 rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-[#ff9800] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave /> {loading ? "Posting..." : "Post Announcement"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="flex-1 border border-[#052954] text-[#052954] py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRedo /> Reset Form
          </button>
        </div>
        
        {!isLoggedIn && (
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <p className="text-yellow-700 text-sm">
              Please login to post announcements. Your session may have expired.
            </p>
          </div>
        )}
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