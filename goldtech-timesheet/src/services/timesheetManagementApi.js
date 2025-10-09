// src/services/timesheetManagementApi.js
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

export const timesheetManagementApi = {
  // Get all timesheets with filters
  getAllTimesheets: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.client && filters.client !== 'all') params.append('client', filters.client);
    if (filters.department && filters.department !== 'all') params.append('department', filters.department);
    if (filters.location && filters.location !== 'all') params.append('location', filters.location);
    if (filters.month && filters.month !== 'all') params.append('month', filters.month);
    if (filters.year && filters.year !== 'all') params.append('year', filters.year);
    if (filters.supervisorId && filters.supervisorId !== 'all') params.append('supervisorId', filters.supervisorId);
    
    const queryString = params.toString();
    const endpoint = `/timesheets/management/all${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get timesheet details by ID
  getTimesheetDetails: async (timesheetId) => {
    return apiRequest(`/timesheets/management/${timesheetId}/details`);
  },

  // Get filter options with cascading support
  getFilterOptions: async (client = null, department = null) => {
    const params = new URLSearchParams();
    if (client && client !== 'all') params.append('client', client);
    if (department && department !== 'all') params.append('department', department);
    
    const queryString = params.toString();
    const endpoint = `/timesheets/management/filters${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Download timesheet as PDF 
  downloadTimesheetPdf: async (timesheetId) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/timesheets/management/${timesheetId}/download`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'timesheet.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'PDF downloaded successfully' };

    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }
}; 