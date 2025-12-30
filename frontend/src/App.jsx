import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

// auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// dashboards
import Student from "./pages/Student";
import Parent from "./pages/Parent";
import Teacher from "./pages/Teacher";
import Admin from "./pages/Admin";

// Component to handle 404 redirects
const RedirectHandler = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Save the current path when component mounts
    sessionStorage.setItem('lastPath', location.pathname + location.search);
  }, [location]);
  
  return null;
};

function App() {
  // Check if we have a redirect path from 404 page
  const redirectPath = sessionStorage.getItem('redirectPath');
  
  if (redirectPath) {
    sessionStorage.removeItem('redirectPath');
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <RedirectHandler />
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Student */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Student />
              </ProtectedRoute>
            }
          />

          {/* Parent */}
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <Parent />
              </ProtectedRoute>
            }
          />

          {/* Teacher */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <Teacher />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Catch-all 404 route */}
          <Route 
            path="*" 
            element={
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                textAlign: 'center',
                padding: '20px'
              }}>
                <h1 style={{ fontSize: '48px', color: '#dc3545' }}>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Go to Login
                </button>
              </div>
            } 
          />

        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;