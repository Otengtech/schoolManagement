// App.js or your routing file
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './auth/Login';
import CreateSchoolPage from './pages/createSchool/SchoolPage';
import CreateAdmin from './pages/CreateAdmin';
import AdminPage from './pages/admin/AdminPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Super Admin Routes - Must login as super-admin */}
          <Route 
            path="/create-school" 
            element={
              <ProtectedRoute requiredRole="super-admin">
                <CreateSchoolPage />
              </ProtectedRoute>
            } 
          />
          
          {/* After creating school, create admin */}
          <Route 
            path="/create-admin" 
            element={
              <ProtectedRoute requiredRole="super-admin">
                <CreateAdmin />
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboard Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;