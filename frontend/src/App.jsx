import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// auth pages
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

// dashboards
import Parent from "./pages/parent/ParentDashboard";
import Admin from "./pages/admin/AdminPage";
import Student from "./pages/student/StudentPage";
import Teacher from "./pages/teacher/TeacherPage";
import SuperAdminPage from "./pages/superAdmin/superAdminPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/superAdmin" element={<SuperAdminPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/student" element={<Student />} />
          <Route path="/teacher" element={<Teacher />} />

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
          <Route
            path="/login/*" element={<Navigate to="/login" />} />

          {/* Default */}
          <Route path="/superAdmin" element={<Navigate to="/superAdmin" />} />
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
