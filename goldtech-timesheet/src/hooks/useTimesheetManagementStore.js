// src/hooks/useTimesheetManagement.js
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { timesheetManagementApi } from '../services/timesheetManagementApi';

export function useTimesheetManagement() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    clients: [],
    departments: [],
    locations: [],
    supervisors: []
  });

  /**
   * Load all timesheets with filters
   */
  const loadTimesheets = async (filters = {}) => {
    setLoading(true);
    try {
      console.log('Loading timesheets with filters:', filters);
      
      const response = await timesheetManagementApi.getAllTimesheets(filters);
      
      if (response.success && response.data) {
        console.log('Timesheets loaded successfully:', response.data.length);
        setTimesheets(response.data);
      } else {
        console.log('No timesheet data received or API error');
        message.warning('Could not load timesheets from server');
      }
    } catch (error) {
      console.error('Error loading timesheets:', error);
      message.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load filter options with cascading support
   */
  const loadFilterOptions = async (client = null, department = null) => {
    try {
      const response = await timesheetManagementApi.getFilterOptions(client, department);
      
      if (response.success && response.data) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  /**
   * Get timesheet details by ID
   */
  const getTimesheetDetails = async (timesheetId) => {
    try {
      console.log('Getting timesheet details for ID:', timesheetId);
      
      const response = await timesheetManagementApi.getTimesheetDetails(timesheetId);
      
      if (response.success && response.data) {
        console.log('Timesheet details loaded successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get timesheet details');
      }
    } catch (error) {
      console.error('Error getting timesheet details:', error);
      message.error('Failed to load timesheet details');
      return null;
    }
  };

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  return {
    timesheets,
    loading,
    filterOptions,
    loadTimesheets,
    loadFilterOptions,
    getTimesheetDetails
  };
}