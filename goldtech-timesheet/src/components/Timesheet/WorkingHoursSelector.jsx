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
 * WorkingHoursSelector Component - Updated with PM to AM support and 5-minute intervals
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
   * Parse time input like "9:30 PM" or "20:30" to dayjs object
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
   * Calculate duration with support for overnight shifts (PM to AM)
   */
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null;

    let start = dayjs(startTime);
    let end = dayjs(endTime);

    // If end time is before start time, assume it's next day (overnight shift)
    if (end.isBefore(start) || end.isSame(start)) {
      end = end.add(1, 'day');
    }

    const duration = end.diff(start, 'minute');
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return {
      hours,
      minutes,
      totalMinutes: duration,
      formatted: `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    };
  };

  /**
   * Handle deleting custom hours
   */
  const handleDeleteCustomHours = async (customId) => {
    console.log('Attempting to delete custom hours with ID:', customId);
    
    if (!onRemoveCustomHours) {
      console.error('onRemoveCustomHours function not provided');
      message.error('Delete function not available');
      return;
    }

    try {
      onRemoveCustomHours(customId);
      
      if (selectedHoursId === customId) {
        onHoursChange && onHoursChange(null);
        form && form.setFieldsValue({
          startTime: null,
          endTime: null
        });
      }
      
      message.success('Custom hours deleted successfully');
    } catch (error) {
      console.error('Error deleting custom hours:', error);
      message.error('Failed to delete custom hours');
    }
  };

  /**
   * Generate hours options with delete functionality for custom hours
   */
  const getHoursOptions = () => {
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
            const target = e.target;
            if (target.closest('.ant-btn') || target.closest('.ant-popover')) {
              e.stopPropagation();
            }
          }}
        >
          <span>
            {formatTimeDisplay(custom.startTime, custom.endTime)}
          </span>
          <Popconfirm
            title="Delete this custom time?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteCustomHours(custom.id)}
            onCancel={() => console.log('Delete cancelled')}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Delete button clicked for:', custom.id);
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
      ...customOptions,
      { value: 'add-custom', label: '+ Add Custom Hours' }
    ];
  };

  /**
   * Format time display with duration calculation
   */
  const formatTimeDisplay = (startTime, endTime) => {
    const start = dayjs(startTime, 'HH:mm').format('h:mm A');
    const end = dayjs(endTime, 'HH:mm').format('h:mm A');
    
    const duration = calculateDuration(
      dayjs(startTime, 'HH:mm'), 
      dayjs(endTime, 'HH:mm')
    );
    
    const durationText = duration ? ` (${duration.formatted})` : '';
    return `${start} - ${end}${durationText}`;
  };

  /**
   * Handle hours selection
   */
  const handleHoursSelectionChange = (value) => {
    if (value === 'add-custom') {
      setShowCustomInput(true);
      setStartTimeInput('');
      setEndTimeInput('');
      onHoursChange && onHoursChange(value);
      form && form.setFieldsValue({
        startTime: null,
        endTime: null
      });
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
   * Validate custom working hours with overnight support
   */
  const validateCustomHours = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return { isValid: false, error: 'Please set both start and end times' };
    }

    // Calculate duration (supports overnight)
    const duration = calculateDuration(startTime, endTime);
    
    if (!duration || duration.totalMinutes <= 0) {
      return { isValid: false, error: 'Invalid time range' };
    }

    // Maximum 16 hours per shift
    if (duration.totalMinutes > 16 * 60) {
      return { isValid: false, error: 'Working hours cannot exceed 16 hours per shift' };
    }

    // Minimum 30 minutes
    if (duration.totalMinutes < 30) {
      return { isValid: false, error: 'Working hours must be at least 30 minutes' };
    }

    return { isValid: true, duration };
  };

  /**
   * Save custom working hours
   */
  const handleSaveCustomHours = () => {
    let finalStartTime = customStartTime;
    let finalEndTime = customEndTime;

    // Parse manual inputs if provided
    if (startTimeInput) {
      const parsedStart = parseTimeInput(startTimeInput);
      if (parsedStart && parsedStart.isValid()) {
        finalStartTime = parsedStart;
      } else {
        message.error('Invalid start time format. Use formats like "9:30 AM" or "21:30"');
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

    // Validate the time range
    const validation = validateCustomHours(finalStartTime, finalEndTime);
    if (!validation.isValid) {
      message.warning(validation.error);
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
    
    message.success(`Custom working hours added: ${formatTimeDisplay(startTime, endTime)}`);
  };

  return (
    <>
      <Select
        value={selectedHoursId}
        onChange={handleHoursSelectionChange}
        placeholder="Select working hours"
        options={getHoursOptions()}
        optionRender={(option) => option.data.label}
        dropdownStyle={{ minWidth: 350 }}
      />

      {/* Enhanced Custom Hours Input */}
      {showCustomInput && (
        <>
          <div style={{ marginTop: 16 }}>
            {/* Time Picker Row with 5-minute intervals */}
            <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
              <Col span={10}>
                <TimePicker
                  value={customStartTime}
                  onChange={setCustomStartTime}
                  format="h:mm A"
                  use12Hours
                  placeholder="Start Time"
                  style={{ width: '100%' }}
                  minuteStep={5}
                  showNow={false}
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
                  minuteStep={5}
                  showNow={false}
                />
              </Col>
              <Col span={4}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setShowCustomInput(false);
                    onHoursChange && onHoursChange(null);
                  }}
                  style={{ color: '#999' }}
                />
              </Col>
            </Row>

            {/* Action Buttons */}
            <Row gutter={16} align="middle">
              <Col span={24}>
                <Space>
                  <Button type="primary" onClick={handleSaveCustomHours}>
                    Save & Select
                  </Button>
                  <Button onClick={() => {
                    setShowCustomInput(false);
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