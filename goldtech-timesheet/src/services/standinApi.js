const API_BASE_URL = 'http://localhost:8080/api';

const getAuthToken = () => localStorage.getItem('authToken');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = { headers: getHeaders(), ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return;
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

export const standinApi = {
  // Get all stand-ins for current supervisor
  getMyStandins: async () => {
    return apiRequest('/standin/my-standins');
  },

  // Get active stand-in
  getActiveStandin: async () => {
    return apiRequest('/standin/active');
  },

  // Get stand-in by ID
  getStandinById: async (standinId) => {
    return apiRequest(`/standin/${standinId}`);
  },

  // Create new stand-in
  createStandin: async (standinData) => {
    return apiRequest('/standin/create', {
      method: 'POST',
      body: JSON.stringify(standinData)
    });
  },

  // Update stand-in
  updateStandin: async (standinId, standinData) => {
    return apiRequest(`/standin/${standinId}`, {
      method: 'PUT',
      body: JSON.stringify(standinData)
    });
  },

  // Cancel stand-in
  cancelStandin: async (standinId) => {
    return apiRequest(`/standin/${standinId}/cancel`, {
      method: 'PATCH'
    });
  },

  // Delete stand-in
  deleteStandin: async (standinId) => {
    return apiRequest(`/standin/${standinId}`, {
      method: 'DELETE'
    });
  },

  // Get approval history for stand-in
  getStandinApprovals: async (standinId) => {
    return apiRequest(`/standin/${standinId}/approvals`);
  },

  // Get all stand-in approvals (admin only)
  getAllStandinApprovals: async () => {
    return apiRequest('/standin/approvals/all');
  }
};