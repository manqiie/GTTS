// src/api/timesheetApi.js
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get headers with auth token
 */
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Generic API request method
 */
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

/**
 * Timesheet API methods
 */
export const timesheetApi = {
  // Get timesheet data for a specific month
  getTimesheet: async (year, month) => {
    return apiRequest(`/timesheets/${year}/${month}`);
  },

  // Get available months for timesheet submission
  getAvailableMonths: async () => {
    return apiRequest('/timesheets/available-months');
  },

  // Check if timesheet can be submitted
  checkSubmissionEligibility: async (year, month) => {
    return apiRequest(`/timesheets/${year}/${month}/can-submit`);
  },

  // Get working hours presets
  getWorkingHoursPresets: async () => {
    return apiRequest('/timesheets/working-hours-presets');
  },

  // Save multiple entries (bulk)
  saveBulkEntries: async (entries) => {
    return apiRequest('/timesheets/entries/bulk', {
      method: 'POST',
      body: JSON.stringify(entries)
    });
  },

  // Delete a single entry
  deleteEntry: async (date) => {
    return apiRequest(`/timesheets/entries/${date}`, {
      method: 'DELETE'
    });
  },

  // Submit timesheet for approval
  submitTimesheet: async (year, month) => {
    return apiRequest(`/timesheets/${year}/${month}/submit`, {
      method: 'POST'
    });
  },

  // Add custom working hours preset
  addWorkingHoursPreset: async (preset) => {
    return apiRequest('/timesheets/working-hours-presets', {
      method: 'POST',
      body: JSON.stringify({
        name: preset.name || 'Custom Hours',
        startTime: preset.startTime,
        endTime: preset.endTime
      })
    });
  },

  // Remove custom working hours preset
  removeWorkingHoursPreset: async (presetId) => {
    return apiRequest(`/timesheets/working-hours-presets/${presetId}`, {
      method: 'DELETE'
    });
  },

  // Get timesheet history
  getTimesheetHistory: async () => {
    return apiRequest('/timesheets/history');
  }
};