// useEmployeeStore.js - Updated to use real API instead of localStorage
import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { message } from 'antd';

export function useEmployeeStore() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load employees from API on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await apiService.getUsers({
        page: 0,
        size: 1000, // Get all users for now
        sortBy: 'fullName',
        sortDir: 'asc',
        ...filters
      });

      if (response.success && response.data) {
        // Transform backend data to frontend format
        const transformedEmployees = response.data.map(user => 
          apiService.transformUserData(user)
        );
        setEmployees(transformedEmployees);
      } else {
        console.error('Failed to load users:', response.message);
        message.error('Failed to load users');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      message.error('Error loading users: ' + error.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData) => {
    try {
      // Transform frontend data to backend format
      const backendData = {
        employeeId: employeeData.employee_id || null,
        email: employeeData.email,
        password: employeeData.password,
        fullName: employeeData.full_name,
        phone: employeeData.phone || null,
        position: employeeData.position,
        department: employeeData.department,
        projectSite: employeeData.project_site || null,
        company: employeeData.company || null,
        joinDate: employeeData.join_date, // Should already be in YYYY-MM-DD format
        supervisorId: employeeData.supervisor_id || null,
        roles: employeeData.roles // Array of role IDs
      };

      const response = await apiService.createUser(backendData);

      if (response.success && response.data) {
        const transformedUser = apiService.transformUserData(response.data);
        
        // Update local state
        setEmployees(prev => [...prev, transformedUser]);
        
        message.success(`User ${transformedUser.full_name} created successfully!`);
        return transformedUser;
      } else {
        const errorMsg = response.message || 'Failed to create user';
        message.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      message.error('Failed to create user: ' + error.message);
      throw error;
    }
  };

const updateEmployee = async (id, updates) => {
  try {
    console.log('useEmployeeStore.updateEmployee called');
    console.log('ID:', id);
    console.log('Updates received:', updates);
    console.log('Supervisor ID in updates:', updates.supervisor_id);

    // Transform frontend updates to backend format
    const backendUpdates = {
      employeeId: updates.employee_id || null,
      email: updates.email,
      fullName: updates.full_name,
      phone: updates.phone || null,
      position: updates.position,
      department: updates.department,
      projectSite: updates.project_site || null,
      company: updates.company || null,
      joinDate: updates.join_date,
      
      // CRITICAL: Map supervisor_id properly
      supervisorId: updates.supervisor_id || null,
      
      roles: updates.roles?.map(role => typeof role === 'object' ? role.id : role) || [],
      status: updates.status
    };

    console.log('Backend updates being sent:', backendUpdates);
    console.log('Supervisor ID being sent to backend:', backendUpdates.supervisorId);

    const response = await apiService.updateUser(id, backendUpdates);
    console.log('API response:', response);

    if (response.success && response.data) {
      const transformedUser = apiService.transformUserData(response.data);
      console.log('Transformed user data:', transformedUser);
      console.log('Transformed supervisor fields:', {
        supervisor_id: transformedUser.supervisor_id,
        supervisor_name: transformedUser.supervisor_name
      });
      
      // Update local state
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? transformedUser : emp)
      );
      
      message.success(`User ${transformedUser.full_name} updated successfully!`);
      return transformedUser;
    } else {
      const errorMsg = response.message || 'Failed to update user';
      message.error(errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    message.error('Failed to update user: ' + error.message);
    throw error;
  }
};

  const deleteEmployee = async (id) => {
    try {
      const response = await apiService.deleteUser(id);

      if (response.success) {
        // Update local state
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        
        message.success('User deleted successfully');
        return true;
      } else {
        const errorMsg = response.message || 'Failed to delete user';
        message.error(errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user: ' + error.message);
      return false;
    }
  };

  const toggleEmployeeStatus = async (id) => {
    try {
      const response = await apiService.toggleUserStatus(id);

      if (response.success && response.data) {
        const transformedUser = apiService.transformUserData(response.data);
        
        // Update local state
        setEmployees(prev => 
          prev.map(emp => emp.id === id ? transformedUser : emp)
        );
        
        const statusMsg = transformedUser.status === 'ACTIVE' ? 'activated' : 'deactivated';
        message.success(`User ${statusMsg} successfully`);
        return transformedUser;
      } else {
        const errorMsg = response.message || 'Failed to update user status';
        message.error(errorMsg);
        return null;
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      message.error('Failed to update user status: ' + error.message);
      return null;
    }
  };

  const getEmployee = (id) => {
    // Convert string ID to number if necessary
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return employees.find(emp => emp.id === numId);
  };

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.status === 'ACTIVE');
  };

  const getEmployeesByRole = (roleName) => {
    return employees.filter(emp => 
      emp.roles && emp.roles.some(role => role.name === roleName)
    );
  };

  const getManagers = async () => {
    try {
      const response = await apiService.getManagers();
      if (response.success && response.data) {
        return response.data.map(manager => 
          apiService.transformUserData(manager)
        );
      }
      return [];
    } catch (error) {
      console.error('Error loading managers:', error);
      return [];
    }
  };

  const searchEmployees = (searchTerm, filters = {}) => {
    let filteredEmployees = [...employees];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.full_name.toLowerCase().includes(term) ||
        (emp.employee_id && emp.employee_id.toLowerCase().includes(term)) ||
        emp.email.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term) ||
        (emp.project_site && emp.project_site.toLowerCase().includes(term)) ||
        (emp.manager_name && emp.manager_name.toLowerCase().includes(term)) ||
        (emp.department && emp.department.toLowerCase().includes(term)) ||
        (emp.company && emp.company.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === filters.status);
    }

    // Role filter
    if (filters.role && filters.role !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.roles && emp.roles.some(role => role.name === filters.role)
      );
    }

    // Other filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all' && key !== 'status' && key !== 'role') {
        const field = key === 'projectSite' ? 'project_site' : key;
        filteredEmployees = filteredEmployees.filter(emp => emp[field] === filters[key]);
      }
    });

    return filteredEmployees;
  };

  const getEmployeeStats = async () => {
    try {
      const response = await apiService.getUserStats();
      if (response.success && response.data) {
        return response.data;
      }
      
      // Fallback to local calculation
      const total = employees.length;
      const active = employees.filter(emp => emp.status === 'ACTIVE').length;
      const inactive = employees.filter(emp => emp.status === 'INACTIVE').length;
      
      const roleStats = {
        admin: employees.filter(emp => emp.roles?.some(role => role.name === 'admin')).length,
        manager: employees.filter(emp => emp.roles?.some(role => role.name === 'manager')).length,
        employee: employees.filter(emp => emp.roles?.some(role => role.name === 'employee')).length
      };

      const departmentStats = {};
      employees.forEach(emp => {
        if (emp.department) {
          departmentStats[emp.department] = (departmentStats[emp.department] || 0) + 1;
        }
      });

      return { total, active, inactive, roleStats, departmentStats };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { total: 0, active: 0, inactive: 0, roleStats: {}, departmentStats: {} };
    }
  };

  const bulkUpdateEmployees = async (employeeIds, updates) => {
    try {
      const response = await apiService.bulkUpdateUsers(employeeIds, updates);

      if (response.success && response.data) {
        const transformedUsers = response.data.map(user => 
          apiService.transformUserData(user)
        );

        // Update local state
        setEmployees(prev => 
          prev.map(emp => {
            const updated = transformedUsers.find(u => u.id === emp.id);
            return updated || emp;
          })
        );

        message.success('Users updated successfully');
        return transformedUsers;
      } else {
        const errorMsg = response.message || 'Failed to update users';
        message.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error bulk updating users:', error);
      message.error('Failed to update users: ' + error.message);
      throw error;
    }
  };

  const validateEmployee = (employeeData) => {
    const errors = [];

    // Required field validation
    if (!employeeData.full_name?.trim()) {
      errors.push('Full name is required');
    }

    if (!employeeData.email?.trim()) {
      errors.push('Email is required');
    }

    if (!employeeData.position?.trim()) {
      errors.push('Position is required');
    }

    if (!employeeData.department?.trim()) {
      errors.push('Department is required');
    }

    if (!employeeData.roles || employeeData.roles.length === 0) {
      errors.push('At least one role must be selected');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (employeeData.email && !emailRegex.test(employeeData.email)) {
      errors.push('Invalid email format');
    }

    // Phone format validation (Singapore format)
    const phoneRegex = /^\+65\s\d{4}\s\d{4}$/;
    if (employeeData.phone && !phoneRegex.test(employeeData.phone)) {
      errors.push('Phone must be in Singapore format: +65 1234 5678');
    }

    // Note: Duplicate checking is now handled by the backend
    // The backend will return appropriate error messages

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    employees,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    getEmployee,
    getActiveEmployees,
    getEmployeesByRole,
    getManagers,
    searchEmployees,
    getEmployeeStats,
    bulkUpdateEmployees,
    validateEmployee,
    loadEmployees
  };
}