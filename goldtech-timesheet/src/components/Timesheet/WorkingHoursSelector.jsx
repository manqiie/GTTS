// Updated WorkingHoursSelector.jsx - Fixed placeholder display
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
 * WorkingHoursSelector Component - Updated with proper placeholder handling
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);

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
            {formatTimeDisplaySimple(custom.startTime, custom.endTime)}
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
   * Format time display WITHOUT duration calculation
   */
  const formatTimeDisplaySimple = (startTime, endTime) => {
    const start = dayjs(startTime, 'HH:mm').format('h:mm A');
    const end = dayjs(endTime, 'HH:mm').format('h:mm A');
    
    return `${start} - ${end}`;
  };

  /**
   * Check if the selectedHoursId is valid (exists in options)
   */
  const isValidSelection = (value) => {
    if (!value) return false;
    const options = getHoursOptions();
    return options.some(option => option.value === value);
  };

  /**
   * Handle hours selection
   */
  const handleHoursSelectionChange = (value) => {
    if (value === 'add-custom') {
      setShowCustomInput(true);
      setCustomStartTime(null);
      setCustomEndTime(null);
      onHoursChange && onHoursChange(value);
      form && form.setFieldsValue({
        startTime: null,
        endTime: null
      });
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

    // Minimum 30 minutes
    if (duration.totalMinutes < 30) {
      return { isValid: false, error: 'Working hours must be at least 30 minutes' };
    }

    return { isValid: true, duration };
  };

  /**
   * AUTO-SAVE custom working hours to database when both times are selected
   */
  const autoSaveCustomHours = async (startTime, endTime) => {
    // Validate the time range
    const validation = validateCustomHours(startTime, endTime);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.error);
      return false;
    }

    const startTimeString = startTime.format('HH:mm');
    const endTimeString = endTime.format('HH:mm');
    
    // Check for duplicates
    const allOptions = getHoursOptions();
    const isDuplicate = allOptions.some(
      option => option.startTime === startTimeString && option.endTime === endTimeString
    );

    if (isDuplicate) {
      console.log('Duplicate time combination detected');
      return false;
    }

    if (!onAddCustomHours) {
      console.error('onAddCustomHours function not provided');
      return false;
    }

    setIsAutoSaving(true);
    
    try {
      const newCustomHours = { 
        startTime: startTimeString, 
        endTime: endTimeString,
        name: `Custom ${formatTimeDisplaySimple(startTimeString, endTimeString)}`
      };
      
      // Save to database via parent component
      const savedHours = await onAddCustomHours(newCustomHours);
      
      if (savedHours) {
        // Automatically select the new custom hours and set form fields
        onHoursChange && onHoursChange(savedHours.id);
        form && form.setFieldsValue({
          startTime: startTime,
          endTime: endTime
        });
        
        setShowCustomInput(false);
        
        message.success(`Custom working hours saved: ${formatTimeDisplaySimple(startTimeString, endTimeString)}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error auto-saving custom hours:', error);
      message.error('Failed to save custom hours: ' + error.message);
      return false;
    } finally {
      setIsAutoSaving(false);
    }
  };

  // Auto-save when both times are selected via TimePicker
  React.useEffect(() => {
    if (customStartTime && customEndTime && showCustomInput && !isAutoSaving) {
      // Add a small delay to prevent rapid API calls
      const saveTimeout = setTimeout(() => {
        autoSaveCustomHours(customStartTime, customEndTime);
      }, 500);

      return () => clearTimeout(saveTimeout);
    }
  }, [customStartTime, customEndTime, showCustomInput, isAutoSaving]);

  // Get the display value for the Select component
  const getSelectValue = () => {
    // If selectedHoursId is valid, return it
    if (isValidSelection(selectedHoursId)) {
      return selectedHoursId;
    }
    
    // If showing custom input, show 'add-custom'
    if (showCustomInput) {
      return 'add-custom';
    }
    
    // Otherwise return undefined to show placeholder
    return undefined;
  };

  return (
    <>
      <Select
        value={getSelectValue()}
        onChange={handleHoursSelectionChange}
        placeholder="Select Working Hours"
        options={getHoursOptions()}
        optionRender={(option) => option.data.label}
        dropdownStyle={{ minWidth: 350 }}
        loading={isAutoSaving}
        allowClear
      />

      {/* Custom Hours Input */}
      {showCustomInput && (
        <div style={{ marginTop: 16 }}>
          {/* Time Picker Row with 5-minute intervals */}
          <Row gutter={16} align="middle">
            <Col span={11}>
              <TimePicker
                value={customStartTime}
                onChange={setCustomStartTime}
                format="h:mm A"
                use12Hours
                placeholder="Start Time"
                style={{ width: '100%' }}
                minuteStep={5}
                showNow={false}
                disabled={isAutoSaving}
              />
            </Col>
            <Col span={11}>
              <TimePicker
                value={customEndTime}
                onChange={setCustomEndTime}
                format="h:mm A"
                use12Hours
                placeholder="End Time"
                style={{ width: '100%' }}
                minuteStep={5}
                showNow={false}
                disabled={isAutoSaving}
              />
            </Col>
            <Col span={2}>
              <Button 
                type="text" 
                size="small" 
                icon={<CloseOutlined />}
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomStartTime(null);
                  setCustomEndTime(null);
                  onHoursChange && onHoursChange(null);
                  form && form.setFieldsValue({
                    startTime: null,
                    endTime: null
                  });
                }}
                style={{ color: '#999' }}
                disabled={isAutoSaving}
              />
            </Col>
          </Row>

          {/* Helper text */}
          <div style={{ 
            fontSize: '12px', 
            color: isAutoSaving ? '#1890ff' : '#666', 
            marginTop: '8px',
            textAlign: 'center'
          }}>
            {isAutoSaving ? 'Saving custom hours...' : 'Custom hours will be saved automatically when both times are selected'}
          </div>
        </div>
      )}
    </>
  );
}

export default WorkingHoursSelector;