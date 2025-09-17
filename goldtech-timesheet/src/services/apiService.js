// src/services/apiService.js - Centralized API service for user management
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Get headers with auth token
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // User Management API methods
  
  // Get all users with filtering and pagination
  async getUsers(params = {}) {
    return this.get('/users', params);
  }

  // Get user by ID
  async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  // Create new user
  async createUser(userData) {
    return this.post('/users', userData);
  }

  // Update user
  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  // Delete user
  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // Toggle user status
  async toggleUserStatus(id) {
    return this.patch(`/users/${id}/status`);
  }

  // Get managers for dropdown
  async getManagers() {
    return this.get('/users/managers');
  }

  // Get roles for dropdown
  async getRoles() {
    return this.get('/users/roles');
  }

  // Get user statistics
  async getUserStats() {
    return this.get('/users/stats');
  }

  // Bulk update users
  async bulkUpdateUsers(userIds, updates) {
    return this.patch('/users/bulk', { userIds, updates });
  }

  // Reset password
  async resetPassword(id, newPassword) {
    return this.patch(`/users/${id}/reset-password`, { newPassword });
  }

  // Transform backend user data to frontend format
  transformUserData(backendUser) {
    return {
      id: backendUser.id,
      employee_id: backendUser.employeeId,
      email: backendUser.email,
      full_name: backendUser.fullName,
      phone: backendUser.phone,
      position: backendUser.position,
      department: backendUser.department,
      project_site: backendUser.projectSite,
      company: backendUser.company,
      join_date: backendUser.joinDate,
      manager_name: backendUser.managerName,
      status: backendUser.status,
      roles: backendUser.roles || [],
      created_at: backendUser.createdAt,
      updated_at: backendUser.updatedAt,
      last_login_at: backendUser.lastLoginAt
    };
  }

  // Transform frontend user data to backend format
  transformToBackendFormat(frontendUser) {
    return {
      employeeId: frontendUser.employee_id || null,
      email: frontendUser.email,
      fullName: frontendUser.full_name,
      phone: frontendUser.phone || null,
      position: frontendUser.position,
      department: frontendUser.department,
      projectSite: frontendUser.project_site || null,
      company: frontendUser.company || null,
      joinDate: frontendUser.join_date,
      managerId: frontendUser.manager_id || null,
      roles: frontendUser.roles?.map(role => typeof role === 'object' ? role.id : role) || [],
      status: frontendUser.status
    };
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;