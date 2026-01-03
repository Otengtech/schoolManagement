import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaSignInAlt } from "react-icons/fa";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full mx-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <FaExclamationTriangle className="h-10 w-10 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. 
            Please log in with the correct account type.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaHome />
              Go Home
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <FaSignInAlt />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;