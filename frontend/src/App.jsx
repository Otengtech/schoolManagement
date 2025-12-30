import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// auth pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// dashboards
import Student from "./pages/Student";
import Parent from "./pages/Parent";
import Teacher from "./pages/Teacher";
import Admin from "./pages/admin/Admin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />
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
