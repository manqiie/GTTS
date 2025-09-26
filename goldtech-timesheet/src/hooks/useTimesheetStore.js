// Updated useTimesheetStore.js - Remove working days completion validation
import { useState, useEffect } from 'react';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Updated useTimesheetStore Hook - Simplified validation
 */
export function useTimesheetStore(year, month) {
  const [entries, setEntries] = useState({});
  const [draftEntries, setDraftEntries] = useState({}); // Local draft changes
  const [timesheetData, setTimesheetData] = useState(null);
  const [customHours, setCustomHours] = useState([]);
  const [defaultHours, setDefaultHoursState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timesheetStatus, setTimesheetStatus] = useState('draft');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [canResubmit, setCanResubmit] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
   * Get merged entries (draft + saved) - UPDATED to filter null entries
   */
  const getMergedEntries = () => {
    const merged = { ...entries };
    
    // Apply draft entries, filtering out null entries (deleted entries)
    Object.entries(draftEntries).forEach(([date, entryData]) => {
      if (entryData === null) {
        // Entry was deleted in draft, remove from merged view
        delete merged[date];
      } else {
        // Entry was added/updated in draft
        merged[date] = entryData;
      }
    });
    
    return merged;
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
      // Clear draft entries when switching months
      setDraftEntries({});
      setHasUnsavedChanges(false);
    }
  }, [year, month]);

  /**
   * Load available months on hook initialization
   */
  useEffect(() => {
    loadAvailableMonths();
  }, []);

  /**
   * Load timesheet data from API - UPDATED to store full timesheet data
   */
  const loadTimesheetData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`/timesheets/${year}/${month}`);
      
      if (response.success && response.data) {
        const timesheetData = response.data;
        
        // Store full timesheet data including comments
        setTimesheetData(timesheetData);
        
        // Set individual pieces of data as before
        setEntries(timesheetData.entries || {});
        setTimesheetStatus(timesheetData.status || 'draft');
      }
    } catch (error) {
      console.error('Error loading timesheet data:', error);
      message.error('Failed to load timesheet data');
      setEntries({});
      setTimesheetData(null);
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
   * Save single entry to DRAFT (local state only)
   */
  const saveEntryToDraft = (entryData) => {
    const newDraftEntries = {
      ...draftEntries,
      [entryData.date]: entryData
    };
    setDraftEntries(newDraftEntries);
    setHasUnsavedChanges(true);
    return entryData;
  };

  /**
   * Save multiple entries to DRAFT (local state only)
   */
  const saveBulkEntriesToDraft = (entriesArray) => {
    const newDraftEntries = { ...draftEntries };
    entriesArray.forEach(entry => {
      newDraftEntries[entry.date] = entry;
    });
    setDraftEntries(newDraftEntries);
    setHasUnsavedChanges(true);
    return entriesArray;
  };

  /**
   * Delete entry from DRAFT (local state only) - UPDATED for direct deletion
   */
  const deleteEntryFromDraft = (date) => {
    const newDraftEntries = { ...draftEntries };
    
    // Mark entry as deleted in draft (null = deleted)
    newDraftEntries[date] = null;
    
    setDraftEntries(newDraftEntries);
    setHasUnsavedChanges(true);
    
    console.log('Entry marked for deletion:', date);
  };

  /**
   * Save draft entries to database
   */
  const saveDraft = async () => {
    if (!hasUnsavedChanges || Object.keys(draftEntries).length === 0) {
      message.info('No changes to save');
      return;
    }

    setLoading(true);
    try {
      const entriesToSave = [];
      const entriesToDelete = [];

      // Process draft entries
      Object.entries(draftEntries).forEach(([date, entryData]) => {
        if (entryData === null) {
          // Entry marked for deletion
          entriesToDelete.push(date);
        } else {
          // Entry to save/update
          entriesToSave.push(entryData);
        }
      });

      // Delete entries first
      for (const date of entriesToDelete) {
        try {
          await apiRequest(`/timesheets/entries/${date}`, {
            method: 'DELETE'
          });
          console.log('Entry deleted from database:', date);
        } catch (error) {
          console.error(`Error deleting entry for ${date}:`, error);
          // Continue with other operations
        }
      }

      // Save/update entries
      if (entriesToSave.length > 0) {
        const response = await apiRequest('/timesheets/entries/bulk', {
          method: 'POST',
          body: JSON.stringify(entriesToSave)
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to save entries');
        }
      }

      // Refresh data from server
      await loadTimesheetData();
      
      // Clear draft entries
      setDraftEntries({});
      setHasUnsavedChanges(false);
      
      message.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      message.error('Failed to save draft: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * SIMPLIFIED validation for submission - No working days requirement
   */
  const validateTimesheetForSubmission = () => {
    const mergedEntries = getMergedEntries();
    const entryDates = Object.keys(mergedEntries).filter(date => mergedEntries[date] !== null);
    
    // Simple validation: Just check that there's at least one entry
    if (entryDates.length === 0) {
      throw new Error('Please add at least one timesheet entry before submitting.');
    }

    // Check for any entries with missing required data
    const incompleteEntries = entryDates.filter(date => {
      const entry = mergedEntries[date];
      if (!entry) return false;

      // Check working hours completeness
      if (entry.type === 'working_hours') {
        return !entry.startTime || !entry.endTime;
      }

      // Check off in lieu completeness
      if (entry.type === 'off_in_lieu') {
        return !entry.dateEarned;
      }

      // Check half day completeness
      const halfDayTypes = ['annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'];
      if (halfDayTypes.includes(entry.type)) {
        return !entry.halfDayPeriod;
      }

      return false;
    });

    if (incompleteEntries.length > 0) {
      throw new Error(`Please complete all entry details before submitting. Incomplete entries on: ${incompleteEntries.join(', ')}`);
    }
  };

  /**
   * Submit timesheet for approval (with save and validation)
   */
  const submitTimesheet = async () => {
    setLoading(true);
    try {
      // First validate completeness (simplified)
      validateTimesheetForSubmission();

      // Save any unsaved changes first
      if (hasUnsavedChanges) {
        await saveDraft();
      }

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
        setHasUnsavedChanges(false);
        
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
   * Set default working hours (for frontend compatibility)
   */
  const setDefaultHours = (hours) => {
    setDefaultHoursState(hours);
  };

  /**
   * Clear all entries for current month
   */
  const clearMonth = async () => {
    setDraftEntries({});
    setHasUnsavedChanges(false);
    await loadTimesheetData();
    message.info('Month data cleared');
  };

  /**
   * Get statistics for current month (including draft entries)
   */
  const getMonthStats = async () => {
    try {
      const mergedEntries = getMergedEntries();
      const entryDates = Object.keys(mergedEntries).filter(date => mergedEntries[date] !== null);
      
      const workingDays = entryDates.filter(date => {
        const entry = mergedEntries[date];
        return entry && entry.type === 'working_hours';
      });
      
      const totalHours = workingDays.reduce((total, date) => {
        const entry = mergedEntries[date];
        if (entry && entry.startTime && entry.endTime) {
          const start = new Date(`2000-01-01T${entry.startTime}:00`);
          let end = new Date(`2000-01-01T${entry.endTime}:00`);
          
          // Handle overnight shifts
          if (end <= start) {
            end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
          }
          
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
          const entry = mergedEntries[date];
          return entry && !['working_hours', 'day_off'].includes(entry.type);
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
      return 'Submit for Approval';
    }
    return 'Submit for Approval';
  };

  return {
    entries: getMergedEntries(), // Return merged entries for display
    timesheetData,
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
    hasUnsavedChanges,
    
    // Updated methods for draft mode
    saveEntry: saveEntryToDraft,
    saveBulkEntries: saveBulkEntriesToDraft,
    deleteEntry: deleteEntryFromDraft,
    saveDraft, // New method
    submitTimesheet,
    
    // Existing methods
    setDefaultHours,
    addCustomHours,
    removeCustomHours,
    clearMonth,
    getMonthStats,
    loadTimesheetData,
    loadAvailableMonths,
    checkSubmissionEligibility
  };
}

/**
 * Hook specifically for timesheet history (unchanged)
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