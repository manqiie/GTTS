// src/hooks/useTimesheetManagementStore.js
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

/**
 * Custom hook for managing timesheet management data
 * This will be easily replaceable with API calls when backend is implemented
 */
export function useTimesheetManagementStore() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load timesheet data on mount
  useEffect(() => {
    loadTimesheets();
  }, []);

  /**
   * Load all employee timesheets - currently from localStorage, easily replaceable with API
   */
  const loadTimesheets = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get employees data
      const employeesData = localStorage.getItem('employees');
      const employees = employeesData ? JSON.parse(employeesData) : [];
      
      // Get timesheet data
      const timesheetData = localStorage.getItem('timesheetData');
      const allTimesheets = timesheetData ? JSON.parse(timesheetData) : {};
      
      // Generate timesheet management data
      const managementData = generateTimesheetManagementData(employees, allTimesheets);
      setTimesheets(managementData);
    } catch (error) {
      console.error('Error loading timesheets:', error);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update timesheet status - easily replaceable with API call
   */
  const updateTimesheetStatus = async (timesheetId, newStatus, comments = '') => {
    try {
      const updatedTimesheets = timesheets.map(ts => 
        ts.id === timesheetId 
          ? { 
              ...ts, 
              status: newStatus,
              lastUpdated: new Date().toISOString(),
              approvalComments: comments,
              approvedBy: newStatus === 'approved' ? 'Admin User' : null,
              approvedAt: newStatus === 'approved' ? new Date().toISOString() : null
            }
          : ts
      );
      
      setTimesheets(updatedTimesheets);
      
      // Update localStorage (this will be replaced with API call)
      saveTimesheetStatusToStorage(timesheetId, newStatus, comments);
      
      return true;
    } catch (error) {
      console.error('Error updating timesheet status:', error);
      return false;
    }
  };

  /**
   * Search and filter timesheets
   */
  const searchTimesheets = (searchTerm, filters = {}) => {
    let filteredTimesheets = [...timesheets];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTimesheets = filteredTimesheets.filter(ts => 
        ts.employeeName.toLowerCase().includes(term) ||
        ts.employeeId.toLowerCase().includes(term) ||
        ts.projectSite.toLowerCase().includes(term) ||
        ts.position.toLowerCase().includes(term) ||
        ts.managerName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.status === filters.status);
    }

    // Project Site filter
    if (filters.projectSite && filters.projectSite !== 'all') {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.projectSite === filters.projectSite);
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
   * Get timesheet details for PDF generation
   */
  const getTimesheetDetails = (timesheetId) => {
    const timesheet = timesheets.find(ts => ts.id === timesheetId);
    if (!timesheet) return null;

    // Get detailed timesheet entries
    const timesheetData = localStorage.getItem('timesheetData');
    const allTimesheets = timesheetData ? JSON.parse(timesheetData) : {};
    const monthKey = `${timesheet.year}-${timesheet.month.toString().padStart(2, '0')}`;
    const entries = allTimesheets[monthKey] || {};

    return {
      ...timesheet,
      entries: entries,
      totalDays: Object.keys(entries).length,
      workingDays: Object.values(entries).filter(entry => entry.type === 'working_hours').length,
      leaveDays: Object.values(entries).filter(entry => 
        ['annual_leave', 'medical_leave', 'off_in_lieu'].includes(entry.type)
      ).length
    };
  };

  return {
    timesheets,
    loading,
    loadTimesheets,
    updateTimesheetStatus,
    searchTimesheets,
    getTimesheetDetails
  };
}

/**
 * Generate timesheet management data from employees and timesheet data
 */
function generateTimesheetManagementData(employees, allTimesheets) {
  const managementData = [];
  const currentDate = dayjs();
  
  // Generate data for the last 6 months
  for (let i = 0; i < 6; i++) {
    const targetDate = currentDate.subtract(i, 'month');
    const year = targetDate.year();
    const month = targetDate.month() + 1;
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    employees.forEach(employee => {
      if (employee.status === 'active') {
        const hasTimesheet = allTimesheets[monthKey] && Object.keys(allTimesheets[monthKey]).length > 0;
        const entries = hasTimesheet ? allTimesheets[monthKey] : {};
        const entryCount = Object.keys(entries).length;
        
        // Determine status based on entry count and current date
        let status = 'na'; // Not submitted
        if (hasTimesheet && entryCount > 0) {
          // For demo purposes, randomly assign statuses
          const statusOptions = ['pending', 'approved', 'rejected'];
          status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        }
        
        managementData.push({
          id: `${employee.id}-${monthKey}`,
          employeeId: employee.employeeId,
          employeeName: employee.name,
          projectSite: employee.projectSite,
          position: employee.position,
          managerName: employee.managerName,
          year: year,
          month: month,
          monthName: targetDate.format('MMMM'),
          status: status,
          submittedAt: hasTimesheet ? new Date().toISOString() : null,
          lastUpdated: hasTimesheet ? new Date().toISOString() : null,
          entryCount: entryCount,
          approvedBy: status === 'approved' ? 'Admin User' : null,
          approvedAt: status === 'approved' ? new Date().toISOString() : null,
          approvalComments: status === 'rejected' ? 'Please review overtime calculations' : ''
        });
      }
    });
  }
  
  return managementData.sort((a, b) => {
    // Sort by year desc, month desc, then by name
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    return a.employeeName.localeCompare(b.employeeName);
  });
}

/**
 * Save timesheet status to localStorage (will be replaced with API)
 */
function saveTimesheetStatusToStorage(timesheetId, status, comments) {
  try {
    const statusData = localStorage.getItem('timesheetStatuses') || '{}';
    const statuses = JSON.parse(statusData);
    
    statuses[timesheetId] = {
      status,
      comments,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin User'
    };
    
    localStorage.setItem('timesheetStatuses', JSON.stringify(statuses));
  } catch (error) {
    console.error('Error saving timesheet status:', error);
  }
}