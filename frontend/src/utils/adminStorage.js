// utils/adminStorage.js
export const adminStorage = {
  // Store admin data when admin is created or logs in
  storeAdminData: (adminData) => {
    if (!adminData || !adminData.email) {
      console.error('Cannot store admin data without email');
      return false;
    }
    
    const email = adminData.email;
    
    try {
      // Store admin data with email key
      localStorage.setItem(`user_${email}`, JSON.stringify(adminData));
      
      // Store school info separately if available
      if (adminData.school || adminData.schoolName) {
        const schoolInfo = {
          name: adminData.school?.name || adminData.schoolName,
          id: adminData.school?.id || adminData.schoolId,
          code: adminData.school?.code || ''
        };
        localStorage.setItem(`school_${email}`, JSON.stringify(schoolInfo));
      }
      
      // Set as current active admin
      localStorage.setItem('currentActiveEmail', email);
      
      // Also store current admin data for quick access
      localStorage.setItem(`currentAdmin_${email}`, JSON.stringify(adminData));
      
      console.log(`✅ Admin data stored for: ${email}`);
      return true;
    } catch (error) {
      console.error(`Error storing admin data for ${email}:`, error);
      return false;
    }
  },

  // Get current admin's data
  getCurrentAdminData: () => {
    const currentEmail = localStorage.getItem('currentActiveEmail');
    
    if (!currentEmail) {
      console.log('No current active email found');
      return null;
    }
    
    try {
      // Try to get from currentAdmin storage first (fastest)
      const currentAdminData = localStorage.getItem(`currentAdmin_${currentEmail}`);
      if (currentAdminData) {
        return JSON.parse(currentAdminData);
      }
      
      // Fallback to user storage
      const adminData = localStorage.getItem(`user_${currentEmail}`);
      if (adminData) {
        return JSON.parse(adminData);
      }
    } catch (error) {
      console.error(`Error getting admin data for ${currentEmail}:`, error);
    }
    
    return null;
  },

  // Get admin data by specific email
  getAdminDataByEmail: (email) => {
    try {
      const adminData = localStorage.getItem(`user_${email}`);
      return adminData ? JSON.parse(adminData) : null;
    } catch (error) {
      console.error(`Error getting admin data for ${email}:`, error);
      return null;
    }
  },

  // Update admin data
  updateAdminData: (updatedData) => {
    const currentEmail = localStorage.getItem('currentActiveEmail');
    
    if (!currentEmail) {
      console.error('No current active email to update');
      return false;
    }
    
    try {
      // Get existing data
      const existingData = this.getAdminDataByEmail(currentEmail) || {};
      
      // Merge with new data
      const mergedData = {
        ...existingData,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      // Store updated data
      localStorage.setItem(`user_${currentEmail}`, JSON.stringify(mergedData));
      localStorage.setItem(`currentAdmin_${currentEmail}`, JSON.stringify(mergedData));
      
      console.log(`✅ Admin data updated for: ${currentEmail}`);
      return true;
    } catch (error) {
      console.error('Error updating admin data:', error);
      return false;
    }
  },

  // Get all stored admin emails (for debugging)
  getAllAdminEmails: () => {
    const emails = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('user_')) {
        emails.push(key.replace('user_', ''));
      }
    }
    return emails;
  },

  // Clear session data only (not permanent storage) on logout
  clearSessionData: (email = null) => {
    const emailToClear = email || localStorage.getItem('currentActiveEmail');
    
    if (emailToClear) {
      // Clear session-specific data
      localStorage.removeItem(`currentAdmin_${emailToClear}`);
      localStorage.removeItem(`token_${emailToClear}`);
      
      console.log(`✅ Session data cleared for: ${emailToClear}`);
    }
    
    // Clear current active email
    localStorage.removeItem('currentActiveEmail');
  },

  // Clear all data including permanent storage (only use for account deletion)
  clearAllAdminData: (email = null) => {
    const emailToClear = email || localStorage.getItem('currentActiveEmail');
    
    if (emailToClear) {
      // Clear all data
      localStorage.removeItem(`user_${emailToClear}`);
      localStorage.removeItem(`token_${emailToClear}`);
      localStorage.removeItem(`currentAdmin_${emailToClear}`);
      localStorage.removeItem(`school_${emailToClear}`);
      console.log(`✅ All admin data cleared for: ${emailToClear}`);
    }
    
    // Clear current active email
    localStorage.removeItem('currentActiveEmail');
  }
};