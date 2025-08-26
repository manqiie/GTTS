import React, { useState } from 'react';
import { Row, Col, Select, Button, Space, Typography, TimePicker, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

/**
 * QuickSettings Component
 * 
 * Provides quick configuration options:
 * - Default working hours selection
 * - Custom hours creation and management
 * - Bulk actions (apply to all, clear all)
 */
function QuickSettings({
  defaultHours,
  customHoursList,
  onDefaultHoursChange,
  onAddCustomHours,
  onRemoveCustomHours,
  onApplyToAll,
  onClearAll
}) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStartTime, setCustomStartTime] = useState(dayjs('09:00', 'HH:mm'));
  const [customEndTime, setCustomEndTime] = useState(dayjs('18:00', 'HH:mm'));

  // Predefined working hour options
  const predefinedOptions = [
    { value: '9-18', label: '9:00 AM - 6:00 PM', startTime: '09:00', endTime: '18:00' },
    { value: '9-17', label: '9:00 AM - 5:00 PM', startTime: '09:00', endTime: '17:00' },
    { value: '10-18', label: '10:00 AM - 6:00 PM', startTime: '10:00', endTime: '18:00' },
    { value: '8-17', label: '8:00 AM - 5:00 PM', startTime: '08:00', endTime: '17:00' },
    { value: '8:30-17:30', label: '8:30 AM - 5:30 PM', startTime: '08:30', endTime: '17:30' },
  ];

  // Combine predefined and custom options
  const allOptions = [
    ...predefinedOptions,
    ...customHoursList.map(custom => ({
      value: custom.id,
      label: `${dayjs(custom.startTime, 'HH:mm').format('h:mm A')} - ${dayjs(custom.endTime, 'HH:mm').format('h:mm A')} (Custom)`,
      startTime: custom.startTime,
      endTime: custom.endTime,
      isCustom: true
    })),
    { value: 'add-custom', label: '+ Add Custom Hours' }
  ];

  /**
   * Handle default hours selection
   */
  const handleDefaultHoursChange = (value) => {
    if (value === 'add-custom') {
      setShowCustomInput(true);
      return;
    }

    const selected = allOptions.find(opt => opt.value === value);
    if (selected) {
      onDefaultHoursChange({
        id: value,
        startTime: selected.startTime,
        endTime: selected.endTime
      });
    }
  };

  /**
   * Save custom working hours
   */
  const handleSaveCustomHours = () => {
    if (!customStartTime || !customEndTime) {
      message.warning('Please set both start and end times');
      return;
    }

    if (customStartTime.isAfter(customEndTime)) {
      message.warning('End time must be after start time');
      return;
    }

    const startTime = customStartTime.format('HH:mm');
    const endTime = customEndTime.format('HH:mm');
    
    // Check for duplicates
    const isDuplicate = [...predefinedOptions, ...customHoursList].some(
      option => option.startTime === startTime && option.endTime === endTime
    );

    if (isDuplicate) {
      message.warning('This time combination already exists');
      return;
    }

    const customId = `custom-${Date.now()}`;
    const newCustomHours = { id: customId, startTime, endTime };
    
    onAddCustomHours(newCustomHours);
    onDefaultHoursChange(newCustomHours);
    
    setShowCustomInput(false);
    message.success('Custom working hours added successfully');
  };

  /**
   * Remove custom working hours
   */
  const handleRemoveCustomHours = (customId) => {
    onRemoveCustomHours(customId);
    
    // If the removed custom hours was the default, reset to first predefined option
    if (defaultHours && defaultHours.id === customId) {
      onDefaultHoursChange({
        id: predefinedOptions[0].value,
        startTime: predefinedOptions[0].startTime,
        endTime: predefinedOptions[0].endTime
      });
    }
    
    message.success('Custom working hours removed');
  };

  const currentDefaultValue = defaultHours ? defaultHours.id : predefinedOptions[0].value;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>Quick Settings</Title>
      
      <Row gutter={[16, 16]} align="middle">
        {/* Default Working Hours */}
        <Col xs={24} md={8}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <span style={{ fontWeight: 500 }}>My Default Working Hours:</span>
            <Select
              value={currentDefaultValue}
              onChange={handleDefaultHoursChange}
              style={{ width: '100%' }}
              dropdownRender={menu => (
                <div>
                  {menu}
                  {customHoursList.length > 0 && (
                    <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                        Custom Hours:
                      </div>
                      {customHoursList.map(custom => (
                        <div 
                          key={custom.id}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '4px 0'
                          }}
                        >
                          <span style={{ fontSize: '12px' }}>
                            {dayjs(custom.startTime, 'HH:mm').format('h:mm A')} - 
                            {dayjs(custom.endTime, 'HH:mm').format('h:mm A')}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCustomHours(custom.id);
                            }}
                            style={{ color: '#ff4d4f' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            >
              {allOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Col>

        {/* Custom Time Input (when adding new custom hours) */}
        {showCustomInput && (
          <Col xs={24} md={12}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <span style={{ fontWeight: 500 }}>Create Custom Hours:</span>
              <Space.Compact style={{ width: '100%' }}>
                <TimePicker
                  value={customStartTime}
                  onChange={setCustomStartTime}
                  format="HH:mm"
                  placeholder="Start Time"
                  style={{ flex: 1 }}
                />
                <TimePicker
                  value={customEndTime}
                  onChange={setCustomEndTime}
                  format="HH:mm"
                  placeholder="End Time"
                  style={{ flex: 1 }}
                />
                <Button type="primary" onClick={handleSaveCustomHours}>
                  Save
                </Button>
                <Button onClick={() => setShowCustomInput(false)}>
                  Cancel
                </Button>
              </Space.Compact>
              {customStartTime && customEndTime && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Preview: {customStartTime.format('h:mm A')} - {customEndTime.format('h:mm A')}
                </div>
              )}
            </Space>
          </Col>
        )}

        {/* Action Buttons */}
        <Col xs={24} md={8}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              onClick={onApplyToAll}
              style={{ width: '100%' }}
            >
              Apply to All Working Days
            </Button>
            <Button 
              onClick={onClearAll}
              style={{ width: '100%' }}
            >
              Clear All Entries
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default QuickSettings;