// src/utils/timesheetValidation.js
import { getWorkingDaysInMonth, calculateCompletionRate } from './timesheetUtils';

/**
 * Validate entry completeness
 */
export function validateEntry(entry) {
  if (!entry) return { valid: false, error: 'Entry is required' };

  // Check working hours completeness
  if (entry.type === 'working_hours') {
    if (!entry.startTime || !entry.endTime) {
      return { valid: false, error: 'Start time and end time are required for working hours' };
    }
  }

  // Check off in lieu completeness
  if (entry.type === 'off_in_lieu') {
    if (!entry.dateEarned) {
      return { valid: false, error: 'Date earned is required for Off in Lieu entries' };
    }
  }

  // Check half day completeness
  const halfDayTypes = ['annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'];
  if (halfDayTypes.includes(entry.type)) {
    if (!entry.halfDayPeriod) {
      return { valid: false, error: 'Half day period is required' };
    }
  }

  return { valid: true };
}

/**
 * Find incomplete entries in the timesheet
 */
export function findIncompleteEntries(entries) {
  const incompleteEntries = [];

  Object.entries(entries).forEach(([date, entry]) => {
    if (entry === null) return;
    
    const validation = validateEntry(entry);
    if (!validation.valid) {
      incompleteEntries.push({ date, error: validation.error });
    }
  });

  return incompleteEntries;
}

/**
 * Validate timesheet completeness for submission - UPDATED to require 100%
 */
export function validateTimesheetForSubmission(entries, year, month) {

  const allEntries = entries; // Keep all entries as-is
  
  // Get all working days in the month
  const workingDays = getWorkingDaysInMonth(year, month);
  
  //  Count ALL entries (including no_entry/N/A)
  const totalEntries = Object.keys(allEntries).filter(date => allEntries[date] !== null).length;
  
  // Require 100% completion (all working days must have entries)
  if (totalEntries < workingDays.length) {
    const missingDays = workingDays.length - totalEntries;
    throw new Error(
      `Please fill up all working days before submitting. You have ${missingDays} working day${missingDays > 1 ? 's' : ''} without entries.`
    );
  }

  // Check for incomplete entries (but skip no_entry type)
  const incompleteEntries = [];
  Object.entries(allEntries).forEach(([date, entry]) => {
    if (entry === null || entry.type === 'no_entry') return; // Skip validation for N/A entries
    
    const validation = validateEntry(entry);
    if (!validation.valid) {
      incompleteEntries.push({ date, error: validation.error });
    }
  });
  
  if (incompleteEntries.length > 0) {
    throw new Error(
      `Please complete all entry details before submitting. Some entries are missing required information.`
    );
  }

  return { valid: true };
}