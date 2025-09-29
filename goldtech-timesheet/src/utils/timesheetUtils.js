// src/utils/timesheetUtils.js

/**
 * Get working days in a month (excluding weekends)
 */
export function getWorkingDaysInMonth(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const workingDays = [];

  for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      workingDays.push(new Date(date).toISOString().split('T')[0]);
    }
  }

  return workingDays;
}

/**
 * Calculate hours between start and end time
 */
export function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  const start = new Date(`2000-01-01T${startTime}:00`);
  let end = new Date(`2000-01-01T${endTime}:00`);
  
  // Handle overnight shifts
  if (end <= start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  
  return (end - start) / (1000 * 60 * 60);
}

/**
 * Check if entry is a working day entry
 */
export function isWorkingDay(entry) {
  return entry && entry.type === 'working_hours';
}

/**
 * Check if entry is a leave day entry
 */
export function isLeaveDay(entry) {
  return entry && !['working_hours', 'day_off'].includes(entry.type);
}

/**
 * Check if date is a weekend
 */
export function isWeekend(date) {
  const dayOfWeek = new Date(date).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Get working day dates from entries
 */
export function getWorkingDayDates(entries) {
  return Object.keys(entries).filter(date => {
    const entry = entries[date];
    return entry && !isWeekend(date) && entry !== null;
  });
}

/**
 * Calculate completion rate for timesheet
 */
export function calculateCompletionRate(entries, year, month) {
  const workingDays = getWorkingDaysInMonth(year, month);
  const completedWorkingDays = Object.keys(entries).filter(date => {
    return entries[date] !== null && !isWeekend(date);
  });

  return {
    completed: completedWorkingDays.length,
    total: workingDays.length,
    rate: completedWorkingDays.length / workingDays.length
  };
}