// pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaSchool, 
  FaUserShield, 
  FaChartLine, 
  FaCogs,
  FaSignOutAlt 
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.name || user?.role.replace('-', ' ')}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Super Admin Quick Actions */}
          {isSuperAdmin() && (
            <>
              <div 
                onClick={() => navigate('/create-school')}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaSchool className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Create School</h3>
                    <p className="text-gray-600 text-sm">Register a new school</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigate('/create-admin')}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FaUserShield className="text-2xl text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Create Admin</h3>
                    <p className="text-gray-600 text-sm">Add school administrator</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Common Dashboard Cards */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaChartLine className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Analytics</h3>
                <p className="text-gray-600 text-sm">View system statistics</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaCogs className="text-2xl text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Settings</h3>
                <p className="text-gray-600 text-sm">Configure your account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium">Logged in</p>
              <p className="text-sm text-gray-600">Just now</p>
            </div>
            {isSuperAdmin() && (
              <>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-medium">Create School Access</p>
                  <p className="text-sm text-gray-600">Ready to create new schools</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="font-medium">Admin Creation Permission</p>
                  <p className="text-sm text-gray-600">You can create school admins</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;