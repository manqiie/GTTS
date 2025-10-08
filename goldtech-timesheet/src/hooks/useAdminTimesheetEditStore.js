// src/hooks/useAdminTimesheetEditStore.js
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { adminTimesheetEditApi } from '../services/adminTimesheetEditApi';
import { timesheetApi } from '../services/timesheetApi';

export function useAdminTimesheetEditStore(userId, year, month) {
  const [entries, setEntries] = useState({});
  const [draftEntries, setDraftEntries] = useState({});
  const [timesheetData, setTimesheetData] = useState(null);
  const [customHours, setCustomHours] = useState([]);
  const [defaultHours, setDefaultHours] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getMergedEntries = () => {
    return { ...entries, ...draftEntries };
  };

  const loadTimesheetData = async () => {
    if (!userId || !year || !month) return;

    setLoading(true);
    try {
      const response = await adminTimesheetEditApi.getTimesheetForEdit(userId, year, month);
      
      if (response.success && response.data) {
        setTimesheetData(response.data);
        setEntries(response.data.entries || {});
        setDraftEntries({});
        setHasUnsavedChanges(false);
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

  const loadWorkingHoursPresets = async () => {
    try {
      const response = await timesheetApi.getWorkingHoursPresets();
      
      if (response.success && response.data) {
        setCustomHours(response.data);
        
        const defaultPreset = response.data.find(preset => preset.isDefault) || response.data[0];
        if (defaultPreset) {
          setDefaultHours({
            id: defaultPreset.id.toString(),
            startTime: defaultPreset.startTime,
            endTime: defaultPreset.endTime
          });
        }
      }
    } catch (error) {
      console.error('Error loading working hours presets:', error);
      setDefaultHours({
        id: '9-18',
        startTime: '09:00',
        endTime: '18:00'
      });
    }
  };

  const saveEntryToDraft = (entryData) => {
    const newDraftEntries = {
      ...draftEntries,
      [entryData.date]: entryData
    };
    setDraftEntries(newDraftEntries);
    setHasUnsavedChanges(true);
    return entryData;
  };

  const saveBulkEntriesToDraft = (entriesArray) => {
    const newDraftEntries = { ...draftEntries };
    entriesArray.forEach(entry => {
      newDraftEntries[entry.date] = entry;
    });
    setDraftEntries(newDraftEntries);
    setHasUnsavedChanges(true);
    return entriesArray;
  };

  const deleteEntryFromDraft = (date) => {
    const newDraftEntries = { ...draftEntries };
    newDraftEntries[date] = null;
    setDraftEntries(newDraftEntries);
    setHasUnsavedChanges(true);
  };

  const saveDraft = async (editReason = '') => {
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
          await adminTimesheetEditApi.deleteEntry(userId, date, editReason);
        } catch (error) {
          console.error(`Error deleting entry for ${date}:`, error);
        }
      }

      // Save/update entries
      if (entriesToSave.length > 0) {
        const response = await adminTimesheetEditApi.saveBulkEntries(userId, entriesToSave, editReason);

        if (!response.success) {
          throw new Error(response.message || 'Failed to save entries');
        }
      }

      await loadTimesheetData();
      
      setDraftEntries({});
      setHasUnsavedChanges(false);
      
      message.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      message.error('Failed to save changes: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (userId && year && month) {
      loadTimesheetData();
      loadWorkingHoursPresets();
      setDraftEntries({});
      setHasUnsavedChanges(false);
    }
  }, [userId, year, month]);

  return {
    entries: getMergedEntries(),
    timesheetData,
    customHours,
    defaultHours,
    loading,
    hasUnsavedChanges,
    
    saveEntry: saveEntryToDraft,
    saveBulkEntries: saveBulkEntriesToDraft,
    deleteEntry: deleteEntryFromDraft,
    saveDraft,
    addCustomHours,
    removeCustomHours,
    loadTimesheetData
  };
}