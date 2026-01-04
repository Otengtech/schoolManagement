import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { FaSchool, FaIdCard, FaUserTag, FaCalendarAlt, FaEnvelope, FaUser, FaLock } from 'react-icons/fa';

const Settings = ({ setActivePage }) => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: null,
    previewImage: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    try {
      setLoading(true);
      
      // Get admin data from multiple localStorage sources
      const sources = [
        localStorage.getItem('currentAdmin'),
        localStorage.getItem('user'),
        localStorage.getItem('schoolInfo')
      ];
      
      let adminInfo = {
        firstName: 'Admin',
        lastName: 'User',
        school: { name: 'Your School', code: 'N/A' },
        email: 'admin@school.edu',
        profileImage: '',
        role: 'Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Try currentAdmin (from admin creation)
      const storedCompleteAdmin = sources[0];
      if (storedCompleteAdmin) {
        try {
          const completeAdmin = JSON.parse(storedCompleteAdmin);
          
          // Handle nested data structure
          let actualAdminData = completeAdmin;
          if (completeAdmin.data) {
            actualAdminData = completeAdmin.data;
          }
          
          // Extract admin info
          adminInfo = {
            ...adminInfo,
            ...actualAdminData,
            firstName: actualAdminData.firstName || adminInfo.firstName,
            lastName: actualAdminData.lastName || adminInfo.lastName,
            email: actualAdminData.email || adminInfo.email,
            profileImage: actualAdminData.profileImage || adminInfo.profileImage,
            role: actualAdminData.role || adminInfo.role,
            isActive: actualAdminData.isActive !== undefined ? actualAdminData.isActive : adminInfo.isActive,
            school: actualAdminData.school || adminInfo.school,
            createdAt: actualAdminData.createdAt || adminInfo.createdAt,
            updatedAt: actualAdminData.updatedAt || adminInfo.updatedAt
          };
        } catch (parseError) {
          console.log("Could not parse currentAdmin");
        }
      }
      
      // Try user data from login
      const userStr = sources[1];
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Merge with existing adminInfo
          adminInfo = {
            ...adminInfo,
            ...user,
            firstName: adminInfo.firstName !== 'Admin' ? adminInfo.firstName : (user.firstName || adminInfo.firstName),
            lastName: adminInfo.lastName !== 'User' ? adminInfo.lastName : (user.lastName || adminInfo.lastName),
            email: adminInfo.email !== 'admin@school.edu' ? adminInfo.email : (user.email || adminInfo.email),
            profileImage: adminInfo.profileImage || user.profileImage || adminInfo.profileImage,
            role: adminInfo.role || user.role || adminInfo.role
          };
        } catch (userParseError) {
          console.log("Could not parse user data");
        }
      }
      
      // Get school info if stored separately
      const schoolInfoStr = sources[2];
      if (schoolInfoStr) {
        try {
          const schoolInfo = JSON.parse(schoolInfoStr);
          if (schoolInfo.name) {
            adminInfo.school = {
              name: schoolInfo.name,
              code: schoolInfo.code || schoolInfo._id?.slice(-4) || 'N/A'
            };
          }
        } catch (schoolParseError) {
          console.log("Could not parse school info");
        }
      }
      
      // Get created school name
      const createdSchoolName = localStorage.getItem('createdSchoolName');
      if (createdSchoolName) {
        adminInfo.school.name = createdSchoolName;
      }
      
      console.log("Admin info loaded:", adminInfo);
      setAdmin(adminInfo);
      
      // Set form data
      setFormData({
        firstName: adminInfo.firstName || '',
        lastName: adminInfo.lastName || '',
        email: adminInfo.email || '',
        profileImage: null,
        previewImage: adminInfo.profileImage || ''
      });
      
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          toast.error('Image size should be less than 2MB');
          return;
        }
        
        // Check file type
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
    
    // Validate form
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
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedAdmin = {
        ...admin,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        profileImage: formData.previewImage || admin.profileImage,
        updatedAt: new Date().toISOString()
      };
      
      // Update localStorage
      localStorage.setItem('currentAdmin', JSON.stringify(updatedAdmin));
      localStorage.setItem('user', JSON.stringify(updatedAdmin));
      
      // Update state
      setAdmin(updatedAdmin);
      
      toast.success('Profile updated successfully!');
      
      // Clear file input
      if (formData.profileImage) {
        setFormData(prev => ({
          ...prev,
          profileImage: null
        }));
      }
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    try {
      authLogout();
      localStorage.removeItem('currentAdmin');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
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
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#052954]">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your profile and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={formData.previewImage || admin.profileImage || '/default-avatar.png'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {formData.profileImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">New Image</span>
                    </div>
                  )}
                </div>
                
                <label className="cursor-pointer bg-gradient-to-r from-[#ffa301] to-[#ffa301]/90 text-[#052954] font-semibold px-4 py-2 rounded-lg hover:from-[#ffa301]/90 hover:to-[#ffa301]/80 transition mb-3">
                  Change Photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleChange}
                    name="profileImage"
                  />
                </label>
                
                <p className="text-sm text-gray-500 text-center">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
                
                <div className="mt-6 pt-6 border-t border-gray-200 w-full">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <FaUserTag className="text-[#ffa301]" />
                    <span className="font-medium">{admin.role}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
                    <div className={`w-3 h-3 rounded-full ${admin.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{admin.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-[#052954] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition border border-red-200 text-red-600"
                >
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#052954] flex items-center gap-2">
                  <FaUser className="text-[#ffa301]" />
                  Personal Information
                </h2>
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(admin.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa301] focus:border-[#ffa301] transition"
                      placeholder="Enter your first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa301] focus:border-[#ffa301] transition"
                      placeholder="Enter your last name"
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa301] focus:border-[#ffa301] transition"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          firstName: admin.firstName || '',
                          lastName: admin.lastName || '',
                          email: admin.email || '',
                          profileImage: null,
                          previewImage: admin.profileImage || ''
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-3 bg-gradient-to-r from-[#ffa301] to-[#ffa301]/90 text-[#052954] font-semibold rounded-lg hover:from-[#ffa301]/90 hover:to-[#ffa301]/80 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#052954]"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* School Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-[#052954] mb-6 flex items-center gap-2">
                <FaSchool className="text-[#ffa301]" />
                School Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#052954] rounded-lg">
                      <FaSchool className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">School Name</p>
                      <p className="font-semibold text-[#052954] text-lg">{admin.school?.name || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-[#ffa301] rounded-lg">
                      <FaIdCard className="text-[#052954] text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">School Code</p>
                      <p className="font-semibold text-[#052954] text-lg">{admin.school?.code || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-[#052954] mb-6">Account Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                      <FaUserTag className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Role</p>
                      <p className="font-medium text-gray-800">{admin.role}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">System assigned</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Account Status</p>
                      <p className="font-medium text-gray-800">{admin.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {admin.isActive ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg">
                      <FaCalendarAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium text-gray-800">
                        {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.floor((new Date() - new Date(admin.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#052954] to-[#041e42] rounded-xl shadow-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center bg-[#ffa301] rounded-full">
                <FaLock className="text-white text-xl" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Account Security</h3>
              <div className="mt-2 text-blue-100">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your email address is used for login and notifications</li>
                  <li>Keep your profile information up to date</li>
                  <li>Contact your system administrator for role or school changes</li>
                  <li>Always log out when using shared devices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;