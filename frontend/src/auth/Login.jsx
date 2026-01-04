import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
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
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "super-admin",
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    role: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    role: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedRole = localStorage.getItem('rememberedRole');
    
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        role: rememberedRole || 'super-admin'
      }));
      setRememberMe(true);
    }
  }, []);

  // Validation rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
      
      case 'password':
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      
      case 'role':
        if (!value) return "Please select a role";
        if (!['super-admin', 'admin', 'teacher', 'student', 'parent'].includes(value)) {
          return "Please select a valid role";
        }
        return "";
      
      default:
        return "";
    }
  };

  // Handle input changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle field blur
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      role: validateField('role', formData.role),
    };
    
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
      role: true,
    });
    
    return !Object.values(newErrors).some(error => error !== "");
  };

// In Login.jsx handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error('Please fix the form errors');
    return;
  }

  setLoading(true);

  const result = await login(formData.email, formData.password, formData.role);

  if (!result || !result.success) {
    setLoading(false);
    toast.error(result?.error || "Login failed. Please try again.");
    return;
  }

  // Get role from user data
  const userRole = result.user?.role;
  
  // Normalize role if needed
  const normalizedRole = userRole === 'super_admin' ? 'super-admin' : userRole;
  
  // Route based on role
  if (normalizedRole === 'super-admin') {
    navigate('/create-school');
  } else {
    switch (normalizedRole) {
      case 'admin':
        navigate('/admin');
        break;
      case 'teacher':
        navigate('/teacher');
        break;
      case 'student':
        navigate('/student');
        break;
      case 'parent':
        navigate('/parent');
        break;
      default:
        navigate('/login');
    }
  }
  
  setLoading(false);
};

  // Get role icon
  const getRoleIcon = () => {
    switch (formData.role) {
      case "super-admin":
        return <FaCrown className="text-[#ffa301]" />;
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

  // Get role benefits
  const getRoleBenefits = () => {
    switch (formData.role) {
      case "super-admin":
        return [
          "Full system control",
          "Manage all schools",
          "User administration",
          "System configuration"
        ];
      case "admin":
        return [
          "School management",
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

  // Role options for buttons
  const roleOptions = [
    { value: "super-admin", label: "Super", icon: <FaCrown /> },
    { value: "admin", label: "Admin", icon: <FaShieldAlt /> },
    { value: "teacher", label: "Teacher", icon: <FaChalkboardTeacher /> },
    { value: "student", label: "Student", icon: <FaUserGraduate /> },
    { value: "parent", label: "Parent", icon: <FaUserFriends /> }
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full min-h-screen bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full md:h-screen">
          {/* Left Hero Section */}
          <div className="bg-gradient-to-br from-[#052954] to-[#041e42] p-6 md:p-16 text-white relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white shadow-lg">
                    {getRoleIcon()}
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-1">School Management</h1>
                    <p className="text-sm text-blue-100">Secure Login Portal</p>
                  </div>
                </div>
                
                <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                  Select your role and log in to access your personalized dashboard.
                </p>

                <div className="flex flex-col items-start justify-start space-y-2 mb-4">
                  <p className="text-white text-md">
                    Want to create a Super Admin?
                  </p>
                  <Link to="/create-super">
                    <button className="rounded-full px-6 py-2 cursor-pointer bg-[#ffa301]">Create SuperAdmin</button>
                  </Link>
                </div>
                
                {/* Role Benefits Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      {getRoleIcon()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg capitalize text-gray-200">
                        {formData.role.replace('-', ' ')} Dashboard
                      </h3>
                      <p className="text-xs text-white">Access all {formData.role} features</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 text-sm text-white">
                    {getRoleBenefits().map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <FaCheckCircle className="text-[#ffa301] mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Security Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <FaLock className="text-[#ffa301]" />
                  </div>
                  <div>
                    <p className="font-medium">256-bit SSL Encryption</p>
                    <p className="text-xs text-blue-100">Your data is securely protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="px-6 py-10 md:px-8 md:p-8 md:overflow-y-auto">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
                <p className="text-sm text-gray-600">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <FaUserTag className="text-[#ffa301]" />
                      Select Role
                    </div>
                  </label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('role', option.value)}
                        onBlur={() => handleBlur('role')}
                        disabled={loading}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                          formData.role === option.value
                            ? "border-[#ffa301] bg-gradient-to-br from-yellow-50 to-yellow-100 text-[#ffa301] shadow-sm"
                            : "border-gray-200 hover:border-[#ffa301]/50 hover:bg-yellow-50/50 text-gray-600"
                        } ${errors.role && touched.role ? 'border-red-300' : ''} ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className={`text-lg mb-1 ${
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
                  
                  {errors.role && touched.role && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Email Input */}
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
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.email && touched.email
                          ? 'border-red-300 focus:ring-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-[#ffa301]'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="you@example.com"
                    />
                    <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      errors.email && touched.email ? 'text-red-400' : 'text-gray-400'
                    } ${loading ? 'opacity-50' : ''}`} />
                  </div>
                  
                  {errors.email && touched.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Input */}
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
                      name="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      disabled={loading}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.password && touched.password
                          ? 'border-red-300 focus:ring-red-500 bg-red-50'
                          : 'border-gray-300 focus:ring-[#ffa301]'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="••••••••"
                    />
                    <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      errors.password && touched.password ? 'text-red-400' : 'text-gray-400'
                    } ${loading ? 'opacity-50' : ''}`} />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {errors.password && touched.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle className="text-xs" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                      className="rounded text-[#ffa301] focus:ring-[#ffa301] w-4 h-4"
                    />
                    <span className={`text-sm ${loading ? 'text-gray-400' : 'text-gray-600'}`}>
                      Remember me
                    </span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className={`flex items-center gap-1 text-sm hover:underline transition-colors ${
                      loading ? 'text-gray-400 cursor-not-allowed' : 'text-[#ffa301] hover:text-[#e59400]'
                    }`}
                    disabled={loading}
                  >
                    <FaKey className="text-xs" />
                    Forgot password?
                  </button>
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
                        <FaSpinner className="animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <FaSignInAlt />
                        <span>Login to Dashboard</span>
                      </>
                    )}
                  </button>
                  
                  <div className="text-center mt-4">
                    <p className={`text-sm ${loading ? 'text-gray-400' : 'text-gray-500'}`}>
                      Need access?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/contact")}
                        className={`font-medium hover:underline ${
                          loading 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-[#ffa301] hover:text-[#e59400]'
                        }`}
                        disabled={loading}
                      >
                        Contact Administrator
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