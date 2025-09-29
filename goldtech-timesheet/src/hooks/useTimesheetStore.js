// src/hooks/useTimesheetStore.js - Refactored
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { timesheetApi } from '../services/timesheetApi';
import { validateTimesheetForSubmission } from '../utils/timesheetValidation';
import { calculateHours, isWorkingDay, isLeaveDay } from '../utils/timesheetUtils';

/**
 * Main Timesheet Store Hook with Draft Mode
 */
export function useTimesheetStore(year, month) {
  // State management
  const [entries, setEntries] = useState({});
  const [draftEntries, setDraftEntries] = useState({});
  const [timesheetData, setTimesheetData] = useState(null);
  const [customHours, setCustomHours] = useState([]);
  const [defaultHours, setDefaultHoursState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timesheetStatus, setTimesheetStatus] = useState('draft');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [canResubmit, setCanResubmit] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Get merged entries (draft + saved)
   */
  const getMergedEntries = () => {
    return { ...entries, ...draftEntries };
  };

  /**
   * Load available months for timesheet submission
   */
  const loadAvailableMonths = async () => {
    try {
      const response = await timesheetApi.getAvailableMonths();
      
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
      const response = await timesheetApi.checkSubmissionEligibility(checkYear, checkMonth);
      
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
   * Load timesheet data from API
   */
  const loadTimesheetData = async () => {
    setLoading(true);
    try {
      const response = await timesheetApi.getTimesheet(year, month);
      
      if (response.success && response.data) {
        const timesheetData = response.data;
        
        setTimesheetData(timesheetData);
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
      const response = await timesheetApi.getWorkingHoursPresets();
      
      if (response.success && response.data) {
        setCustomHours(response.data);
        
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
   * Delete entry from DRAFT (local state only)
   */
  const deleteEntryFromDraft = (date) => {
    const newDraftEntries = { ...draftEntries };
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

      Object.entries(draftEntries).forEach(([date, entryData]) => {
        if (entryData === null) {
          entriesToDelete.push(date);
        } else {
          entriesToSave.push(entryData);
        }
      });

      // Delete entries first
      for (const date of entriesToDelete) {
        try {
          await timesheetApi.deleteEntry(date);
          console.log('Entry deleted from database:', date);
        } catch (error) {
          console.error(`Error deleting entry for ${date}:`, error);
        }
      }

      // Save/update entries
      if (entriesToSave.length > 0) {
        const response = await timesheetApi.saveBulkEntries(entriesToSave);

        if (!response.success) {
          throw new Error(response.message || 'Failed to save entries');
        }
      }

      await loadTimesheetData();
      
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
   * Submit timesheet for approval
   */
  const submitTimesheet = async () => {
    setLoading(true);
    try {
      validateTimesheetForSubmission(getMergedEntries(), year, month);

      if (hasUnsavedChanges) {
        await saveDraft();
      }

      const eligibility = await checkSubmissionEligibility(year, month);
      
      if (!eligibility.canPerformAction) {
        const today = new Date();
        if (today.getDate() > 10) {
          throw new Error('Previous month timesheet can only be submitted within the first 10 days of the current month');
        } else {
          throw new Error('This timesheet cannot be submitted at this time');
        }
      }

      const response = await timesheetApi.submitTimesheet(year, month);

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
      const response = await timesheetApi.addWorkingHoursPreset(newHours);

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
      const response = await timesheetApi.removeWorkingHoursPreset(hoursId);

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
   * Set default working hours
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
   * Get statistics for current month
   */
  const getMonthStats = async () => {
    try {
      const mergedEntries = getMergedEntries();
      const entryDates = Object.keys(mergedEntries).filter(date => mergedEntries[date] !== null);
      
      const workingDays = entryDates.filter(date => isWorkingDay(mergedEntries[date]));
      
      const totalHours = workingDays.reduce((total, date) => {
        const entry = mergedEntries[date];
        return total + calculateHours(entry.startTime, entry.endTime);
      }, 0);

      return {
        totalEntries: entryDates.length,
        workingDays: workingDays.length,
        totalHours: totalHours,
        leaveDays: entryDates.filter(date => isLeaveDay(mergedEntries[date])).length
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

  // Load data on mount or when month changes
  useEffect(() => {
    if (year && month) {
      loadTimesheetData();
      loadWorkingHoursPresets();
      checkSubmissionEligibility(year, month);
      setDraftEntries({});
      setHasUnsavedChanges(false);
    }
  }, [year, month]);

  // Load available months on initialization
  useEffect(() => {
    loadAvailableMonths();
  }, []);

  return {
    entries: getMergedEntries(),
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
    
    saveEntry: saveEntryToDraft,
    saveBulkEntries: saveBulkEntriesToDraft,
    deleteEntry: deleteEntryFromDraft,
    saveDraft,
    submitTimesheet,
    
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