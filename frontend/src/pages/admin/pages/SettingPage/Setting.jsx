// pages/SettingPage/Setting.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { adminStorage } from '../../../../utils/adminStorage';
import { superAdminService } from '../../../../services/superAdminService';
import { 
  FaSchool, FaIdCard, FaUserTag, FaCalendarAlt, 
  FaEnvelope, FaUser, FaLock, FaCog, FaSignOutAlt,
  FaCamera, FaTimes, FaCheck, FaEdit, FaBuilding,
  FaPhone, FaMapMarkerAlt, FaGlobe, FaKey
} from 'react-icons/fa';

const Settings = ({ setActivePage }) => {
  const navigate = useNavigate();
  const { logout: authLogout, user: authUser } = useAuth();
  
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: null,
    previewImage: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const storedCompleteAdmin = localStorage.getItem('currentAdmin');
      
      if (storedCompleteAdmin) {
        try {
          const completeAdmin = JSON.parse(storedCompleteAdmin);
          const adminInfo = {
            ...(completeAdmin.data || {}),
            ...completeAdmin,
            message: undefined
          };
          
          delete adminInfo.message;
          setAdmin(adminInfo);
          setFormData({
            firstName: adminInfo.firstName || '',
            lastName: adminInfo.lastName || '',
            email: adminInfo.email || '',
            phone: adminInfo.phone || '',
            profileImage: null,
            previewImage: adminInfo.profileImage || ''
          });
          return;
        } catch (parseError) {
          console.error("Error parsing currentAdmin:", parseError);
        }
      }
      
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userStr || !token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }
      
      const user = JSON.parse(userStr);
      const schoolName = localStorage.getItem("createdSchoolName") || 'Your School';
      
      const adminInfo = {
        ...user,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        schoolId: user.school || '',
        schoolName: schoolName,
        email: user.email || '',
      };
      
      setAdmin(adminInfo);
      setFormData({
        firstName: adminInfo.firstName || '',
        lastName: adminInfo.lastName || '',
        email: adminInfo.email || '',
        phone: adminInfo.phone || '',
        profileImage: null,
        previewImage: adminInfo.profileImage || ''
      });
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
      
      setAdmin({
        firstName: 'Admin',
        lastName: 'User',
        schoolName: 'Your School',
        email: 'admin@school.edu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Image size should be less than 2MB');
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          profileImage: file,
          previewImage: URL.createObjectURL(file)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setUpdating(true);
      
      if (!admin?._id) {
        toast.error('Cannot update: Admin ID not found');
        return;
      }
      
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
      };
      
      console.log('Attempting to update admin:', admin._id);
      
      try {
        const updatedAdmin = await superAdminService.updateAdmin(
          admin._id,
          updateData,
          formData.profileImage
        );
        
        const mergedData = {
          ...admin,
          ...updatedAdmin,
          ...updateData,
          profileImage: formData.profileImage ? updatedAdmin.profileImage : admin.profileImage,
          updatedAt: new Date().toISOString()
        };
        
        adminStorage.updateAdminData(mergedData);
        setAdmin(mergedData);
        
        if (formData.profileImage) {
          setFormData(prev => ({
            ...prev,
            previewImage: updatedAdmin.profileImage,
            profileImage: null
          }));
        }
        
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        
      } catch (updateError) {
        console.log('Server update failed, updating locally:', updateError);
        
        const updatedData = {
          ...admin,
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        
        adminStorage.updateAdminData(updatedData);
        setAdmin(updatedData);
        setIsEditing(false);
        
        toast.success('Profile updated locally!');
      }
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // In Settings.jsx - update handleLogout function
const handleLogout = () => {
  try {
    // Clear session data only (keeps user data for future logins)
    adminStorage.clearSessionData();
    
    // Clear auth context
    authLogout();
    
    navigate('/login');
    toast.success('Logged out successfully');
  } catch (error) {
    toast.error('Logout failed');
  }
};

  const cancelEdit = () => {
    setFormData({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      phone: admin.phone || '',
      profileImage: null,
      previewImage: admin.profileImage || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#ffa301] border-r-4 border-[#052954] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-600 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to load data</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load your admin information. Please try again or contact support.
          </p>
          <button
            onClick={() => setActivePage("dashboard")}
            className="bg-gradient-to-r from-[#052954] to-[#041e42] text-white px-8 py-3 rounded-xl hover:opacity-90 transition transform hover:-translate-y-1 shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#052954] to-[#041e42] text-white px-4 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Account Settings</h1>
              <p className="text-blue-200 mt-1">Manage your profile and preferences</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage("dashboard")}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition backdrop-blur-sm flex items-center gap-2"
              >
                <span>←</span> Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-1/4">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-[#ffa301] to-[#ffa301]/90 h-20"></div>
              <div className="px-6 pb-6 -mt-10 relative">
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={formData.previewImage || admin.profileImage || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-[#052954] text-white p-2 rounded-full cursor-pointer hover:bg-[#041e42] transition shadow-lg">
                    <FaCamera />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleChange}
                      name="profileImage"
                    />
                  </label>
                </div>
                
                <div className="text-center mt-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {admin.firstName} {admin.lastName}
                  </h3>
                  <p className="text-gray-600">{admin.role}</p>
                  <p className="text-sm text-gray-500 mt-1">{admin.email}</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FaBuilding className="text-[#ffa301]" />
                    <span>{admin.schoolName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-xl p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-gradient-to-r from-[#ffa301]/10 to-[#ffa301]/5 text-[#052954] border-l-4 border-[#ffa301]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaUser className={activeTab === 'profile' ? 'text-[#ffa301]' : 'text-gray-400'} />
                  <span className="font-medium">Profile</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('school')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'school' ? 'bg-gradient-to-r from-[#ffa301]/10 to-[#ffa301]/5 text-[#052954] border-l-4 border-[#ffa301]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaSchool className={activeTab === 'school' ? 'text-[#ffa301]' : 'text-gray-400'} />
                  <span className="font-medium">School</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'account' ? 'bg-gradient-to-r from-[#ffa301]/10 to-[#ffa301]/5 text-[#052954] border-l-4 border-[#ffa301]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FaKey className={activeTab === 'account' ? 'text-[#ffa301]' : 'text-gray-400'} />
                  <span className="font-medium">Account</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:w-3/4">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-[#052954]">Profile Information</h2>
                    <p className="text-gray-600">Update your personal details</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-[#ffa301] to-[#ffa301]/90 text-[#052954] font-semibold px-6 py-2 rounded-xl hover:opacity-90 transition flex items-center gap-2"
                    >
                      <FaEdit /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={updating}
                        className="bg-gradient-to-r from-[#052954] to-[#041e42] text-white px-6 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {updating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaCheck /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffa301] focus:border-[#ffa301] transition disabled:bg-gray-50"
                        placeholder="Enter first name"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffa301] focus:border-[#ffa301] transition disabled:bg-gray-50"
                        placeholder="Enter last name"
                      />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffa301] focus:border-[#ffa301] transition disabled:bg-gray-50"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffa301] focus:border-[#ffa301] transition disabled:bg-gray-50"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* School Tab */}
            {activeTab === 'school' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#052954]">School Information</h2>
                  <p className="text-gray-600">Details about your school</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#052954] rounded-xl">
                        <FaSchool className="text-white text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">School Name</p>
                        <h3 className="text-xl font-bold text-[#052954] mt-1">
                          {admin.school?.name || 'Not assigned'}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#ffa301] rounded-xl">
                        <FaIdCard className="text-[#052954] text-xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">School Code</p>
                        <h3 className="text-xl font-bold text-[#052954] mt-1">
                          {admin.school?.code || 'N/A'}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#052954]">Account Details</h2>
                  <p className="text-gray-600">View your account information and status</p>
                </div>

                <div className="space-y-6">
                  {/* Account Status */}
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${admin.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                        {admin.isActive ? (
                          <FaCheck className="text-green-600 text-xl" />
                        ) : (
                          <FaTimes className="text-red-600 text-xl" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Status</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {admin.isActive ? 'Active ✓' : 'Inactive ✗'}
                    </span>
                  </div>

                  {/* Account Role */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 border border-gray-200 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                          <FaUserTag className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Role</p>
                          <p className="font-semibold text-gray-800">{admin.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg">
                          <FaCalendarAlt className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="font-semibold text-gray-800">
                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 rounded-lg">
                          <FaGlobe className="text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Updated</p>
                          <p className="font-semibold text-gray-800">
                            {admin.updatedAt ? new Date(admin.updatedAt).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-[#052954]/5 to-[#041e42]/5 rounded-2xl border border-[#052954]/10">
                    <div className="flex items-start gap-3">
                      <FaKey className="text-[#ffa301] text-xl mt-1" />
                      <div>
                        <h4 className="font-semibold text-[#052954] mb-2">Security Information</h4>
                        <p className="text-sm text-gray-600">
                          For security reasons, password changes and other sensitive operations 
                          can only be performed by super administrators. Contact your system 
                          administrator for assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Info Bar */}
            <div className="mt-6 p-4 bg-white rounded-2xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Need help?</span> Contact support at support@schoolsystem.com
                </div>
                <div className="text-gray-500 text-xs">
                  Admin ID: {admin._id?.substring(0, 12)}... • Version 1.0.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;