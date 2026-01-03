// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user, token } = useAuth();

  if (!token) {
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
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;