import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import { validateEmail } from "../../utils/validators";
import { toast } from "react-toastify";
import { 
  FaEnvelope, 
  FaArrowLeft, 
  FaPaperPlane, 
  FaCheckCircle,
  FaShieldAlt,
  FaLock,
  FaKey
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center">
      <div className="w-full bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT - Information Section */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 text-white relative overflow-hidden">
            {/* Decorative elements */}
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
                    <FaKey className="text-2xl" />
                  </div>
                  <h1 className="text-3xl font-bold">Reset Your Password</h1>
                </div>
                
                <p className="text-green-100 mb-6">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              {/* Security Information */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <FaShieldAlt className="text-xl" />
                  <h3 className="font-semibold">Secure Password Reset</h3>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>Link expires in 1 hour for security</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>One-time use only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    <span>Check your spam folder if not received</span>
                  </li>
                </ul>
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
            </div>
          </div>

          {/* RIGHT - Form Section */}
          <div className="p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FaLock className="text-2xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {emailSent ? "Check Your Email" : "Forgot Password"}
                </h2>
                <p className="text-gray-600">
                  {emailSent 
                    ? `We've sent a password reset link to ${email}`
                    : "Enter your email to receive a reset link"
                  }
                </p>
              </div>

              {!emailSent ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* EMAIL INPUT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-green-600" />
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
                            : 'border-gray-300 focus:ring-green-500'
                        }`}
                        placeholder="Enter your registered email"
                        disabled={loading}
                      />
                      <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        error ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
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
                    className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                      loading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Reset Link
                      </>
                    )}
                  </button>

                  {/* RESEND INFO */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Note:</span> If you don't receive the email within a few minutes, please check your spam folder or request a new link.
                    </p>
                  </div>
                </form>
              ) : (
                /* SUCCESS STATE */
                <div className="text-center space-y-6 animate-fadeIn">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                    <FaCheckCircle className="text-3xl text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Reset Link Sent!
                    </h3>
                    <p className="text-gray-600 mb-1">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-medium text-green-700">{email}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">What to do next:</h4>
                      <ol className="text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                          Check your email inbox
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                          Click the reset link (expires in 1 hour)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                          Create a new secure password
                        </li>
                      </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate("/login")}
                        className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Return to Login
                      </button>
                      <button
                        onClick={() => {
                          setEmailSent(false);
                          setEmail("");
                        }}
                        className="flex-1 py-3 px-4 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
                      >
                        Reset Another Email
                      </button>
                    </div>

                    <p className="text-sm text-gray-500">
                      Didn't receive the email?{" "}
                      <button
                        onClick={handleSubmit}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Resend link
                      </button>
                    </p>
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