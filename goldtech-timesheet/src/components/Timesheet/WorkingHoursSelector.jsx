import React, { useState } from 'react';
import { 
  Select, 
  TimePicker, 
  Button, 
  Space, 
  Row, 
  Col,
  Input,
  message,
  Popconfirm
} from 'antd';
import { DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

/**
 * WorkingHoursSelector Component - Fixed version with proper delete functionality
 */
function WorkingHoursSelector({
  customHoursList = [],
  selectedHoursId,
  onHoursChange,
  onAddCustomHours,
  onRemoveCustomHours,
  form
}) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStartTime, setCustomStartTime] = useState(null);
  const [customEndTime, setCustomEndTime] = useState(null);
  
  // For manual time input
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');

  /**
   * Parse time input like "9:30 AM" or "14:30" to dayjs object
   */
  const parseTimeInput = (timeStr) => {
    if (!timeStr) return null;
    
    const cleanInput = timeStr.trim().toLowerCase();
    
    // Check if it contains AM/PM
    if (cleanInput.includes('am') || cleanInput.includes('pm')) {
      try {
        return dayjs(cleanInput, ['h:mm A', 'hh:mm A', 'h A', 'hh A']);
      } catch {
        return null;
      }
    } else {
      // 24-hour format
      try {
        return dayjs(cleanInput, ['H:mm', 'HH:mm']);
      } catch {
        return null;
      }
    }
  };

  /**
   * Handle deleting custom hours - Fixed version
   */
  const handleDeleteCustomHours = async (customId) => {
    console.log('Attempting to delete custom hours with ID:', customId); // Debug log
    
    if (!onRemoveCustomHours) {
      console.error('onRemoveCustomHours function not provided');
      message.error('Delete function not available');
      return;
    }

    try {
      // Call the remove function
      onRemoveCustomHours(customId);
      
      // If the deleted item was selected, clear selection
      if (selectedHoursId === customId) {
        onHoursChange && onHoursChange(null);
        form && form.setFieldsValue({
          startTime: null,
          endTime: null
        });
      }
      
      message.success('Custom hours deleted successfully');
      console.log('Custom hours deleted successfully'); // Debug log
    } catch (error) {
      console.error('Error deleting custom hours:', error);
      message.error('Failed to delete custom hours');
    }
  };

  /**
   * Generate hours options with delete functionality for custom hours
   */
  const getHoursOptions = () => {
    const predefinedOptions = [
      { value: '9-18', label: '9:00 AM - 6:00 PM', startTime: '09:00', endTime: '18:00' },
    ];

    const customOptions = customHoursList.map(custom => ({
      value: custom.id,
      label: (
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}
          onClick={(e) => {
            // Prevent the option from being selected when clicking the delete area
            const target = e.target;
            if (target.closest('.ant-btn') || target.closest('.ant-popover')) {
              e.stopPropagation();
            }
          }}
        >
          <span>
            {dayjs(custom.startTime, 'HH:mm').format('h:mm A')} - {dayjs(custom.endTime, 'HH:mm').format('h:mm A')} (Custom)
          </span>
          <Popconfirm
            title="Delete this custom time?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteCustomHours(custom.id)} // Simplified - removed event parameter
            onCancel={() => console.log('Delete cancelled')} // Debug log
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined />} 
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                console.log('Delete button clicked for:', custom.id); // Debug log
              }}
              style={{ color: '#ff4d4f', marginLeft: 8 }}
              danger
            />
          </Popconfirm>
        </div>
      ),
      startTime: custom.startTime,
      endTime: custom.endTime,
      isCustom: true
    }));

    return [
      ...predefinedOptions,
      ...customOptions,
      { value: 'add-custom', label: '+ Add Custom Hours' }
    ];
  };

  /**
   * Handle hours selection
   */
  const handleHoursSelectionChange = (value) => {
    if (value === 'add-custom') {
      setShowCustomInput(true);
      setStartTimeInput('');
      setEndTimeInput('');
      // Keep the dropdown showing "add-custom"
      onHoursChange && onHoursChange(value);
      // Clear form fields when entering custom mode
      form && form.setFieldsValue({
        startTime: null,
        endTime: null
      });
      // Reset custom time pickers to empty
      setCustomStartTime(null);
      setCustomEndTime(null);
      return;
    }

    onHoursChange && onHoursChange(value);
    const selectedOption = getHoursOptions().find(opt => opt.value === value);
    
    if (selectedOption) {
      form && form.setFieldsValue({
        startTime: dayjs(selectedOption.startTime, 'HH:mm'),
        endTime: dayjs(selectedOption.endTime, 'HH:mm')
      });
    }
  };

  /**
   * Handle manual time input changes
   */
  const handleTimeInputChange = (field, value) => {
    if (field === 'start') {
      setStartTimeInput(value);
      const parsedTime = parseTimeInput(value);
      if (parsedTime && parsedTime.isValid()) {
        setCustomStartTime(parsedTime);
      }
    } else {
      setEndTimeInput(value);
      const parsedTime = parseTimeInput(value);
      if (parsedTime && parsedTime.isValid()) {
        setCustomEndTime(parsedTime);
      }
    }
  };

  /**
   * Save custom working hours and add to dropdown immediately
   */
  const handleSaveCustomHours = () => {
    // Parse manual inputs if provided
    let finalStartTime = customStartTime;
    let finalEndTime = customEndTime;

    if (startTimeInput) {
      const parsedStart = parseTimeInput(startTimeInput);
      if (parsedStart && parsedStart.isValid()) {
        finalStartTime = parsedStart;
      } else {
        message.error('Invalid start time format. Use formats like "9:30 AM" or "14:30"');
        return;
      }
    }

    if (endTimeInput) {
      const parsedEnd = parseTimeInput(endTimeInput);
      if (parsedEnd && parsedEnd.isValid()) {
        finalEndTime = parsedEnd;
      } else {
        message.error('Invalid end time format. Use formats like "5:30 PM" or "17:30"');
        return;
      }
    }

    if (!finalStartTime || !finalEndTime) {
      message.warning('Please set both start and end times');
      return;
    }

    if (finalStartTime.isAfter(finalEndTime) || finalStartTime.isSame(finalEndTime)) {
      message.warning('End time must be after start time');
      return;
    }

    const startTime = finalStartTime.format('HH:mm');
    const endTime = finalEndTime.format('HH:mm');
    
    // Check for duplicates
    const allOptions = getHoursOptions();
    const isDuplicate = allOptions.some(
      option => option.startTime === startTime && option.endTime === endTime
    );

    if (isDuplicate) {
      message.warning('This time combination already exists');
      return;
    }

    const customId = `custom-${Date.now()}`;
    const newCustomHours = { id: customId, startTime, endTime };
    
    onAddCustomHours && onAddCustomHours(newCustomHours);
    
    // Automatically select the new custom hours
    onHoursChange && onHoursChange(customId);
    form && form.setFieldsValue({
      startTime: finalStartTime,
      endTime: finalEndTime
    });
    
    setShowCustomInput(false);
    setStartTimeInput('');
    setEndTimeInput('');
    message.success('Custom working hours added and selected');
  };

  return (
    <>
      <Select
        value={selectedHoursId}
        onChange={handleHoursSelectionChange}
        placeholder="Select working hours"
        options={getHoursOptions()}
        optionRender={(option) => option.data.label}
        dropdownStyle={{ minWidth: 300 }} // Ensure dropdown is wide enough for delete button
      />

      {/* Enhanced Custom Hours Input */}
      {showCustomInput && (
        <>
          <div style={{ marginTop: 16 }}>
            {/* Time Picker Row */}
            <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
              <Col span={10}>
                <TimePicker
                  value={customStartTime}
                  onChange={setCustomStartTime}
                  format="h:mm A"
                  use12Hours
                  placeholder="Start Time"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={10}>
                <TimePicker
                  value={customEndTime}
                  onChange={setCustomEndTime}
                  format="h:mm A"
                  use12Hours
                  placeholder="End Time"
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={4}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setShowCustomInput(false);
                    // Reset selection when closing
                    onHoursChange && onHoursChange(null);
                  }}
                  style={{ color: '#999' }}
                />
              </Col>
            </Row>

            {/* Action Buttons */}
            <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Space>
                  <Button type="primary" onClick={handleSaveCustomHours}>
                    Save & Select
                  </Button>
                  <Button onClick={() => {
                    setShowCustomInput(false);
                    // Reset selection when canceling
                    onHoursChange && onHoursChange(null);
                  }}>
                    Cancel
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        </>
      )}
    </>
  );
}

export default WorkingHoursSelector;