// useSupervisorStore.js - Hook for managing supervisors
import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { message } from 'antd';

export function useSupervisorStore() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupervisors();
  }, []);

  const loadSupervisors = async (filters = {}) => {
    setLoading(true);
    try {
      // Get all users with supervisor role
      const response = await apiService.getUsers({
        page: 0,
        size: 1000,
        sortBy: 'fullName',
        sortDir: 'asc',
        role: 'supervisor', // Filter for supervisor role
        ...filters
      });

      if (response.success && response.data) {
        // Transform and filter users who have supervisor role
        const transformedSupervisors = response.data
          .map(user => apiService.transformUserData(user))
          .filter(user => user.roles && user.roles.some(role => role.name === 'supervisor'));
        
        setSupervisors(transformedSupervisors);
      } else {
        console.error('Failed to load supervisors:', response.message);
        message.error('Failed to load supervisors');
        setSupervisors([]);
      }
    } catch (error) {
      console.error('Error loading supervisors:', error);
      message.error('Error loading supervisors: ' + error.message);
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  const createSupervisor = async (supervisorData) => {
    try {
      const backendData = {
        email: supervisorData.email,
        password: supervisorData.password,
        fullName: supervisorData.full_name,
        phone: null,
        client: supervisorData.client || null,
        position: null,
        department: supervisorData.department || null,
        location: supervisorData.location || null,
        joinDate: null,
        supervisorId: null,
        roles: supervisorData.roles
      };

      const response = await apiService.createUser(backendData);

      if (response.success && response.data) {
        const transformedUser = apiService.transformUserData(response.data);
        
        setSupervisors(prev => [...prev, transformedUser]);
        
        message.success(`Supervisor ${transformedUser.full_name} created successfully!`);
        return transformedUser;
      } else {
        const errorMsg = response.message || 'Failed to create supervisor';
        message.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error creating supervisor:', error);
      message.error('Failed to create supervisor: ' + error.message);
      throw error;
    }
  };

  const updateSupervisor = async (id, updates) => {
    try {
      const backendUpdates = {
        email: updates.email,
        fullName: updates.full_name,
        phone: null,
        client: updates.client || null,
        position: null,
        department: updates.department || null,
        location: updates.location || null,
        joinDate: null,
        supervisorId: null,
        roles: updates.roles?.map(role => typeof role === 'object' ? role.id : role) || [],
        status: updates.status
      };

      const response = await apiService.updateUser(id, backendUpdates);

      if (response.success && response.data) {
        const transformedUser = apiService.transformUserData(response.data);
        
        setSupervisors(prev => 
          prev.map(sup => sup.id === id ? transformedUser : sup)
        );
        
        message.success(`Supervisor ${transformedUser.full_name} updated successfully!`);
        return transformedUser;
      } else {
        const errorMsg = response.message || 'Failed to update supervisor';
        message.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error updating supervisor:', error);
      message.error('Failed to update supervisor: ' + error.message);
      throw error;
    }
  };

  const toggleSupervisorStatus = async (id) => {
    try {
      const response = await apiService.toggleUserStatus(id);

      if (response.success && response.data) {
        const transformedUser = apiService.transformUserData(response.data);
        
        setSupervisors(prev => 
          prev.map(sup => sup.id === id ? transformedUser : sup)
        );
        
        const statusMsg = transformedUser.status === 'ACTIVE' ? 'activated' : 'deactivated';
        message.success(`Supervisor ${statusMsg} successfully`);
        return transformedUser;
      } else {
        const errorMsg = response.message || 'Failed to update supervisor status';
        message.error(errorMsg);
        return null;
      }
    } catch (error) {
      console.error('Error toggling supervisor status:', error);
      message.error('Failed to update supervisor status: ' + error.message);
      return null;
    }
  };

  const getSupervisor = (id) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return supervisors.find(sup => sup.id === numId);
  };

  const getActiveSupervisors = () => {
    return supervisors.filter(sup => sup.status === 'ACTIVE');
  };

  const searchSupervisors = (searchTerm, filters = {}) => {
    let filteredSupervisors = [...supervisors];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredSupervisors = filteredSupervisors.filter(sup => 
        sup.full_name.toLowerCase().includes(term) ||
        sup.email.toLowerCase().includes(term) ||
        (sup.client && sup.client.toLowerCase().includes(term)) ||
        (sup.department && sup.department.toLowerCase().includes(term)) ||
        (sup.location && sup.location.toLowerCase().includes(term))
      );
    }

    if (filters.status && filters.status !== 'all') {
      filteredSupervisors = filteredSupervisors.filter(sup => sup.status === filters.status);
    }

    if (filters.client && filters.client !== 'all') {
      filteredSupervisors = filteredSupervisors.filter(sup => sup.client === filters.client);
    }

    if (filters.department && filters.department !== 'all') {
      filteredSupervisors = filteredSupervisors.filter(sup => sup.department === filters.department);
    }

    if (filters.location && filters.location !== 'all') {
      filteredSupervisors = filteredSupervisors.filter(sup => sup.location === filters.location);
    }

    return filteredSupervisors;
  };

  return {
    supervisors,
    loading,
    createSupervisor,
    updateSupervisor,
    toggleSupervisorStatus,
    getSupervisor,
    getActiveSupervisors,
    searchSupervisors,
    loadSupervisors
  };
}