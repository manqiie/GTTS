// dayEntryUtils.js - Updated utility functions with overnight shift support
import dayjs from 'dayjs';

export const dayEntryUtils = {
  /**
   * Calculate working hours duration with support for overnight shifts (PM to AM)
   */
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return null;
    
    let start = dayjs(`2000-01-01 ${startTime}`);
    let end = dayjs(`2000-01-01 ${endTime}`);
    
    // If end time is before or equal to start time, assume it's next day (overnight shift)
    if (end.isBefore(start) || end.isSame(start)) {
      end = end.add(1, 'day');
    }
    
    const totalMinutes = end.diff(start, 'minute');
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
      hours,
      minutes,
      formatted: `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`,
      totalMinutes
    };
  },

  /**
   * Format time for display
   */
  formatTimeForDisplay(time, format = 'h:mm A') {
    if (!time) return '';
    return dayjs(time, 'HH:mm').format(format);
  },

  /**
   * Format date for display
   */
  formatDateForDisplay(date, format = 'dddd, MMMM DD, YYYY') {
    if (!date) return '';
    return dayjs(date).format(format);
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * Validate entry form data with overnight shift support
   */
  validateEntryData(formData, entryType, fileList, dateEarned) {
    const errors = [];

    // Basic validation
    if (!formData.entryType && !formData.othersEntryType) {
      errors.push('Please select a valid entry type');
    }

    // Working hours validation with overnight support
    if (entryType === 'working_hours') {
      if (!formData.startTime || !formData.endTime) {
        errors.push('Please set both start and end times for working hours');
      } else {
        const duration = this.calculateDuration(
          formData.startTime.format('HH:mm'),
          formData.endTime.format('HH:mm')
        );
        
        if (!duration || duration.totalMinutes <= 0) {
          errors.push('Invalid time range');
        } else {
          // Maximum 16 hours per shift
          if (duration.totalMinutes > 16 * 60) {
            errors.push('Working hours cannot exceed 16 hours per shift');
          }
          
          // Minimum 30 minutes
          if (duration.totalMinutes < 30) {
            errors.push('Working hours must be at least 30 minutes');
          }
        }
      }
    }

    // Half day validation
    const isHalfDay = ['annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'].includes(entryType);
    if (isHalfDay && !formData.halfDayPeriod) {
      errors.push('Please select AM or PM for half day leave');
    }

    // Document validation
    const requiresDocuments = [
      'annual_leave', 'annual_leave_halfday', 'medical_leave',
      'childcare_leave', 'childcare_leave_halfday', 'shared_parental_leave',
      'nopay_leave', 'nopay_leave_halfday', 'hospitalization_leave',
      'reservist', 'paternity_leave', 'compassionate_leave', 'maternity_leave'
    ].includes(entryType);

    if (requiresDocuments && (!fileList || fileList.length === 0)) {
      errors.push('Supporting documents are required for this leave type');
    }

    // Off in Lieu validation
    if (entryType === 'off_in_lieu' && !dateEarned) {
      errors.push('Date earned is required for Off in Lieu entries');
    }

    // Date earned validation (must be in the past)
    if (entryType === 'off_in_lieu' && dateEarned) {
      const earnedDate = dayjs(dateEarned);
      const entryDate = dayjs(formData.date);
      
      if (earnedDate.isAfter(entryDate)) {
        errors.push('Date earned cannot be after the Off in Lieu date');
      }

      if (earnedDate.isAfter(dayjs().endOf('day'))) {
        errors.push('Date earned cannot be in the future');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Prepare entry data for API submission
   */
  prepareEntryDataForSubmission(formData, entryType, fileList, dateEarned, showOthersDropdown) {
    const actualEntryType = showOthersDropdown ? formData.othersEntryType : formData.entryType;
    
    const entryData = {
      date: formData.date.format('YYYY-MM-DD'),
      type: actualEntryType,
      notes: formData.notes || ''
    };

    // Add working hours fields
    if (actualEntryType === 'working_hours' && formData.startTime && formData.endTime) {
      entryData.startTime = formData.startTime.format('HH:mm');
      entryData.endTime = formData.endTime.format('HH:mm');
    }

    // Add off in lieu fields
    if (actualEntryType === 'off_in_lieu' && dateEarned) {
      entryData.dateEarned = dateEarned;
    }

    // Add half day period
    const isHalfDay = ['annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'].includes(actualEntryType);
    if (isHalfDay && formData.halfDayPeriod) {
      entryData.halfDayPeriod = formData.halfDayPeriod;
    }

    // Add supporting documents
    if (fileList && fileList.length > 0) {
      entryData.supportingDocuments = fileList.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        base64Data: file.base64Data
      }));
    }

    return entryData;
  },

  /**
   * Get entry status color and text
   */
  getEntryStatusDisplay(entry) {
    if (!entry) return { color: 'default', text: 'No Entry' };

    const statusMap = {
      'working_hours': { color: 'blue', text: 'Working' },
      'annual_leave': { color: 'orange', text: 'Annual Leave' },
      'annual_leave_halfday': { color: 'orange', text: 'AL (Half)' },
      'medical_leave': { color: 'red', text: 'Medical' },
      'off_in_lieu': { color: 'purple', text: 'Off in Lieu' },
      'day_off': { color: 'gold', text: 'Public Holiday' }
    };

    return statusMap[entry.type] || { color: 'default', text: entry.type };
  },

  /**
   * Check if entry can be edited based on timesheet status
   */
  canEditEntry(timesheetStatus) {
    return ['draft', 'rejected'].includes(timesheetStatus);
  },

  /**
   * Get working hours display text with overnight shift support
   */
  getWorkingHoursDisplay(entry) {
    if (!entry || entry.type !== 'working_hours' || !entry.startTime || !entry.endTime) {
      return null;
    }

    const start = this.formatTimeForDisplay(entry.startTime);
    const end = this.formatTimeForDisplay(entry.endTime);
    const duration = this.calculateDuration(entry.startTime, entry.endTime);

    // Check if it's an overnight shift
    const isOvernightShift = dayjs(entry.endTime, 'HH:mm').isBefore(dayjs(entry.startTime, 'HH:mm')) || 
                            dayjs(entry.endTime, 'HH:mm').isSame(dayjs(entry.startTime, 'HH:mm'));

    return {
      timeRange: `${start} - ${end}${isOvernightShift ? ' (+1)' : ''}`,
      duration: duration ? duration.formatted : '',
      startTime: start,
      endTime: end,
      isOvernightShift
    };
  },

  /**
   * Generate entry summary for calendar display with overnight shift indicator
   */
  getEntryCalendarSummary(entry) {
    if (!entry) return null;

    switch (entry.type) {
      case 'working_hours':
        if (entry.startTime && entry.endTime) {
          // Use 12-hour format for calendar display
          const start = dayjs(entry.startTime, 'HH:mm').format('h:mmA');
          const end = dayjs(entry.endTime, 'HH:mm').format('h:mmA');
          
          // Check if overnight shift
          const isOvernight = dayjs(entry.endTime, 'HH:mm').isBefore(dayjs(entry.startTime, 'HH:mm')) || 
                             dayjs(entry.endTime, 'HH:mm').isSame(dayjs(entry.startTime, 'HH:mm'));
          
          return `${start}-${end}${isOvernight ? '+' : ''}`;
        }
        return 'Working';

      case 'annual_leave':
        return 'AL';
        
      case 'annual_leave_halfday':
        return entry.halfDayPeriod ? `AL-${entry.halfDayPeriod}` : 'AL-HD';
        
      case 'medical_leave':
        return 'ML';
        
      case 'off_in_lieu':
        return 'OIL';
        
      case 'day_off':
        return 'PH';
        
      default:
        // For other leave types, create short abbreviation
        return entry.type
          .split('_')
          .map(word => word.charAt(0).toUpperCase())
          .join('');
    }
  },

  /**
   * Validate bulk entry form data with overnight shift support
   */
  validateBulkEntryData(formData, entryType, fileList, individualModifications, dates) {
    const errors = [];

    // Basic validation
    if (!formData.entryType && !formData.othersEntryType) {
      errors.push('Please select a valid entry type');
    }

    // Working hours validation with overnight support
    if (entryType === 'working_hours') {
      if (!formData.startTime || !formData.endTime) {
        errors.push('Please set both start and end times for working hours');
      } else {
        const duration = this.calculateDuration(
          formData.startTime.format('HH:mm'),
          formData.endTime.format('HH:mm')
        );
        
        if (!duration || duration.totalMinutes <= 0) {
          errors.push('Invalid time range');
        } else if (duration.totalMinutes > 16 * 60) {
          errors.push('Working hours cannot exceed 16 hours per shift');
        } else if (duration.totalMinutes < 30) {
          errors.push('Working hours must be at least 30 minutes');
        }
      }
    }

    // Half day validation
    const isHalfDay = ['annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'].includes(entryType);
    if (isHalfDay && !formData.halfDayPeriod) {
      errors.push('Please select AM or PM for half day leave');
    }

    // Document validation
    const requiresDocuments = [
      'annual_leave', 'annual_leave_halfday', 'medical_leave',
      'childcare_leave', 'childcare_leave_halfday', 'shared_parental_leave',
      'nopay_leave', 'nopay_leave_halfday', 'hospitalization_leave',
      'reservist', 'paternity_leave', 'compassionate_leave', 'maternity_leave'
    ].includes(entryType);

    if (requiresDocuments && (!fileList || fileList.length === 0)) {
      errors.push('Supporting documents are required for this leave type');
    }

    // Off in Lieu validation
    if (entryType === 'off_in_lieu') {
      const daysWithoutEarnedDate = dates.filter(date => {
        const modification = individualModifications[date];
        return !modification || !modification.dateEarned;
      });
      
      if (daysWithoutEarnedDate.length > 0) {
        errors.push(`Please set date earned for all ${dates.length} days. ${daysWithoutEarnedDate.length} day(s) still need earned dates.`);
      }

      // Validate each earned date
      dates.forEach(date => {
        const modification = individualModifications[date];
        if (modification && modification.dateEarned) {
          const earnedDate = dayjs(modification.dateEarned);
          const entryDate = dayjs(date);
          
          if (earnedDate.isAfter(entryDate)) {
            errors.push(`Date earned for ${dayjs(date).format('MMM DD')} cannot be after the Off in Lieu date`);
          }

          if (earnedDate.isAfter(dayjs().endOf('day'))) {
            errors.push(`Date earned for ${dayjs(date).format('MMM DD')} cannot be in the future`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Prepare bulk entry data for API submission
   */
  prepareBulkEntryData(date, formData, actualEntryType, individualModification, primaryDocumentDay, fileList) {
    const baseData = {
      date,
      type: actualEntryType,
      notes: formData.notes || '',
      ...(actualEntryType === 'working_hours' && {
        startTime: formData.startTime.format('HH:mm'),
        endTime: formData.endTime.format('HH:mm')
      }),
      ...(actualEntryType === 'off_in_lieu' && {
        dateEarned: individualModification?.dateEarned
      }),
      ...(this.isHalfDayType(actualEntryType) && {
        halfDayPeriod: formData.halfDayPeriod
      })
    };

    // Apply individual modifications
    if (individualModification) {
      const { dateEarned, ...otherModifications } = individualModification;
      Object.assign(baseData, otherModifications);
    }

    // Handle document references
    const requiresDocuments = [
      'annual_leave', 'annual_leave_halfday', 'medical_leave',
      'childcare_leave', 'childcare_leave_halfday', 'shared_parental_leave',
      'nopay_leave', 'nopay_leave_halfday', 'hospitalization_leave',
      'reservist', 'paternity_leave', 'compassionate_leave', 'maternity_leave'
    ].includes(actualEntryType);

    if (requiresDocuments) {
      if (date === primaryDocumentDay) {
        // Primary document day gets the actual documents
        baseData.supportingDocuments = fileList.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data: file.base64Data
        }));
        baseData.isPrimaryDocument = true;
      } else {
        // Other days reference the primary document day
        baseData.documentReference = primaryDocumentDay;
        baseData.notes = `${baseData.notes ? baseData.notes + ' ' : ''}(References documents from ${dayjs(primaryDocumentDay).format('MMM DD')})`;
      }
    }

    return baseData;
  },

  /**
   * Helper function to check if entry type is half day
   */
  isHalfDayType(type) {
    return ['annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'].includes(type);
  }
};