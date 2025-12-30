import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth";
import { validateSignupForm, validatePasswordStrength } from "../../utils/validators";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaUserTag,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserFriends,
  FaUser,
  FaInfoCircle,
  FaExclamationCircle
} from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0 });

  const handleChange = (field, value) => {
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm);
    
    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Validate password strength in real-time
    if (field === 'password') {
      setPasswordStrength(validatePasswordStrength(value));
      
      // Check password match if confirmPassword exists
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else if (formData.confirmPassword && value === formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
    
    // Validate password match in real-time
    if (field === 'confirmPassword') {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
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
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
          return "Password must contain both uppercase and lowercase letters";
        }
        if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
        if (!/(?=.*[@$!%*?&])/.test(value)) {
          return "Password must contain at least one special character";
        }
        return "";
      
      case 'confirmPassword':
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      
      case 'name':
        if (!value) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";
      
      case 'role':
        if (!value) return "Please select a role";
        return "";
      
      case 'termsAccepted':
        if (!value) return "You must accept the terms and conditions";
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
    const validation = validateSignupForm(formData);
    
    // Additional validation for confirm password
    if (formData.password !== formData.confirmPassword) {
      validation.errors.confirmPassword = "Passwords do not match";
      validation.isValid = false;
    }
    
    // Check terms acceptance
    if (!formData.termsAccepted) {
      validation.errors.termsAccepted = "You must accept the terms and conditions";
      validation.isValid = false;
    }

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fix the errors in the form");
      setLoading(false);
      return;
    }

    try {
      const submissionData = {
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        name: formData.name.trim(),
      };

      const data = await registerUser(submissionData);
      
      // Show success toast
      toast.success(`Account created successfully! Welcome, ${data.user.name || data.user.email}`, {
        icon: "🎉",
        autoClose: 3000,
      });
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      // Handle different error scenarios
      let errorMessage = "Signup failed. Please try again.";
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.message || "Invalid data provided";
            break;
          case 409:
            errorMessage = "Email already exists. Please login instead.";
            break;
          case 422:
            errorMessage = "Validation failed. Please check your inputs.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage, {
        autoClose: 5000,
      });
      
      // Set specific field errors from API response
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = () => {
    switch (formData.role) {
      case "admin":
        return "Full system access and user management";
      case "teacher":
        return "Class management and student grading";
      case "student":
        return "Course access and assignment submission";
      case "parent":
        return "Child progress monitoring";
      default:
        return "";
    }
  };

  const getRoleIcon = () => {
    switch (formData.role) {
      case "admin":
        return <FaShieldAlt />;
      case "teacher":
        return <FaChalkboardTeacher />;
      case "student":
        return <FaUserGraduate />;
      case "parent":
        return <FaUserFriends />;
      default:
        return <FaUserTag />;
    }
  };

  const passwordRequirements = [
    { label: "At least 6 characters", test: (pwd) => pwd.length >= 6 },
    { label: "Uppercase & lowercase", test: (pwd) => /(?=.*[a-z])(?=.*[A-Z])/.test(pwd) },
    { label: "At least one number", test: (pwd) => /\d/.test(pwd) },
    { label: "One special character", test: (pwd) => /[@$!%*?&]/.test(pwd) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center">
      <div className="w-full bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full md:h-screen">
          {/* LEFT - Information Sectio */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-400 rounded-full translate-y-20 -translate-x-20 opacity-20"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-center">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-green-100 hover:text-white mb-8 transition-colors w-fit"
              >
                <FaArrowLeft />
                <span className="text-sm">Back to Login</span>
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaUserPlus className="text-2xl" />
                  </div>
                  <h1 className="text-3xl font-bold">Create Account</h1>
                </div>
                
                <p className="text-green-100 mb-6">
                  Join our school management system and get access to features tailored for your role.
                </p>
              </div>

              {/* Role Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {getRoleIcon()}
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{formData.role} Account</h3>
                    <p className="text-sm text-green-100">{getRoleDescription()}</p>
                  </div>
                </div>
                
                <div className="text-sm space-y-2">
                  <h4 className="font-medium">Benefits:</h4>
                  <ul className="space-y-1">
                    {formData.role === "admin" && (
                      <>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Full system control</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>User management</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Analytics dashboard</span>
                        </li>
                      </>
                    )}
                    {formData.role === "teacher" && (
                      <>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Create and grade assignments</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Track student progress</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Communicate with parents</span>
                        </li>
                      </>
                    )}
                    {formData.role === "student" && (
                      <>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Access course materials</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Submit assignments online</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Track your grades</span>
                        </li>
                      </>
                    )}
                    {formData.role === "parent" && (
                      <>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Monitor child's progress</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>View attendance records</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <FaCheck className="text-green-300 text-xs" />
                          <span>Communicate with teachers</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Security Info */}
              <div className="text-sm text-green-100">
                <div className="flex items-center gap-2">
                  <FaShieldAlt />
                  <span>Your data is protected with 256-bit encryption</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Form Section */}
          <div className="p-8 md:p-12 md:overflow-y-auto max-h-screen scrollbar-hide">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Create Your Account
                </h2>
                <p className="text-gray-600">
                  Fill in your details to get started
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* ROLE SELECTION */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaUserTag className="text-green-600" />
                      I want to register as
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
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.role === option.value
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                        } ${errors.role ? 'border-red-300' : ''}`}
                      >
                        <div className={`text-lg mb-1 ${
                          formData.role === option.value 
                            ? "text-green-600" 
                            : "text-gray-500"
                        }`}>
                          {option.icon}
                        </div>
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* NAME FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-green-600" />
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* EMAIL FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-green-600" />
                      Email Address
                    </div>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaLock className="text-green-600" />
                      Password
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Password strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength.color === 'green' ? 'text-green-600' :
                          passwordStrength.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            passwordStrength.color === 'green' ? 'bg-green-500' :
                            passwordStrength.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Password Requirements */}
                  <div className="mt-3 space-y-1">
                    {passwordRequirements.map((req, index) => {
                      const isMet = req.test(formData.password);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          {isMet ? (
                            <FaCheck className="text-green-500 text-xs" />
                          ) : (
                            <FaTimes className="text-gray-300 text-xs" />
                          )}
                          <span className={`text-xs ${isMet ? 'text-green-600' : 'text-gray-500'}`}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {errors.password && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* CONFIRM PASSWORD FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaLock className="text-green-600" />
                      Confirm Password
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                    loading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      Create Account
                    </>
                  )}
                </button>

                {/* DIVIDER */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                {/* LOGIN LINK */}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-green-600 text-green-600 font-medium hover:bg-green-50 transition-all duration-200"
                >
                  <FaUser />
                  Login Instead
                </button>
              </form>

              {/* SECURITY NOTE */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FaInfoCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Your information is securely encrypted. We never share your data with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;