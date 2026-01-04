// pages/SuperAdmin/AdminManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { superAdminService } from '../services/superAdminService';
import { useAuth } from '../context/AuthContext';
import {
  FaTrash,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaSchool,
  FaSearch,
  FaFilter,
  FaSync,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
  FaBuilding,
  FaCalendarAlt,
  FaIdCard,
  FaExclamationTriangle
} from 'react-icons/fa';

const AdminManagement = ({ setActivePage }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [schools, setSchools] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);

  // Check if user is super admin
  useEffect(() => {
    if (currentUser?.role !== 'super_admin') {
      toast.error('Super admin privileges required');
      navigate('/dashboard');
      return;
    }
    
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch admins
      const adminsResponse = await superAdminService.listAdmins();
      const adminsData = adminsResponse.data || adminsResponse || [];
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
      
      // Fetch schools for filtering
      try {
        const schoolsResponse = await superAdminService.listSchools();
        const schoolsData = schoolsResponse.data || schoolsResponse || [];
        setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      } catch (schoolsError) {
        console.error('Error fetching schools:', schoolsError);
        setSchools([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
      setAdmins([]);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (adminId, adminName) => {
    try {
      setActionLoading(adminId);
      
      await superAdminService.deleteAdmin(adminId);
      
      // Remove from state
      setAdmins(prev => prev.filter(admin => admin._id !== adminId));
      setDeleteConfirm(null);
      
      toast.success(`Admin ${adminName} deleted successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle toggle admin active status
  const handleToggleStatus = async (adminId, currentStatus, adminName) => {
    try {
      setActionLoading(`status_${adminId}`);
      
      const updateData = {
        isActive: !currentStatus
      };
      
      const updatedAdmin = await superAdminService.updateAdmin(adminId, updateData);
      
      // Update in state
      setAdmins(prev => prev.map(admin => 
        admin._id === adminId ? { ...admin, ...updatedAdmin } : admin
      ));
      
      toast.success(`Admin ${adminName} ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Status toggle error:', error);
      toast.error('Failed to update admin status');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter admins based on search and school
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.school?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSchool = 
      selectedSchool === 'all' || 
      admin.school?._id === selectedSchool ||
      admin.school?.name === selectedSchool;
    
    return matchesSearch && matchesSchool;
  });

  // Get unique schools from admins
  const uniqueSchools = [...new Set(admins
    .filter(admin => admin.school)
    .map(admin => admin.school.name)
  )];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Admin Details Modal
  const AdminDetailsModal = ({ admin, onClose }) => {
    if (!admin) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#052954] to-[#041e42] p-6 text-white rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Admin Details</h2>
                <p className="text-blue-100">Complete information</p>
              </div>
              <button onClick={onClose} className="text-white hover:text-yellow-300 text-xl">
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Profile Section */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <img
                  src={admin.profileImage || '/default-avatar.png'}
                  alt={`${admin.firstName} ${admin.lastName}`}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                  admin.isActive ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {admin.firstName} {admin.lastName}
                </h3>
                <p className="text-gray-600">{admin.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    admin.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {admin.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* School Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FaBuilding className="text-blue-600" />
                  <h4 className="font-semibold text-gray-800">School Information</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">School Name:</span>
                    <span className="font-medium">{admin.school?.name || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">School Code:</span>
                    <span className="font-medium">{admin.school?.code || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FaUserShield className="text-green-600" />
                  <h4 className="font-semibold text-gray-800">Account Information</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin ID:</span>
                    <span className="font-medium text-sm">{admin._id?.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{formatDate(admin.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(admin.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <FaExclamationTriangle />
                <span className="font-medium">Super Admin Actions Only</span>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                As a super admin, you can manage this admin's account. Use caution when modifying or deleting accounts.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  handleToggleStatus(admin._id, admin.isActive, `${admin.firstName} ${admin.lastName}`);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:opacity-90 transition"
              >
                {admin.isActive ? <FaBan /> : <FaCheckCircle />}
                {admin.isActive ? 'Deactivate Account' : 'Activate Account'}
              </button>
              <button
                onClick={() => {
                  setDeleteConfirm(admin);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition"
              >
                <FaTrash />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = ({ admin, onClose }) => {
    if (!admin) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Delete Admin Account</h3>
                <p className="text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">
                Are you sure you want to delete this admin account?
              </p>
              <div className="mt-2 text-red-700">
                <p><strong>Admin:</strong> {admin.firstName} {admin.lastName}</p>
                <p><strong>Email:</strong> {admin.email}</p>
                <p><strong>School:</strong> {admin.school?.name || 'Not assigned'}</p>
              </div>
              <p className="text-sm text-red-600 mt-3">
                ⚠️ All data associated with this admin will be permanently removed.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={actionLoading === admin._id}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAdmin(admin._id, `${admin.firstName} ${admin.lastName}`)}
                disabled={actionLoading === admin._id}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === admin._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa301]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#052954]">Admin Management</h1>
            <p className="text-gray-600 mt-2">Super Admin Panel - Manage all administrator accounts</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#052954] to-[#041e42] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setActivePage("dashboard")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-3xl font-bold text-[#052954]">{admins.length}</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
                <FaUserShield className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Admins</p>
                <p className="text-3xl font-bold text-green-600">
                  {admins.filter(a => a.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Admins</p>
                <p className="text-3xl font-bold text-red-600">
                  {admins.filter(a => !a.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
                <FaBan className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Schools</p>
                <p className="text-3xl font-bold text-purple-600">{uniqueSchools.length}</p>
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full">
                <FaBuilding className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaSearch className="text-[#ffa301]" />
                  Search Admins
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or school..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa301] focus:border-transparent"
                />
              </div>
            </div>

            {/* School Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-[#ffa301]" />
                  Filter by School
                </div>
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa301] focus:border-transparent"
              >
                <option value="all">All Schools</option>
                {uniqueSchools.map((school, index) => (
                  <option key={index} value={school}>{school}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredAdmins.length} of {admins.length} admins
              </div>
            </div>
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          {filteredAdmins.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || selectedSchool !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No admin accounts have been created yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50">
                      {/* Admin Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={admin.profileImage || '/default-avatar.png'}
                              alt={`${admin.firstName} ${admin.lastName}`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* School Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {admin.school?.name || 'Not assigned'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {admin.school?.code || 'No code'}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            admin.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            admin.isActive ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.createdAt)}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewDetails(admin)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(admin._id, admin.isActive, `${admin.firstName} ${admin.lastName}`)}
                            disabled={actionLoading === `status_${admin._id}`}
                            className={`p-2 rounded-lg transition ${
                              admin.isActive
                                ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={admin.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {actionLoading === `status_${admin._id}` ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : admin.isActive ? (
                              <FaBan />
                            ) : (
                              <FaCheckCircle />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(admin)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition"
                            title="Delete Admin"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Note for Super Admin */}
        <div className="mt-6 bg-gradient-to-r from-[#052954] to-[#041e42] rounded-xl shadow p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-[#ffa301] rounded-full flex-shrink-0">
              <FaUserShield className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Super Admin Privileges</h3>
              <p className="text-blue-100 mt-2">
                You have full control over all administrator accounts. Use these powers responsibly.
              </p>
              <ul className="text-blue-100 text-sm mt-3 space-y-1">
                <li>• Create, view, and delete administrator accounts</li>
                <li>• Activate or deactivate admin access</li>
                <li>• View detailed information about each admin</li>
                <li>• Manage admins across all schools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewDetails && (
        <AdminDetailsModal
          admin={viewDetails}
          onClose={() => setViewDetails(null)}
        />
      )}
      
      {deleteConfirm && (
        <DeleteConfirmationModal
          admin={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default AdminManagement;