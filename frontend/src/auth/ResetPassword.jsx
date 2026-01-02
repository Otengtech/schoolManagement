import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { toast } from "react-toastify";
import {
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaArrowLeft,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaCrown,
  FaSyncAlt
} from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check for strong password (optional)
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      setError("Password should contain uppercase, lowercase, number, and special character");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, formData.password);
      
      // Show success toast
      toast.success("Password reset successful! Please login with your new password.", {
        icon: "✅",
        autoClose: 5000,
      });
      
      setSuccess(true);
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      let errorMessage = "Reset link is invalid or expired";
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = "Invalid or expired reset token";
            break;
          case 410:
            errorMessage = "Reset link has already been used";
            break;
          case 429:
            errorMessage = "Too many attempts. Please try again later";
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
      
      setError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength === 0) return "bg-gray-200";
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Medium";
    return "Strong";
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
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-blue-100 hover:text-white mb-8 transition-colors w-fit group"
              >
                <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <FaArrowLeft className="text-xs" />
                </div>
                <span className="text-sm">Back to Login</span>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#ffa301] to-[#ff8c00] shadow-lg">
                  <FaKey className="text-2xl" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold">New Password</h1>
              </div>
              
              <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                Create a new strong password to secure your account.
              </p>

              {/* Security Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <FaShieldAlt className="text-[#ffa301] text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-200">Password Requirements</h3>
                    <p className="text-xs text-white">Create a strong password</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-white">
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.password.length >= 6 ? "bg-[#ffa301]" : "bg-gray-500"}`}></div>
                    At least 6 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? "bg-[#ffa301]" : "bg-gray-500"}`}></div>
                    Uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.password) ? "bg-[#ffa301]" : "bg-gray-500"}`}></div>
                    Lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/\d/.test(formData.password) ? "bg-[#ffa301]" : "bg-gray-500"}`}></div>
                    Number
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${/[@$!%*?&]/.test(formData.password) ? "bg-[#ffa301]" : "bg-gray-500"}`}></div>
                    Special character (@$!%*?&)
                  </li>
                </ul>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-blue-200">Password Strength</p>
                    <p className={`text-sm font-medium ${
                      passwordStrength(formData.password) <= 2 ? "text-red-300" :
                      passwordStrength(formData.password) <= 3 ? "text-yellow-300" : "text-green-300"
                    }`}>
                      {getStrengthText(passwordStrength(formData.password))}
                    </p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength(formData.password))}`}
                      style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <FaLock className="text-xs" />
                  </div>
                  <span className="text-xs">Encrypted Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <FaSyncAlt className="text-xs" />
                  </div>
                  <span className="text-xs">One-Time Reset</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Form Section */}
          <div className="px-6 py-10 md:px-8 md:p-8 md:overflow-y-auto">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-full mb-4 shadow-lg">
                  <FaLock className="text-3xl text-[#ffa301]" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  {success ? "Password Reset!" : "Set New Password"}
                </h2>
                <p className="text-sm text-gray-600">
                  {success 
                    ? "Your password has been successfully reset"
                    : "Enter your new password below"
                  }
                </p>
              </div>

              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* ERROR */}
                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-red-100 rounded-lg">
                          <FaExclamationCircle className="text-red-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-800 mb-1">Error</p>
                          <p className="text-xs text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaKey className="text-[#ffa301]" />
                        New Password
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          error && error.includes("Password") 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="Create a strong password"
                      />
                      <FaKey className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        error && error.includes("Password") ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaCheck className="text-[#ffa301]" />
                        Confirm Password
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          error && error.includes("match") 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <FaCheck className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        error && error.includes("match") ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
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
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <FaLock className="text-sm" />
                        Reset Password
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* SUCCESS STATE */
                <div className="text-center space-y-6 animate-fadeIn">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full shadow-lg">
                    <FaCheckCircle className="text-4xl text-green-600" />
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Password Reset Successful!
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your password has been updated successfully. You'll be redirected to login shortly.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <h4 className="font-medium text-gray-700 mb-3">Next Steps:</h4>
                        <ol className="text-sm text-gray-600 space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-[#ffa301] to-[#ff8c00] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                            <span>Redirecting to login page in 3 seconds...</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-[#ffa301] to-[#ff8c00] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                            <span>Login with your new password</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-[#ffa301] to-[#ff8c00] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                            <span>Enjoy secure access to your account</span>
                          </li>
                        </ol>
                      </div>

                      <button
                        onClick={() => navigate("/login")}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#052954] to-[#041e42] text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                      >
                        Go to Login Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;