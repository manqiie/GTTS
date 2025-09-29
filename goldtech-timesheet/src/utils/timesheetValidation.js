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
      return { valid: false, error: 'Date earned is required for off in lieu' };
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
 * Validate timesheet completeness for submission
 */
export function validateTimesheetForSubmission(entries, year, month) {
  const filteredEntries = Object.fromEntries(
    Object.entries(entries).filter(([, entry]) => entry !== null)
  );

  // Check completion rate
  const { completed, total, rate } = calculateCompletionRate(filteredEntries, year, month);
  
  if (rate < 0.8) {
    throw new Error(
      `Please complete at least 80% of working days before submitting. ` +
      `You have completed ${completed} out of ${total} working days.`
    );
  }

  // Check for incomplete entries
  const incompleteEntries = findIncompleteEntries(filteredEntries);
  
  if (incompleteEntries.length > 0) {
    const dates = incompleteEntries.map(e => e.date).join(', ');
    throw new Error(
      `Please complete all entry details before submitting. Incomplete entries on: ${dates}`
    );
  }

  return { valid: true };
}