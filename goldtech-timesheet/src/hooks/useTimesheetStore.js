import { useState, useEffect } from 'react';

/**
 * useTimesheetStore Hook
 * 
 * Custom hook for managing timesheet data with localStorage persistence.
 * This demonstrates React hooks patterns and state management without external libraries.
 * 
 * Features:
 * - Persistent storage using localStorage
 * - Custom working hours management
 * - Bulk operations
 * - Month-based data organization
 */
export function useTimesheetStore(year, month) {
  const [entries, setEntries] = useState({});
  const [customHours, setCustomHours] = useState([]);
  const [defaultHours, setDefaultHoursState] = useState(null); // Renamed to avoid conflict

  const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

  /**
   * Load data from localStorage on mount or when month changes
   */
  useEffect(() => {
    loadTimesheetData();
    loadCustomHours();
    loadDefaultHours();
  }, [year, month]);

  /**
   * Load timesheet entries for current month
   */
  const loadTimesheetData = () => {
    try {
      const stored = localStorage.getItem('timesheetData');
      if (stored) {
        const data = JSON.parse(stored);
        setEntries(data[monthKey] || {});
      }
    } catch (error) {
      console.error('Error loading timesheet data:', error);
      setEntries({});
    }
  };

  /**
   * Load custom working hours
   */
  const loadCustomHours = () => {
    try {
      const stored = localStorage.getItem('customHours');
      if (stored) {
        setCustomHours(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading custom hours:', error);
      setCustomHours([]);
    }
  };

  /**
   * Load default working hours
   */
  const loadDefaultHours = () => {
    try {
      const stored = localStorage.getItem('defaultHours');
      if (stored) {
        setDefaultHoursState(JSON.parse(stored)); // Use renamed state setter
      } else {
        // Set default to 9-18 if none exists
        const defaultOption = {
          id: '9-18',
          startTime: '09:00',
          endTime: '18:00'
        };
        setDefaultHoursState(defaultOption); // Use renamed state setter
        localStorage.setItem('defaultHours', JSON.stringify(defaultOption));
      }
    } catch (error) {
      console.error('Error loading default hours:', error);
    }
  };

  /**
   * Save single entry
   */
  const saveEntry = (entryData) => {
    const newEntries = {
      ...entries,
      [entryData.date]: {
        ...entryData,
        timestamp: new Date().toISOString()
      }
    };

    setEntries(newEntries);
    saveToLocalStorage(newEntries);
  };

  /**
   * Save multiple entries (bulk operation)
   */
  const saveBulkEntries = (entriesArray) => {
    const newEntries = { ...entries };
    
    entriesArray.forEach(entryData => {
      newEntries[entryData.date] = {
        ...entryData,
        timestamp: new Date().toISOString()
      };
    });

    setEntries(newEntries);
    saveToLocalStorage(newEntries);
  };

  /**
   * Save entries to localStorage
   */
  const saveToLocalStorage = (newEntries) => {
    try {
      const stored = localStorage.getItem('timesheetData');
      const allData = stored ? JSON.parse(stored) : {};
      
      allData[monthKey] = newEntries;
      localStorage.setItem('timesheetData', JSON.stringify(allData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  /**
   * Set default working hours
   */
  const setDefaultHours = (hours) => { // Keep the function name for the API
    setDefaultHoursState(hours); // Use renamed state setter internally
    try {
      localStorage.setItem('defaultHours', JSON.stringify(hours));
    } catch (error) {
      console.error('Error saving default hours:', error);
    }
  };

  /**
   * Add custom working hours
   */
  const addCustomHours = (newHours) => {
    const updatedCustomHours = [...customHours, newHours];
    setCustomHours(updatedCustomHours);
    
    try {
      localStorage.setItem('customHours', JSON.stringify(updatedCustomHours));
    } catch (error) {
      console.error('Error saving custom hours:', error);
    }
  };

  /**
   * Remove custom working hours
   */
  const removeCustomHours = (hoursId) => {
    const updatedCustomHours = customHours.filter(h => h.id !== hoursId);
    setCustomHours(updatedCustomHours);
    
    try {
      localStorage.setItem('customHours', JSON.stringify(updatedCustomHours));
    } catch (error) {
      console.error('Error removing custom hours:', error);
    }
  };

  /**
   * Clear all entries for current month
   */
  const clearMonth = () => {
    setEntries({});
    
    try {
      const stored = localStorage.getItem('timesheetData');
      if (stored) {
        const allData = JSON.parse(stored);
        delete allData[monthKey];
        localStorage.setItem('timesheetData', JSON.stringify(allData));
      }
    } catch (error) {
      console.error('Error clearing month data:', error);
    }
  };

  /**
   * Delete single entry
   */
  const deleteEntry = (date) => {
    const newEntries = { ...entries };
    delete newEntries[date];
    
    setEntries(newEntries);
    saveToLocalStorage(newEntries);
  };

  /**
   * Get statistics for current month
   */
  const getMonthStats = () => {
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
        return ['annual_leave', 'medical_leave', 'emergency_leave'].includes(type);
      }).length
    };
  };

  return {
    entries,
    customHours,
    defaultHours,
    saveEntry,
    saveBulkEntries,
    setDefaultHours,
    addCustomHours,
    removeCustomHours,
    clearMonth,
    deleteEntry,
    getMonthStats
  };
}