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
 * Simplified version with text input and calendar icon
 */
function OffInLieuSelector({ 
  value, 
  onChange, 
  form,
  disabled = false 
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
    }
  }, [value]);

  /**
   * Handle input change and validation
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
      
      const formattedDate = parsedDate.format('YYYY-MM-DD');
      
      // Update form field
      form.setFieldValue('dateEarned', formattedDate);
      
      // Call parent onChange
      if (onChange) {
        onChange(formattedDate);
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
      
      // Update form field
      form.setFieldValue('dateEarned', formattedDate);
      
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
    setShowDatePicker(!showDatePicker);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="DD/MM/YYYY"
        disabled={disabled}
        suffix={
          <CalendarOutlined 
            style={{ cursor: 'pointer', color: '#1890ff' }}
            onClick={handleCalendarClick}
          />
        }
      />
      
      {showDatePicker && (
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
              // Disable future dates
              return current && current > dayjs().endOf('day');
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