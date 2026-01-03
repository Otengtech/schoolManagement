import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { forgotPassword } from "../api/auth";
import { validateEmail } from "../utils/validators";
import { toast } from "react-toastify";
import { 
  FaEnvelope, 
  FaArrowLeft, 
  FaPaperPlane, 
  FaCheckCircle,
  FaShieldAlt,
  FaLock,
  FaKey,
  FaCrown,
  FaExclamationCircle,
  FaClock,
  FaSyncAlt
} from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      toast.error(emailError);
      setLoading(false);
      return;
    }

    try {
      await forgotPassword(email.trim());
      
      // Show success toast
      toast.success("Password reset link sent to your email!", {
        icon: "📧",
        autoClose: 5000,
      });
      
      setEmailSent(true);
      
      // Auto-redirect after 5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 5000);
      
    } catch (err) {
      // Handle different error scenarios
      let errorMessage = "Failed to send reset link";
      
      if (err.response) {
        switch (err.response.status) {
          case 404:
            errorMessage = "Email not found in our system";
            break;
          case 429:
            errorMessage = "Too many attempts. Please try again later";
            break;
          case 400:
            errorMessage = "Invalid email format";
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

  const handleEmailChange = (value) => {
    setEmail(value);
    // Clear error when user starts typing
    if (error) {
      setError("");
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
                <h1 className="text-3xl md:text-5xl font-bold">Reset Password</h1>
              </div>
              
              <p className="text-sm md:text-base text-blue-100 mb-6 max-w-md">
                Enter your email address and we'll send you a secure link to reset your password.
              </p>

              {/* Security Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <FaShieldAlt className="text-[#ffa301] text-lg" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-200">Secure Password Reset</h3>
                    <p className="text-xs text-white">Your security is our priority</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-white">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                    Link expires in 1 hour for security
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                    One-time use only
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                    Encrypted secure connection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ffa301]"></div>
                    Check spam folder if not received
                  </li>
                </ul>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-blue-200 mb-1">Reset Success Rate</p>
                  <p className="text-2xl font-bold text-[#ffa301]">98%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-blue-200 mb-1">Average Time</p>
                  <p className="text-2xl font-bold text-[#ffa301]">2 min</p>
                </div>
              </div>

              {/* Success State Preview */}
              {emailSent && (
                <div className="mt-6 bg-green-500/20 border border-green-400/30 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-300 text-xl" />
                    <div>
                      <p className="font-medium">Email sent successfully!</p>
                      <p className="text-sm text-green-100 mt-1">
                        Redirecting to login in 5 seconds...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <FaLock className="text-xs" />
                  </div>
                  <span className="text-xs">Bank-level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <FaClock className="text-xs" />
                  </div>
                  <span className="text-xs">24/7 Support</span>
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
                  {emailSent ? "Check Your Email" : "Forgot Password"}
                </h2>
                <p className="text-sm text-gray-600">
                  {emailSent 
                    ? `We've sent a password reset link to:`
                    : "Enter your email to receive a secure reset link"
                  }
                </p>
              </div>

              {!emailSent ? (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* EMAIL INPUT */}
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
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                          error 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#ffa301] focus:border-transparent'
                        }`}
                        placeholder="Enter your registered email"
                        disabled={loading}
                      />
                      <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                        error ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    </div>
                    {error && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaExclamationCircle />
                        {error}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Enter the email associated with your account
                    </p>
                  </div>

                  {/* SUBMIT BUTTON */}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="text-sm" />
                        Send Reset Link
                      </>
                    )}
                  </button>

                  {/* RESEND INFO */}
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-yellow-100 rounded-lg">
                        <FaExclamationCircle className="text-yellow-600 text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800 mb-1">Important Note</p>
                        <p className="text-xs text-yellow-700">
                          If you don't receive the email within a few minutes, please check your spam folder or request a new link.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* SUCCESS STATE */
                <div className="text-center space-y-6 animate-fadeIn">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full shadow-lg">
                    <FaCheckCircle className="text-4xl text-green-600" />
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Reset Link Sent!
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-bold text-[#052954] text-lg mb-4">{email}</p>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <h4 className="font-medium text-gray-700 mb-3 text-left">What to do next:</h4>
                        <ol className="text-sm text-gray-600 space-y-3 text-left">
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-[#ffa301] to-[#ff8c00] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                            <span>Check your email inbox (and spam folder)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-[#ffa301] to-[#ff8c00] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                            <span>Click the secure reset link (expires in 1 hour)</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-[#ffa301] to-[#ff8c00] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                            <span>Create a new strong password for your account</span>
                          </li>
                        </ol>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => navigate("/login")}
                          className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#052954] to-[#041e42] text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                        >
                          Return to Login
                        </button>
                        <button
                          onClick={() => {
                            setEmailSent(false);
                            setEmail("");
                          }}
                          className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-[#052954] text-[#052954] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          <FaSyncAlt className="text-sm" />
                          Reset Another Email
                        </button>
                      </div>

                      <p className="text-sm text-gray-500">
                        Didn't receive the email?{" "}
                        <button
                          onClick={handleSubmit}
                          className="text-[#ffa301] hover:text-[#e59400] font-medium hover:underline"
                        >
                          Click to resend
                        </button>
                      </p>
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

export default ForgotPassword;