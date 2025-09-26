// Updated entryTypeConfig.js - Remove no_entry type completely
export const entryTypeConfig = {
  // Entry type options (no_entry completely removed)
  mainEntryTypeOptions: [
    { value: 'working_hours', label: 'Working Hours' },
    { value: 'annual_leave', label: 'Annual Leave' },
    { value: 'annual_leave_halfday', label: 'Annual Leave (Half Day)' },
    { value: 'medical_leave', label: 'Medical Leave' },
    { value: 'off_in_lieu', label: 'Off in Lieu' },
    { value: 'day_off', label: 'Public Holiday' },
    { value: 'others', label: 'Others' }
  ],

  othersEntryTypeOptions: [
    { value: 'childcare_leave', label: 'Childcare Leave' },
    { value: 'childcare_leave_halfday', label: 'Childcare Leave (Half Day)' },
    { value: 'shared_parental_leave', label: 'Shared Parental Leave' },
    { value: 'nopay_leave', label: 'No Pay Leave' },
    { value: 'nopay_leave_halfday', label: 'No Pay Leave (Half Day)' },
    { value: 'hospitalization_leave', label: 'Hospitalization Leave' },
    { value: 'reservist', label: 'Reservist' },
    { value: 'paternity_leave', label: 'Paternity Leave' },
    { value: 'compassionate_leave', label: 'Compassionate Leave' },
    { value: 'maternity_leave', label: 'Maternity Leave' }
  ],

  // Entry types that require documents
  documentRequiredTypes: [
    'annual_leave', 'annual_leave_halfday', 'medical_leave',
    'childcare_leave', 'childcare_leave_halfday', 'shared_parental_leave',
    'nopay_leave', 'nopay_leave_halfday', 'hospitalization_leave',
    'reservist', 'paternity_leave', 'compassionate_leave', 'maternity_leave'
  ],

  // Half day types that need AM/PM selection
  halfDayTypes: [
    'annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'
  ],

  // Helper functions
  isOthersEntryType(type) {
    return this.othersEntryTypeOptions.some(option => option.value === type);
  },

  requiresDocuments(type) {
    return this.documentRequiredTypes.includes(type);
  },

  isHalfDayType(type) {
    return this.halfDayTypes.includes(type);
  },

  // Get friendly display name for entry type
  getEntryTypeDisplayName(type) {
    const allOptions = [...this.mainEntryTypeOptions, ...this.othersEntryTypeOptions];
    const option = allOptions.find(opt => opt.value === type);
    return option ? option.label : type.replace(/_/g, ' ').toUpperCase();
  },

  // Get entry type color for tags (no_entry removed)
  getEntryTypeColor(type) {
    const colorMap = {
      'working_hours': 'blue',
      'annual_leave': 'orange',
      'annual_leave_halfday': 'orange',
      'medical_leave': 'red',
      'off_in_lieu': 'purple',
      'childcare_leave': 'purple',
      'childcare_leave_halfday': 'purple',
      'shared_parental_leave': 'cyan',
      'nopay_leave': 'gray',
      'nopay_leave_halfday': 'gray',
      'hospitalization_leave': 'red',
      'reservist': 'green',
      'paternity_leave': 'blue',
      'compassionate_leave': 'magenta',
      'maternity_leave': 'pink',
      'day_off': 'gold'
    };
    return colorMap[type] || 'default';
  }
};