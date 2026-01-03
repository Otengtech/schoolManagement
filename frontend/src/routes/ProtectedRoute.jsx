// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user, token } = useAuth();

  // Debug logging
  console.log("ProtectedRoute check:", {
    hasToken: !!token,
    userRole: user?.role,
    requiredRole,
    userData: user
  });

  if (!token) {
    console.log("No token, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Normalize roles for comparison (handle both super-admin and super_admin)
  const normalizeRole = (role) => {
    if (!role) return '';
    return role.toLowerCase().replace('_', '-');
  };

  const userRole = normalizeRole(user?.role);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  // If no specific role required, just check authentication
  if (!requiredRole) {
    return children;
  }

  // Check if user has required role
  if (userRole !== normalizedRequiredRole) {
    console.log(`Role mismatch. User: ${userRole}, Required: ${normalizedRequiredRole}`);
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;