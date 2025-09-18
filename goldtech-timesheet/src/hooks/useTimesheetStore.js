// src/hooks/useTimesheetStore.js - Updated to use API instead of localStorage
import { useState, useEffect } from 'react';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Updated useTimesheetStore Hook with API Integration
 * 
 * This hook now communicates with the backend API instead of localStorage
 */
export function useTimesheetStore(year, month) {
  const [entries, setEntries] = useState({});
  const [customHours, setCustomHours] = useState([]);
  const [defaultHours, setDefaultHoursState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timesheetStatus, setTimesheetStatus] = useState('draft');

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
   * Load timesheet data from API on mount or when month changes
   */
  useEffect(() => {
    if (year && month) {
      loadTimesheetData();
      loadWorkingHoursPresets();
    }
  }, [year, month]);

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
   * Submit timesheet for approval
   */
  const submitTimesheet = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`/timesheets/${year}/${month}/submit`, {
        method: 'POST'
      });

      if (response.success && response.data) {
        setTimesheetStatus(response.data.status);
        message.success('Timesheet submitted for approval');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit timesheet');
      }
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      message.error('Failed to submit timesheet: ' + error.message);
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

  return {
    entries,
    customHours,
    defaultHours,
    loading,
    timesheetStatus,
    saveEntry,
    saveBulkEntries,
    submitTimesheet,
    setDefaultHours,
    addCustomHours,
    removeCustomHours,
    clearMonth,
    deleteEntry,
    getMonthStats,
    loadTimesheetData // Expose for manual refresh
  };
}