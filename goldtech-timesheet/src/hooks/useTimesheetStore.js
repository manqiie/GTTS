// src/hooks/useTimesheetStore.js - Updated with new submission rules and history
import { useState, useEffect } from 'react';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Updated useTimesheetStore Hook with Submission Rules & History
 */
export function useTimesheetStore(year, month) {
  const [entries, setEntries] = useState({});
  const [customHours, setCustomHours] = useState([]);
  const [defaultHours, setDefaultHoursState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timesheetStatus, setTimesheetStatus] = useState('draft');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [canResubmit, setCanResubmit] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Get headers with auth token
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Generic API request method
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

  /**
   * Load available months for timesheet submission
   */
  const loadAvailableMonths = async () => {
    try {
      const response = await apiRequest('/timesheets/available-months');
      
      if (response.success && response.data) {
        setAvailableMonths(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error loading available months:', error);
      message.error('Failed to load available months');
      return [];
    }
  };

  /**
   * Check if timesheet can be submitted
   */
  const checkSubmissionEligibility = async (checkYear, checkMonth) => {
    try {
      const response = await apiRequest(`/timesheets/${checkYear}/${checkMonth}/can-submit`);
      
      if (response.success && response.data) {
        setCanSubmit(response.data.canSubmit);
        setCanResubmit(response.data.canResubmit);
        return response.data;
      }
      
      setCanSubmit(false);
      setCanResubmit(false);
      return { canSubmit: false, canResubmit: false, canPerformAction: false };
    } catch (error) {
      console.error('Error checking submission eligibility:', error);
      setCanSubmit(false);
      setCanResubmit(false);
      return { canSubmit: false, canResubmit: false, canPerformAction: false };
    }
  };

  /**
   * Load timesheet data from API on mount or when month changes
   */
  useEffect(() => {
    if (year && month) {
      loadTimesheetData();
      loadWorkingHoursPresets();
      checkSubmissionEligibility(year, month);
    }
  }, [year, month]);

  /**
   * Load available months on hook initialization
   */
  useEffect(() => {
    loadAvailableMonths();
  }, []);

  /**
   * Load timesheet entries for current month
   */
  const loadTimesheetData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`/timesheets/${year}/${month}`);
      
      if (response.success && response.data) {
        const timesheetData = response.data;
        setEntries(timesheetData.entries || {});
        setTimesheetStatus(timesheetData.status || 'draft');
      }
    } catch (error) {
      console.error('Error loading timesheet data:', error);
      message.error('Failed to load timesheet data');
      setEntries({});
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load working hours presets from API
   */
  const loadWorkingHoursPresets = async () => {
    try {
      const response = await apiRequest('/timesheets/working-hours-presets');
      
      if (response.success && response.data) {
        setCustomHours(response.data);
        
        // Set default hours (first default preset or first preset)
        const defaultPreset = response.data.find(preset => preset.isDefault) || response.data[0];
        if (defaultPreset) {
          setDefaultHoursState({
            id: defaultPreset.id.toString(),
            startTime: defaultPreset.startTime,
            endTime: defaultPreset.endTime
          });
        }
      }
    } catch (error) {
      console.error('Error loading working hours presets:', error);
      // Set fallback default hours
      setDefaultHoursState({
        id: '9-18',
        startTime: '09:00',
        endTime: '18:00'
      });
    }
  };

  /**
   * Save single entry to API
   */
  const saveEntry = async (entryData) => {
    setLoading(true);
    try {
      const response = await apiRequest('/timesheets/entries', {
        method: 'POST',
        body: JSON.stringify(entryData)
      });

      if (response.success && response.data) {
        // Update local state
        const newEntries = {
          ...entries,
          [entryData.date]: response.data
        };
        setEntries(newEntries);
        
        message.success('Entry saved successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      message.error('Failed to save entry: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save multiple entries (bulk operation) to API
   */
  const saveBulkEntries = async (entriesArray) => {
    setLoading(true);
    try {
      const response = await apiRequest('/timesheets/entries/bulk', {
        method: 'POST',
        body: JSON.stringify(entriesArray)
      });

      if (response.success && response.data) {
        // Update local state
        const newEntries = { ...entries };
        response.data.forEach(entry => {
          newEntries[entry.date] = entry;
        });
        setEntries(newEntries);
        
        message.success(`${response.data.length} entries saved successfully`);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to save bulk entries');
      }
    } catch (error) {
      console.error('Error saving bulk entries:', error);
      message.error('Failed to save bulk entries: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit timesheet for approval (with enhanced validation)
   */
  const submitTimesheet = async () => {
    setLoading(true);
    try {
      // Check if submission is allowed
      const eligibility = await checkSubmissionEligibility(year, month);
      
      if (!eligibility.canPerformAction) {
        const today = new Date();
        if (today.getDate() > 10) {
          throw new Error('Previous month timesheet can only be submitted within the first 10 days of the current month');
        } else {
          throw new Error('This timesheet cannot be submitted at this time');
        }
      }

      const response = await apiRequest(`/timesheets/${year}/${month}/submit`, {
        method: 'POST'
      });

      if (response.success && response.data) {
        setTimesheetStatus(response.data.status);
        setCanSubmit(false);
        setCanResubmit(false);
        
        const actionWord = eligibility.canResubmit ? 'resubmitted' : 'submitted';
        message.success(`Timesheet ${actionWord} for approval`);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit timesheet');
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      message.error(error.message || 'Failed to submit timesheet');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add custom working hours preset
   */
  const addCustomHours = async (newHours) => {
    try {
      const response = await apiRequest('/timesheets/working-hours-presets', {
        method: 'POST',
        body: JSON.stringify({
          name: newHours.name || 'Custom Hours',
          startTime: newHours.startTime,
          endTime: newHours.endTime
        })
      });

      if (response.success && response.data) {
        const updatedCustomHours = [...customHours, response.data];
        setCustomHours(updatedCustomHours);
        
        message.success('Custom working hours added');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add custom hours');
      }
    } catch (error) {
      console.error('Error adding custom hours:', error);
      message.error('Failed to add custom hours: ' + error.message);
      throw error;
    }
  };

  /**
   * Remove custom working hours preset
   */
  const removeCustomHours = async (hoursId) => {
    try {
      const response = await apiRequest(`/timesheets/working-hours-presets/${hoursId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        const updatedCustomHours = customHours.filter(h => h.id !== hoursId);
        setCustomHours(updatedCustomHours);
        
        message.success('Custom working hours deleted');
      } else {
        throw new Error(response.message || 'Failed to delete custom hours');
      }
    } catch (error) {
      console.error('Error removing custom hours:', error);
      message.error('Failed to delete custom hours: ' + error.message);
      throw error;
    }
  };

  /**
   * Delete single entry
   */
  const deleteEntry = async (date) => {
    setLoading(true);
    try {
      const response = await apiRequest(`/timesheets/entries/${date}`, {
        method: 'DELETE'
      });

      if (response.success) {
        const newEntries = { ...entries };
        delete newEntries[date];
        setEntries(newEntries);
        
        message.success('Entry deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      message.error('Failed to delete entry: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set default working hours (for frontend compatibility)
   */
  const setDefaultHours = (hours) => {
    setDefaultHoursState(hours);
  };

  /**
   * Clear all entries for current month (not typically used with API)
   */
  const clearMonth = async () => {
    // This would require a specific API endpoint or deleting all entries individually
    // For now, just clear local state and reload
    setEntries({});
    await loadTimesheetData();
    message.info('Month data cleared');
  };

  /**
   * Get statistics for current month
   */
  const getMonthStats = async () => {
    try {
      const response = await apiRequest(`/timesheets/${year}/${month}/stats`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Fallback: calculate from local entries
      const entryDates = Object.keys(entries);
      const workingDays = entryDates.filter(date => {
        const entry = entries[date];
        return entry.type === 'working_hours';
      });
      
      const totalHours = workingDays.reduce((total, date) => {
        const entry = entries[date];
        if (entry.startTime && entry.endTime) {
          const start = new Date(`2000-01-01T${entry.startTime}:00`);
          const end = new Date(`2000-01-01T${entry.endTime}:00`);
          const hours = (end - start) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);

      return {
        totalEntries: entryDates.length,
        workingDays: workingDays.length,
        totalHours: totalHours,
        leaveDays: entryDates.filter(date => {
          const type = entries[date].type;
          return ['annual_leave', 'medical_leave', 'off_in_lieu'].includes(type);
        }).length
      };
    } catch (error) {
      console.error('Error getting month stats:', error);
      return {
        totalEntries: 0,
        workingDays: 0,
        totalHours: 0,
        leaveDays: 0
      };
    }
  };

  /**
   * Determine if the timesheet can be edited
   */
  const canEdit = () => {
    return timesheetStatus === 'draft' || timesheetStatus === 'rejected';
  };

  /**
   * Determine if the submit button should be shown
   */
  const showSubmitButton = () => {
    return canEdit() && (canSubmit || canResubmit);
  };

  /**
   * Get submit button text based on current state
   */
  const getSubmitButtonText = () => {
    if (canResubmit) {
      return 'Resubmit for Approval';
    }
    return 'Submit for Approval';
  };

  return {
    entries,
    customHours,
    defaultHours,
    loading,
    timesheetStatus,
    availableMonths,
    canSubmit,
    canResubmit,
    canEdit: canEdit(),
    showSubmitButton: showSubmitButton(),
    submitButtonText: getSubmitButtonText(),
    saveEntry,
    saveBulkEntries,
    submitTimesheet,
    setDefaultHours,
    addCustomHours,
    removeCustomHours,
    clearMonth,
    deleteEntry,
    getMonthStats,
    loadTimesheetData, // Expose for manual refresh
    loadAvailableMonths, // Expose for manual refresh
    checkSubmissionEligibility // Expose for validation
  };
}

/**
 * Hook specifically for timesheet history
 */
export function useTimesheetHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Get headers with auth token
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Generic API request method
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

  /**
   * Load timesheet history
   */
  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/timesheets/history');
      
      if (response.success && response.data) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading timesheet history:', error);
      message.error('Failed to load timesheet history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  return {
    history,
    loading,
    loadHistory
  };
}