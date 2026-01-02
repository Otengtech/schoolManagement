import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { validateLoginForm } from "../utils/validators";
import {
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaKey,
  FaShieldAlt,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserFriends,
  FaExclamationCircle,
  FaCrown,
  FaCheckCircle
} from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        if (!value) return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
      
      case 'password':
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      
      case 'role':
        if (!value) return "Please select a role";
        return "";
      
      default:
        return "";
    }
  };

  const handleBlur = (field) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const validation = validateLoginForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });
      
      login(data);
      
      // Show success message
      toast.success(`Welcome back, ${data.user.name || data.user.email}!`);
      
      navigate(`/${data.user.role}`);
      
    } catch (err) {
      // Handle different types of errors
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Invalid email or password";
            break;
          case 403:
            errorMessage = "Access denied for this role";
            break;
          case 404:
            errorMessage = "User not found";
            break;
          case 500:
            errorMessage = "Server error. Please try again later";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection";
      }
      
      toast.error(errorMessage);
      
      // Set specific field errors if available from API
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (formData.role) {
      case "admin":
        return <FaShieldAlt className="text-[#ffa301]" />;
      case "teacher":
        return <FaChalkboardTeacher className="text-[#ffa301]" />;
      case "student":
        return <FaUserGraduate className="text-[#ffa301]" />;
      case "parent":
        return <FaUserFriends className="text-[#ffa301]" />;
      default:
        return <FaUserTag className="text-[#ffa301]" />;
    }
  };

  const getRoleBenefits = () => {
    switch (formData.role) {
      case "admin":
        return [
          "System management",
          "User administration",
          "Analytics dashboard",
          "Security configuration"
        ];
      case "teacher":
        return [
          "Class management",
          "Grade assignments",
          "Student progress",
          "Lesson planning"
        ];
      case "student":
        return [
          "Course materials",
          "Assignment submission",
          "Grade tracking",
          "Progress monitoring"
        ];
      case "parent":
        return [
          "Child progress tracking",
          "Attendance monitoring",
          "Communication portal",
          "Fee management"
        ];
      default:
        return [];
    }
  };

  return (
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
                <h1 className="text-3xl md:text-5xl font-bold">Welcome Back</h1>
              </div>
              
              <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                Select your role and log in to access your personalized dashboard.
              </p>

              {/* Role Preview Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    {getRoleIcon()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg capitalize text-gray-200">{formData.role} Dashboard</h3>
                    <p className="text-xs text-white">Access all {formData.role} features</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-white">
                  {getRoleBenefits().map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-blue-200 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-[#ffa301]">1,234</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-blue-200 mb-1">Today's Logins</p>
                  <p className="text-2xl font-bold text-[#ffa301]">89</p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <FaUserTag className="text-xs" />
                  </div>
                  <span className="text-xs">Multi-role Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <FaLock className="text-xs" />
                  </div>
                  <span className="text-xs">Secure Login</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Login Form */}
          <div className="px-6 py-10 md:px-8 md:p-8 md:overflow-y-auto">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-1">Login</h2>
                <p className="text-sm text-gray-600">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* ROLE SELECTION */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <FaUserTag className="text-[#ffa301]" />
                      Select Role
                    </div>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: "admin", label: "Admin", icon: <FaShieldAlt /> },
                      { value: "teacher", label: "Teacher", icon: <FaChalkboardTeacher /> },
                      { value: "student", label: "Student", icon: <FaUserGraduate /> },
                      { value: "parent", label: "Parent", icon: <FaUserFriends /> }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('role', option.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                          formData.role === option.value
                            ? "border-[#ffa301] bg-gradient-to-br from-yellow-50 to-yellow-100 text-[#ffa301]"
                            : "border-gray-200 hover:border-[#ffa301]/50 hover:bg-yellow-50/50 text-gray-600"
                        } ${errors.role ? 'border-red-300' : ''}`}
                      >
                        <div className={`text-lg mb-2 ${
                          formData.role === option.value 
                            ? "text-[#ffa301]" 
                            : "text-gray-500"
                        }`}>
                          {option.icon}
                        </div>
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
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
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                      }`}
                      placeholder="you@example.com"
                    />
                    <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      errors.email ? 'text-red-400' : 'text-gray-400'
                    }`} />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
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
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                      }`}
                      placeholder="••••••••"
                    />
                    <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      errors.password ? 'text-red-400' : 'text-gray-400'
                    }`} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* REMEMBER ME & FORGOT PASSWORD */}
                <div className="flex justify-between items-start sm:items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#ffa301] focus:ring-[#ffa301] w-4 h-4"
                    />
                    <span className="text-xs text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="flex items-center gap-1 text-xs text-[#ffa301] hover:text-[#e59400] hover:underline transition-colors"
                  >
                    <FaKey className="text-xs" />
                    Forgot password?
                  </button>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 text-sm ${
                      loading
                        ? "bg-[#ffa301]/70 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#052954] to-[#041e42] hover:opacity-90 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="text-sm" />
                        Login to Dashboard
                      </>
                    )}
                  </button>
                  
                  <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-[#ffa301] hover:text-[#e59400] font-medium hover:underline"
                      >
                        Contact Admin
                      </button>
                    </p>
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

export default Login;