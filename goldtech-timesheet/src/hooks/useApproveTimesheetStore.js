// src/hooks/useApproveTimesheetStore.js
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

/**
 * Custom hook for managing timesheet approval data
 * This will be easily replaceable with API calls when backend is implemented
 */
export function useApproveTimesheetStore() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load timesheet data on mount
  useEffect(() => {
    loadTimesheets();
  }, []);

  /**
   * Load all pending and submitted timesheets for approval
   * Backend endpoint: GET /api/timesheets/pending-approval
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
      
      // Get approval statuses
      const approvalData = localStorage.getItem('timesheetApprovals');
      const approvals = approvalData ? JSON.parse(approvalData) : {};
      
      // Generate approval data - only include submitted timesheets
      const approvalTimesheets = generateApprovalData(employees, allTimesheets, approvals);
      setTimesheets(approvalTimesheets);
    } catch (error) {
      console.error('Error loading approval timesheets:', error);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update timesheet approval status
   * Backend endpoint: PUT /api/timesheets/{id}/approval
   */
  const updateTimesheetApproval = async (timesheetId, decision, comments = '') => {
    try {
      const updatedTimesheets = timesheets.map(ts => 
        ts.id === timesheetId 
          ? { 
              ...ts, 
              status: decision,
              lastUpdated: new Date().toISOString(),
              approvalComments: comments,
              approvedBy: 'Current Manager', // Get from auth context in real implementation
              approvedAt: new Date().toISOString()
            }
          : ts
      );
      
      setTimesheets(updatedTimesheets);
      
      // Update localStorage (this will be replaced with API call)
      saveApprovalToStorage(timesheetId, decision, comments);
      
      return true;
    } catch (error) {
      console.error('Error updating timesheet approval:', error);
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
        ts.projectSite.toLowerCase().includes(term) ||
        ts.position.toLowerCase().includes(term)
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
   * Get detailed timesheet data for approval review
   * Backend endpoint: GET /api/timesheets/{id}/approval-details
   */
  const getTimesheetDetails = async (timesheetId) => {
    try {
      const timesheet = timesheets.find(ts => ts.id === timesheetId);
      if (!timesheet) return null;

      // Get detailed timesheet entries
      const timesheetData = localStorage.getItem('timesheetData');
      const allTimesheets = timesheetData ? JSON.parse(timesheetData) : {};
      const monthKey = `${timesheet.year}-${timesheet.month.toString().padStart(2, '0')}`;
      const entries = allTimesheets[monthKey] || {};

      // Calculate additional statistics
      const workingEntries = Object.values(entries).filter(entry => entry.type === 'working_hours');
      const totalHours = calculateTotalHours(workingEntries);
      const leaveBreakdown = calculateLeaveBreakdown(Object.values(entries));

      return {
        ...timesheet,
        entries: entries,
        totalDays: Object.keys(entries).length,
        workingDays: workingEntries.length,
        leaveDays: Object.values(entries).filter(entry => 
          ['annual_leave', 'medical_leave', 'off_in_lieu', 'childcare_leave', 
           'hospitalization_leave', 'maternity_leave', 'paternity_leave', 
           'compassionate_leave'].includes(entry.type)
        ).length,
        totalHours: totalHours,
        leaveBreakdown: leaveBreakdown
      };
    } catch (error) {
      console.error('Error getting timesheet details:', error);
      return null;
    }
  };

  return {
    timesheets,
    loading,
    loadTimesheets,
    updateTimesheetApproval,
    searchTimesheets,
    getTimesheetDetails
  };
}

/**
 * Generate approval timesheet data from employees and timesheet data
 */
function generateApprovalData(employees, allTimesheets, approvals) {
  const approvalData = [];
  const currentDate = dayjs();
  
  // Generate data for the last 3 months (more recent focus for approvals)
  for (let i = 0; i < 3; i++) {
    const targetDate = currentDate.subtract(i, 'month');
    const year = targetDate.year();
    const month = targetDate.month() + 1;
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    employees.forEach(employee => {
      if (employee.status === 'active') {
        const hasTimesheet = allTimesheets[monthKey] && Object.keys(allTimesheets[monthKey]).length > 0;
        
        // Only include timesheets that have been submitted (have entries)
        if (hasTimesheet) {
          const entries = allTimesheets[monthKey];
          const entryCount = Object.keys(entries).length;
          const timesheetId = `${employee.id}-${monthKey}`;
          
          // Get approval status from storage
          const approval = approvals[timesheetId];
          let status = 'pending'; // Default to pending for submitted timesheets
          
          if (approval) {
            status = approval.status;
          }
          
          // Calculate statistics
          const workingDays = Object.values(entries).filter(entry => entry.type === 'working_hours').length;
          const leaveDays = Object.values(entries).filter(entry => 
            ['annual_leave', 'medical_leave', 'off_in_lieu', 'childcare_leave',
             'hospitalization_leave', 'maternity_leave', 'paternity_leave',
             'compassionate_leave'].includes(entry.type)
          ).length;
          
          const leaveBreakdown = calculateLeaveBreakdown(Object.values(entries));
          
          approvalData.push({
            id: timesheetId,
            employeeId: employee.employeeId,
            employeeName: employee.name,
            projectSite: employee.projectSite,
            position: employee.position,
            managerName: employee.managerName,
            year: year,
            month: month,
            monthName: targetDate.format('MMMM'),
            status: status,
            submittedAt: new Date().toISOString(), // In real app, this would be actual submission time
            lastUpdated: approval ? approval.updatedAt : new Date().toISOString(),
            entryCount: entryCount,
            totalDays: entryCount,
            workingDays: workingDays,
            leaveDays: leaveDays,
            leaveBreakdown: leaveBreakdown,
            approvedBy: approval ? approval.approvedBy : null,
            approvedAt: approval ? approval.approvedAt : null,
            approvalComments: approval ? approval.comments : ''
          });
        }
      }
    });
  }
  
  return approvalData.sort((a, b) => {
    // Sort by status (pending first), then by year desc, month desc, then by name
    if (a.status !== b.status) {
      if (a.status === 'pending') return -1;
      if (b.status === 'pending') return 1;
    }
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    return a.employeeName.localeCompare(b.employeeName);
  });
}

/**
 * Calculate total working hours from working entries
 */
function calculateTotalHours(workingEntries) {
  return workingEntries.reduce((total, entry) => {
    if (entry.startTime && entry.endTime) {
      const start = dayjs(`2000-01-01T${entry.startTime}:00`);
      const end = dayjs(`2000-01-01T${entry.endTime}:00`);
      const hours = end.diff(start, 'hour', true);
      return total + hours;
    }
    return total;
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

/**
 * Save approval decision to localStorage (will be replaced with API)
 */
function saveApprovalToStorage(timesheetId, decision, comments) {
  try {
    const approvalData = localStorage.getItem('timesheetApprovals') || '{}';
    const approvals = JSON.parse(approvalData);
    
    approvals[timesheetId] = {
      status: decision,
      comments: comments,
      approvedBy: 'Current Manager',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('timesheetApprovals', JSON.stringify(approvals));
  } catch (error) {
    console.error('Error saving approval to localStorage:', error);
  }
}