// Enhanced useApproveTimesheetStore.js - Better API integration with statistics
import { useState, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Enhanced hook for managing timesheet approval data with API integration
 */
export function useApproveTimesheetStore() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);

  // API helper functions
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

  // Load timesheet data on mount
  useEffect(() => {
    loadTimesheets();
  }, []);

  /**
   * Load all timesheets for approval from API
   */
  const loadTimesheets = async (statusFilter = 'all') => {
    setLoading(true);
    try {
      console.log('Loading timesheets for approval from API...');
      
      const response = await apiRequest(`/timesheets/approval/all?status=${statusFilter}`);
      
      if (response.success && response.data) {
        console.log('Timesheets loaded successfully:', response.data);
        
        // Transform API data to match frontend format
        const transformedTimesheets = response.data.map(transformApiTimesheetToFrontend);
        setTimesheets(transformedTimesheets);
      } else {
        console.log('No timesheet data received or API error');
        message.warning('Could not load timesheets from server, showing test data');
      }
    } catch (error) {
      console.error('Error loading timesheets for approval:', error);
      message.error('Failed to load timesheets for approval');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update timesheet approval status via API
   */
  const updateTimesheetApproval = async (timesheetId, decision, comments = '') => {
    try {
      console.log('Updating timesheet approval:', { timesheetId, decision, comments });
      
      const response = await apiRequest(`/timesheets/approval/${timesheetId}/decision`, {
        method: 'POST',
        body: JSON.stringify({
          decision: decision,
          comments: comments
        })
      });
      
      if (response.success) {
        console.log('Timesheet approval updated successfully');
        
        // Update local state
        setTimesheets(prevTimesheets => 
          prevTimesheets.map(ts => 
            ts.id === timesheetId 
              ? { 
                  ...ts, 
                  status: decision,
                  lastUpdated: new Date().toISOString(),
                  approvalComments: comments,
                  approvedBy: 'Current Manager', // This would come from auth context in real implementation
                  approvedAt: new Date().toISOString()
                }
              : ts
          )
        );
        
        message.success(`Timesheet ${decision} successfully`);
        return true;
      } else {
        throw new Error(response.message || 'Failed to update approval');
      }
    } catch (error) {
      console.error('Error updating timesheet approval:', error);
      message.error('Failed to update timesheet approval: ' + error.message);
      return false;
    }
  };

  /**
   * Search and filter timesheets for approval
   */
  const searchTimesheets = (searchTerm, filters = {}) => {
    let filteredTimesheets = [...timesheets];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTimesheets = filteredTimesheets.filter(ts => 
        ts.employeeName.toLowerCase().includes(term) ||
        ts.employeeId.toLowerCase().includes(term) ||
        ts.location.toLowerCase().includes(term) ||
        ts.position.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.status === filters.status);
    }

    // Project Site filter
    if (filters.location && filters.location !== 'all') {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.location === filters.location);
    }

    // Month filter
    if (filters.month && filters.month !== 'all') {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.month === parseInt(filters.month));
    }

    // Year filter
    if (filters.year && filters.year !== 'all') {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.year === parseInt(filters.year));
    }

    return filteredTimesheets;
  };

  /**
   * Get detailed timesheet data for approval review
   */
  const getTimesheetDetails = async (timesheetId) => {
    try {
      console.log('Getting timesheet details for approval:', timesheetId);
      
      const response = await apiRequest(`/timesheets/approval/${timesheetId}/details`);
      
      if (response.success && response.data) {
        console.log('Timesheet details loaded successfully');
        
        // Transform the detailed response
        const timesheet = timesheets.find(ts => ts.id === timesheetId);
        if (!timesheet) return null;

        // Merge basic timesheet info with detailed data
        return {
          ...timesheet,
          entries: response.data.entries || {},
          totalDays: Object.keys(response.data.entries || {}).length,
          workingDays: Object.values(response.data.entries || {}).filter(entry => entry.type === 'working_hours').length,
          leaveDays: Object.values(response.data.entries || {}).filter(entry => 
            ['annual_leave', 'medical_leave', 'off_in_lieu', 'childcare_leave', 
             'hospitalization_leave', 'maternity_leave', 'paternity_leave', 
             'compassionate_leave'].includes(entry.type)
          ).length,
          totalHours: calculateTotalHours(Object.values(response.data.entries || {})),
          leaveBreakdown: calculateLeaveBreakdown(Object.values(response.data.entries || {}))
        };
      } else {
        throw new Error(response.message || 'Failed to get timesheet details');
      }
    } catch (error) {
      console.error('Error getting timesheet details:', error);
      message.error('Failed to load timesheet details');
      return null;
    }
  };

  /**
   * Load only pending timesheets
   */
  const loadPendingTimesheets = async () => {
    await loadTimesheets('pending');
  };

  /**
   * Transform API timesheet data to frontend format - ENHANCED WITH STATISTICS
   */
  const transformApiTimesheetToFrontend = (apiTimesheet) => {
    console.log('Transforming API timesheet:', apiTimesheet); // Debug log
    
    // Extract statistics from the stats object if it exists
    const stats = apiTimesheet.stats || {};
    
    return {
      id: apiTimesheet.timesheetId,
      employeeId: apiTimesheet.employeeId,
      employeeName: apiTimesheet.employeeName,
      location: apiTimesheet.employeelocation || 'Not Set',
      position: apiTimesheet.employeePosition || 'Not Set',
      managerName: apiTimesheet.approvedBy || 'Not Assigned',
      year: apiTimesheet.year,
      month: apiTimesheet.month,
      monthName: apiTimesheet.monthName,
      status: mapApiStatusToFrontend(apiTimesheet.status),
      submittedAt: apiTimesheet.submittedAt,
      lastUpdated: apiTimesheet.updatedAt,
      
      // ENHANCED: Use actual statistics from API
      totalEntries: stats.totalEntries || 0,
      workingDays: stats.workingDays || 0,
      leaveDays: stats.leaveDays || 0,
      totalHours: stats.totalHours || 0,
      leaveBreakdown: stats.leaveBreakdown || {},
      
      // Approval details
      approvedBy: apiTimesheet.isStandinApproval && apiTimesheet.standinApproverName 
        ? apiTimesheet.standinApproverName 
        : apiTimesheet.approvedBy,
      approvedAt: apiTimesheet.approvedAt,
      approvalComments: apiTimesheet.approvalComments || ''
    };
  };

  /**
   * Map API status to frontend status
   */
  const mapApiStatusToFrontend = (apiStatus) => {
    const statusMap = {
      'submitted': 'pending',
      'approved': 'approved',
      'rejected': 'rejected',
      'pending': 'pending'
    };
    return statusMap[apiStatus] || 'pending';
  };

  return {
    timesheets,
    loading,
    loadTimesheets,
    loadPendingTimesheets,
    updateTimesheetApproval,
    searchTimesheets,
    getTimesheetDetails
  };
}

/**
 * Calculate total working hours from working entries
 */
function calculateTotalHours(entries) {
  return entries
    .filter(entry => entry.type === 'working_hours' && entry.startTime && entry.endTime)
    .reduce((total, entry) => {
      const start = dayjs(`2000-01-01T${entry.startTime}:00`);
      const end = dayjs(`2000-01-01T${entry.endTime}:00`);
      const hours = end.diff(start, 'hour', true);
      return total + hours;
    }, 0);
}

/**
 * Calculate leave breakdown by type
 */
function calculateLeaveBreakdown(entries) {
  const breakdown = {};
  
  entries.forEach(entry => {
    if (['annual_leave', 'medical_leave', 'off_in_lieu', 'childcare_leave',
         'hospitalization_leave', 'maternity_leave', 'paternity_leave',
         'compassionate_leave'].includes(entry.type)) {
      breakdown[entry.type] = (breakdown[entry.type] || 0) + 1;
    }
  });
  
  return breakdown;
}