import React, { useState, useEffect } from 'react';
import { 
  Input, 
  DatePicker,
  message
} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

/**
 * OffInLieuSelector Component
 * Restricts date selection to dates BEFORE the Off in Lieu date
 * 
 * @param {string} value - Selected date earned in YYYY-MM-DD format
 * @param {function} onChange - Callback when date changes
 * @param {object} form - Ant Design form instance (optional for bulk mode)
 * @param {boolean} disabled - Whether the selector is disabled
 * @param {string} selectedDate - The Off in Lieu date (YYYY-MM-DD) - dates must be BEFORE this
 */
function OffInLieuSelector({ 
  value, 
  onChange, 
  form = null,
  disabled = false,
  selectedDate = null // The Off in Lieu date being claimed
}) {
  const [inputValue, setInputValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialize component with existing value
  useEffect(() => {
    if (value) {
      const parsedDate = dayjs(value, 'YYYY-MM-DD', true);
      if (parsedDate.isValid()) {
        setInputValue(parsedDate.format('DD/MM/YYYY'));
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
  };

  /**
   * Handle input blur - validate and format
   */
  const handleInputBlur = () => {
    if (inputValue.trim()) {
      const parsedDate = dayjs(inputValue, 'DD/MM/YYYY', true);
      
      if (!parsedDate.isValid()) {
        message.error('Invalid date format. Please use DD/MM/YYYY format.');
        return;
      }
      
      // Check if date is in the future
      if (parsedDate.isAfter(dayjs().endOf('day'))) {
        message.error('Date cannot be in the future.');
        return;
      }

      // Check if date is on or after the Off in Lieu date
      if (selectedDate) {
        const oilDate = dayjs(selectedDate);
        if (parsedDate.isSameOrAfter(oilDate, 'day')) {
          message.error(`Date earned must be before ${oilDate.format('DD/MM/YYYY')}`);
          return;
        }
      }
      
      const formattedDate = parsedDate.format('YYYY-MM-DD');
      
      // Update form field if provided
      if (form) {
        form.setFieldValue('dateEarned', formattedDate);
      }
      
      // Call parent onChange
      if (onChange) {
        onChange(formattedDate);
      }
    } else {
      // Clear the value
      if (form) {
        form.setFieldValue('dateEarned', null);
      }
      if (onChange) {
        onChange(null);
      }
    }
  };

  /**
   * Handle date picker change
   */
  const handleDatePickerChange = (date) => {
    if (date) {
      const formattedInput = date.format('DD/MM/YYYY');
      const formattedDate = date.format('YYYY-MM-DD');
      
      setInputValue(formattedInput);
      setShowDatePicker(false);
      
      // Update form field if provided
      if (form) {
        form.setFieldValue('dateEarned', formattedDate);
      }
      
      // Call parent onChange
      if (onChange) {
        onChange(formattedDate);
      }
    }
  };

  /**
   * Handle calendar icon click
   */
  const handleCalendarClick = () => {
    if (!disabled) {
      setShowDatePicker(!showDatePicker);
    }
  };

  /**
   * Get the maximum selectable date
   * Returns the day BEFORE the Off in Lieu date
   */
  const getMaxSelectableDate = () => {
    if (selectedDate) {
      // Return one day before the Off in Lieu date
      return dayjs(selectedDate).subtract(1, 'day').endOf('day');
    }
    // If no selectedDate, default to today
    return dayjs().endOf('day');
  };

  return (
    <div style={{ position: 'relative' }}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onPressEnter={handleInputBlur}
        placeholder="DD/MM/YYYY"
        disabled={disabled}
        suffix={
          <CalendarOutlined 
            style={{ 
              cursor: disabled ? 'not-allowed' : 'pointer', 
              color: disabled ? '#d9d9d9' : '#1890ff' 
            }}
            onClick={handleCalendarClick}
          />
        }
      />
      
      {showDatePicker && !disabled && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          zIndex: 1000,
          marginTop: '4px'
        }}>
          <DatePicker
            open={true}
            onChange={handleDatePickerChange}
            onOpenChange={(open) => {
              if (!open) {
                setShowDatePicker(false);
              }
            }}
            format="DD/MM/YYYY"
            disabledDate={(current) => {
              if (!current) return false;
              
              const maxDate = getMaxSelectableDate();
              
              // Disable if date is after the maximum allowed date
              // For Sept 3rd Off in Lieu, this disables Sept 3rd and later
              return current.isAfter(maxDate, 'day');
            }}
            style={{ visibility: 'hidden', position: 'absolute' }}
            getPopupContainer={() => document.body}
          />
        </div>
      )}
    </div>
  );
}

export default OffInLieuSelector;