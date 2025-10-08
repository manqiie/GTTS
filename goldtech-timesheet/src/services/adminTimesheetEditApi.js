// src/services/adminTimesheetEditApi.js
const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const adminTimesheetEditApi = {
  // Get timesheet for admin editing
  getTimesheetForEdit: async (userId, year, month) => {
    return apiRequest(`/timesheets/admin-edit/${userId}/${year}/${month}`);
  },

  // Save single entry as admin
  saveEntry: async (userId, entryData, editReason = '') => {
    return apiRequest(`/timesheets/admin-edit/${userId}/entries`, {
      method: 'POST',
      body: JSON.stringify({
        ...entryData,
        editReason
      })
    });
  },

  // Save bulk entries as admin
    saveBulkEntries: async (userId, entries, editReason = '') => {
    console.log('Sending bulk entries:', entries);
    console.log('Edit reason:', editReason);
    
    // Wrap entries and editReason in an object
    const requestBody = {
        entries: entries,
        editReason: editReason
    };
    
    return apiRequest(`/timesheets/admin-edit/${userId}/entries/bulk`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
    });
    },

  // Delete entry as admin
  deleteEntry: async (userId, date, editReason = '') => {
    const params = new URLSearchParams();
    if (editReason) {
      params.append('editReason', editReason);
    }
    return apiRequest(`/timesheets/admin-edit/${userId}/entries/${date}?${params}`, {
      method: 'DELETE'
    });
  }
};