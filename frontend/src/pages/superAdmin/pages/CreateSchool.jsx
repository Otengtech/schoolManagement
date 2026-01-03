// src/pages/super-admin/CreateSchool.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateSchool = () => {
  // API Configuration
  const API_URL = 'https://school-management-system-backend-three.vercel.app';
  const ENDPOINT = '/create-school';
  const FULL_URL = `${API_URL}${ENDPOINT}`;
  
  const [schoolData, setSchoolData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    tokenExists: false,
    tokenLength: 0,
    userRole: null,
    isSuperAdmin: false
  });

  // Load token and user on mount
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Loading auth data...');
    console.log('Token from localStorage:', storedToken ? `${storedToken.substring(0, 30)}...` : 'No token');
    console.log('User from localStorage:', storedUser);
    
    if (storedToken) {
      setToken(storedToken);
      
      // Decode token to check contents
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        setDebugInfo({
          tokenExists: !!storedToken,
          tokenLength: storedToken?.length || 0,
          userRole: parsedUser?.role,
          isSuperAdmin: parsedUser?.role === 'super_admin' || parsedUser?.role === 'super-admin'
        });
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    
    if (!storedToken) {
      toast.error('Please login first');
    } else if (!storedUser) {
      toast.warning('User data not found. Please login again.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!token) {
      toast.error('Authentication required. Please login first.');
      return;
    }
    
    // Check if user is super admin
    const userData = user ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const userRole = userData.role;
    
    if (!['super_admin', 'super-admin'].includes(userRole)) {
      toast.error('Access denied. Super admin privileges required.');
      console.log('Current user role:', userRole);
      return;
    }

    // Validate required fields
    if (!schoolData.name || !schoolData.code || !schoolData.email) {
      toast.error('Name, code, and email are required');
      return;
    }

    setLoading(true);
    console.log('🚀 Submitting school creation request...');

    try {
      console.log('📤 Request Details:');
      console.log('URL:', FULL_URL);
      console.log('Token:', `${token.substring(0, 30)}...`);
      console.log('Data:', schoolData);
      
      const response = await axios.post(FULL_URL, schoolData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      
      console.log('✅ Response:', response.data);
      
      toast.success(response.data.message || 'School created successfully!');
      
      // Reset form
      setSchoolData({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: ''
      });
      
    } catch (error) {
      console.error('❌ Error creating school:', error);
      
      let errorMessage = 'Failed to create school';
      
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', error.response.data);
        console.error('Response Headers:', error.response.headers);
        
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Bad request';
            break;
          case 401:
            errorMessage = 'Session expired or invalid token. Please login again.';
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            setTimeout(() => window.location.href = '/login', 2000);
            break;
          case 403:
            errorMessage = 'Access denied. You need super admin privileges.';
            break;
          case 404:
            errorMessage = 'Endpoint not found. Please check the URL.';
            break;
          case 409:
            errorMessage = error.response.data?.message || 'School with this code or email already exists';
            break;
          case 422:
            errorMessage = error.response.data?.errors?.[0]?.msg || 'Validation error';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || `Error: ${error.response.status}`;
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Check your connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Test login with sample credentials
  const testLogin = async () => {
    try {
      toast.info('Attempting test login...');
      
      // Try to login - you need to replace these with actual super admin credentials
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'superadmin@school.com', // Replace with actual super admin email
        password: 'superadmin123',       // Replace with actual password
        role: 'super_admin'
      });
      
      if (loginResponse.data.token) {
        localStorage.setItem('token', loginResponse.data.token);
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
        loadAuthData();
        toast.success('Test login successful!');
      }
    } catch (error) {
      console.error('Test login failed:', error.response?.data);
      toast.error('Test login failed. Need valid super admin credentials.');
    }
  };

  // Test the endpoint directly
  const testEndpoint = async () => {
    try {
      console.log('🧪 Testing endpoint...');
      console.log('Full URL:', FULL_URL);
      console.log('Current token:', token ? `${token.substring(0, 30)}...` : 'No token');
      
      if (!token) {
        toast.error('No token found. Please login first.');
        return;
      }

      const response = await fetch(FULL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test School',
          code: 'TEST001',
          email: 'test@school.com',
          phone: '1234567890',
          address: 'Test Address'
        })
      });
      
      const data = await response.json();
      console.log('Test Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      toast.info(`Test: ${response.status} - ${data.message || 'No message'}`);
      
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed: ' + error.message);
    }
  };

  // Check token validity
  const checkToken = () => {
    if (!token) {
      toast.error('No token found');
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = now > expiresAt;
      
      toast.info(
        `Token expires: ${expiresAt.toLocaleString()}\n` +
        `Is expired: ${isExpired ? 'YES' : 'NO'}\n` +
        `User role: ${user?.role || 'Unknown'}`
      );
    } catch (e) {
      toast.error('Invalid token format');
    }
  };

  // Clear authentication
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setDebugInfo({
      tokenExists: false,
      tokenLength: 0,
      userRole: null,
      isSuperAdmin: false
    });
    toast.info('Authentication cleared');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New School</h2>
      
      {/* Debug Panel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-bold text-lg mb-3 text-gray-700">🔧 Debug Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">API URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{API_URL}</code>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Endpoint:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{ENDPOINT}</code>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Full URL:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm truncate">{FULL_URL}</code>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Token Exists:</span>
              <span className={`px-2 py-1 rounded text-sm ${debugInfo.tokenExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {debugInfo.tokenExists ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Token Length:</span>
              <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                {debugInfo.tokenLength} chars
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">User Role:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                debugInfo.isSuperAdmin ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {debugInfo.userRole || 'Not logged in'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadAuthData}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            🔄 Reload Auth Data
          </button>
          <button
            onClick={checkToken}
            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
            disabled={!token}
          >
            🔍 Check Token
          </button>
          <button
            onClick={testEndpoint}
            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
            disabled={!token}
          >
            🧪 Test Endpoint
          </button>
          <button
            onClick={testLogin}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
          >
            🔐 Test Login
          </button>
          <button
            onClick={clearAuth}
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
          >
            🗑️ Clear Auth
          </button>
        </div>
      </div>
      
      {/* Requirements Note */}
      {!debugInfo.isSuperAdmin && debugInfo.tokenExists && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 font-medium">
            ⚠️ Warning: Your account role is "{debugInfo.userRole}". 
            You need "super_admin" role to create schools.
          </p>
        </div>
      )}
      
      {/* Create School Form */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">School Information</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name *
              </label>
              <input
                type="text"
                value={schoolData.name}
                onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Enter school name"
                required
                disabled={loading || !debugInfo.isSuperAdmin}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Code *
              </label>
              <input
                type="text"
                value={schoolData.code}
                onChange={(e) => setSchoolData({...schoolData, code: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., SCH001"
                required
                disabled={loading || !debugInfo.isSuperAdmin}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={schoolData.email}
              onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="school@example.com"
              required
              disabled={loading || !debugInfo.isSuperAdmin}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={schoolData.phone}
              onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="+1 (234) 567-8900"
              disabled={loading || !debugInfo.isSuperAdmin}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={schoolData.address}
              onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              rows="3"
              placeholder="Full school address"
              disabled={loading || !debugInfo.isSuperAdmin}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !debugInfo.isSuperAdmin || !token}
              className={`px-6 py-3 rounded-lg font-medium text-white transition ${
                loading || !debugInfo.isSuperAdmin || !token
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating School...
                </span>
              ) : (
                'Create School'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setSchoolData({
                name: '',
                code: '',
                email: '',
                phone: '',
                address: ''
              })}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              disabled={loading}
            >
              Clear Form
            </button>
          </div>
          
          {(!debugInfo.isSuperAdmin || !token) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700 text-sm">
                {!token ? '🔒 Please login first' : '⚠️ You need super admin privileges to create schools'}
              </p>
            </div>
          )}
        </form>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">📝 Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Login with a super admin account first</li>
          <li>2. Check the debug panel to verify your role is "super_admin"</li>
          <li>3. Fill in all required fields (marked with *)</li>
          <li>4. Click "Create School" to submit</li>
          <li>5. Use test buttons to debug if needed</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateSchool;