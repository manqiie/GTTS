// src/services/timesheetManagementService.js
/**
 * Timesheet Management API Service Layer
 * 
 * This service layer abstracts the API calls and will make it easy to switch
 * from localStorage to actual backend API calls when SpringBoot backend is ready.
 * 
 * Simply replace the localStorage logic with fetch/axios calls to your REST endpoints.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class TimesheetManagementService {
  
  /**
   * Get all timesheets with optional filters
   * Backend endpoint: GET /api/timesheets/management?filters=...
   */
  async getAllTimesheets(filters = {}) {
    // TODO: Replace with actual API call when backend is ready
    // const response = await fetch(`${API_BASE_URL}/timesheets/management`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include'
    // });
    // return await response.json();

    // Current localStorage implementation
    return this.getTimesheetsFromLocalStorage();
  }

  /**
   * Get timesheet details by ID
   * Backend endpoint: GET /api/timesheets/{id}/details
   */
  async getTimesheetDetails(timesheetId) {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/timesheets/${timesheetId}/details`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include'
    // });
    // return await response.json();

    // Current localStorage implementation
    return this.getTimesheetDetailsFromLocalStorage(timesheetId);
  }

  /**
   * Update timesheet status
   * Backend endpoint: PUT /api/timesheets/{id}/status
   */
  async updateTimesheetStatus(timesheetId, status, comments = '') {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/timesheets/${timesheetId}/status`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    //   body: JSON.stringify({
    //     status,
    //     comments,
    //     updatedBy: 'current-user-id' // Get from auth context
    //   })
    // });
    // return await response.json();

    // Current localStorage implementation
    return this.updateStatusInLocalStorage(timesheetId, status, comments);
  }

  /**
   * Generate/Download PDF
   * Backend endpoint: POST /api/timesheets/{id}/pdf
   */
  async downloadTimesheetPDF(timesheetId, action = 'download') {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/timesheets/${timesheetId}/pdf`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    //   body: JSON.stringify({ action })
    // });
    
    // if (action === 'download') {
    //   const blob = await response.blob();
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = `timesheet_${timesheetId}.pdf`;
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    // } else {
    //   const blob = await response.blob();
    //   const url = window.URL.createObjectURL(blob);
    //   window.open(url, '_blank');
    // }

    // Current mock implementation
    return this.simulatePDFAction(timesheetId, action);
  }

  /**
   * Search timesheets with filters
   * Backend endpoint: GET /api/timesheets/search?q=...&filters=...
   */
  async searchTimesheets(searchTerm, filters = {}) {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams({
    //   q: searchTerm,
    //   ...filters
    // });
    // const response = await fetch(`${API_BASE_URL}/timesheets/search?${params}`, {
    //   method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include'
    // });
    // return await response.json();

    // Current localStorage implementation
    return this.searchInLocalStorage(searchTerm, filters);
  }

  // ============================================================================
  // CURRENT LOCALSTORAGE IMPLEMENTATION (TO BE REPLACED WITH API CALLS)
  // ============================================================================

  getTimesheetsFromLocalStorage() {
    try {
      const employeesData = localStorage.getItem('employees');
      const employees = employeesData ? JSON.parse(employeesData) : [];
      
      const timesheetData = localStorage.getItem('timesheetData');
      const allTimesheets = timesheetData ? JSON.parse(timesheetData) : {};
      
      return this.generateTimesheetManagementData(employees, allTimesheets);
    } catch (error) {
      console.error('Error loading timesheets from localStorage:', error);
      return [];
    }
  }

  getTimesheetDetailsFromLocalStorage(timesheetId) {
    try {
      const timesheets = this.getTimesheetsFromLocalStorage();
      const timesheet = timesheets.find(ts => ts.id === timesheetId);
      
      if (!timesheet) return null;

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
    } catch (error) {
      console.error('Error getting timesheet details:', error);
      return null;
    }
  }

  updateStatusInLocalStorage(timesheetId, status, comments) {
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
      return { success: true };
    } catch (error) {
      console.error('Error updating status in localStorage:', error);
      return { success: false, error: error.message };
    }
  }

  searchInLocalStorage(searchTerm, filters) {
    const allTimesheets = this.getTimesheetsFromLocalStorage();
    let filteredTimesheets = [...allTimesheets];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTimesheets = filteredTimesheets.filter(ts => 
        ts.employeeName.toLowerCase().includes(term) ||
        ts.employeeId.toLowerCase().includes(term) ||
        ts.location.toLowerCase().includes(term) ||
        ts.position.toLowerCase().includes(term) ||
        ts.managerName.toLowerCase().includes(term)
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        if (key === 'month' || key === 'year') {
          filteredTimesheets = filteredTimesheets.filter(ts => ts[key] === parseInt(value));
        } else {
          filteredTimesheets = filteredTimesheets.filter(ts => ts[key] === value);
        }
      }
    });

    return filteredTimesheets;
  }

  simulatePDFAction(timesheetId, action) {
    const timesheet = this.getTimesheetDetailsFromLocalStorage(timesheetId);
    if (!timesheet) {
      throw new Error('Timesheet not found');
    }

    if (action === 'download') {
      const filename = `timesheet_${timesheet.employeeName}_${timesheet.monthName}_${timesheet.year}.pdf`;
      console.log(`Simulating download of: ${filename}`);
      return { success: true, filename };
    } else {
      const url = `/timesheets/${timesheetId}/preview`;
      console.log(`Simulating PDF view: ${url}`);
      return { success: true, url };
    }
  }

  generateTimesheetManagementData(employees, allTimesheets) {
    const managementData = [];
    const currentDate = new Date();
    
    // Generate data for the last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      employees.forEach(employee => {
        if (employee.status === 'active') {
          const hasTimesheet = allTimesheets[monthKey] && Object.keys(allTimesheets[monthKey]).length > 0;
          const entries = hasTimesheet ? allTimesheets[monthKey] : {};
          const entryCount = Object.keys(entries).length;
          
          // Determine status based on entry count
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
            location: employee.location,
            position: employee.position,
            managerName: employee.managerName,
            year: year,
            month: month,
            monthName: monthName,
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
}

// Export singleton instance
export const timesheetManagementService = new TimesheetManagementService();
export default timesheetManagementService;