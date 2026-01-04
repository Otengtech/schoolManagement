// src/services/superAdminService.js
import api from './api';

export const superAdminService = {
  // School Management

  // Super Admin Creation (no token required)
  async createSuperAdmin(superAdminData) {
    try {
      
      const response = await api.post('/create-super', superAdminData);
      return response.data;
    } catch (error) {
      console.error('Create super admin error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || { message: 'Failed to create super admin' };
    }
  },
  
  async createSchool(schoolData) {
    try {
      console.log('Creating school with data:', schoolData);
      
      const response = await api.post('/create-school', schoolData);
      console.log('Create school response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create school error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || { message: 'Failed to create school' };
    }
  },

  async listSchools() {
    try {
      const response = await api.get('/schools');
      return response.data;
    } catch (error) {
      console.error('List schools error:', error);
      throw error.response?.data || { message: 'Failed to fetch schools' };
    }
  },

  async updateSchool(id, schoolData) {
    try {
      const response = await api.put(`/update-school/${id}`, schoolData);
      return response.data;
    } catch (error) {
      console.error('Update school error:', error);
      throw error.response?.data || { message: 'Failed to update school' };
    }
  },

  async deleteSchool(id) {
    try {
      const response = await api.delete(`/delete-school/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete school error:', error);
      throw error.response?.data || { message: 'Failed to delete school' };
    }
  },

  // Admin Management
  async createAdmin(adminData, profileImage) {
    try {
      const formData = new FormData();
      
      // Add all admin data to formData
      Object.keys(adminData).forEach(key => {
        if (adminData[key] !== undefined && adminData[key] !== null) {
          formData.append(key, adminData[key]);
        }
      });
      
      // Add profile image
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      console.log('Creating admin with form data');
      const response = await api.post('/create-admin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Create admin response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create admin error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || { message: 'Failed to create admin' };
    }
  },

  // Get single admin by ID
async getAdminById(adminId) {
  try {
    const response = await api.get(`/admins/${adminId}`);
    return response.data;
  } catch (error) {
    console.error('Get admin by ID error:', error);
    throw error.response?.data || { message: 'Failed to fetch admin details' };
  }
},

// Add to superAdminService.js
async getSchoolById(schoolId) {
  try {
    const response = await api.get(`/schools/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Get school error:', error);
    throw error.response?.data || { message: 'Failed to fetch school' };
  }
}, 

  async listAdmins() {
    try {
      const response = await api.get('/admins');
      return response.data;
    } catch (error) {
      console.error('List admins error:', error);
      throw error.response?.data || { message: 'Failed to fetch admins' };
    }
  },

  async updateAdmin(id, adminData, profileImage = null) {
    try {
      const formData = new FormData();
      
      Object.keys(adminData).forEach(key => {
        if (adminData[key] !== undefined && adminData[key] !== null) {
          formData.append(key, adminData[key]);
        }
      });
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await api.put(`/update-admin/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update admin error:', error);
      throw error.response?.data || { message: 'Failed to update admin' };
    }
  },

  async deleteAdmin(id) {
    try {
      const response = await api.delete(`/delete-admin/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete admin error:', error);
      throw error.response?.data || { message: 'Failed to delete admin' };
    }
  }
};