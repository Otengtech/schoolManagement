// ProtectedRoute.jsx - FIXED VERSION
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ requiredRole, children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check localStorage directly, NOT from context
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log("🔐 ProtectedRoute check:");
        console.log("- Token:", token ? "Exists" : "Missing");
        console.log("- User:", userStr ? "Exists" : "Missing");
        
        if (!token || !userStr) {
          console.log("❌ No auth data in localStorage");
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }

        const user = JSON.parse(userStr);
        
        // Normalize roles
        const normalizeRole = (role) => {
          if (!role) return '';
          return role.toLowerCase().replace('_', '-');
        };

        const userRole = normalizeRole(user?.role);
        const normalizedRequiredRole = normalizeRole(requiredRole);

        // If no role required, just check token
        if (!requiredRole) {
          console.log("✅ No role required, access granted");
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }

        // Check role match
        if (userRole === normalizedRequiredRole) {
          console.log(`✅ Role match: ${userRole} === ${normalizedRequiredRole}`);
          setIsAuthorized(true);
        } else {
          console.log(`❌ Role mismatch: ${userRole} !== ${normalizedRequiredRole}`);
          setIsAuthorized(false);
        }
        
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      console.log("🔴 Redirecting to login - no auth data");
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole) {
      console.log("🔴 Redirecting to unauthorized - wrong role");
      return <Navigate to="/unauthorized" replace />;
    }
    
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;