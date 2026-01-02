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
import Parent from "./pages/parent/ParentPage";
import Admin from "./pages/admin/AdminPage";
import Student from "./pages/student/StudentPage";
import Teacher from "./pages/teacher/TeacherPage";
import SuperAdminPage from "./pages/superAdmin/superAdminPage";
import ScrollToTop from "./components/ScrollToTop";
import CreateSchoolPage from "./pages/createSchool/SchoolPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} /> {/* Home redirect */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/school" element={<CreateSchoolPage />} />
          <Route path="/super-admin" element={<SuperAdminPage />} /> {/* Fixed: Use kebab-case for consistency */}

          {/* Protected Routes */}
          
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

          {/* Super Admin - Protected */}
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Page - Add if you have one */}
          {/* <Route path="*" element={<NotFound />} /> */}

          {/* Catch-all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;