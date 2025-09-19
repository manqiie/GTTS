// SharedEntryTypeSelector.jsx - Reusable Entry Type Selector
import React from 'react';
import { Form, Select, Radio } from 'antd';
import { entryTypeConfig } from './entryTypeConfig';

function SharedEntryTypeSelector({
  form,
  entryType,
  showOthersDropdown,
  onEntryTypeChange,
  allowBulkSpecificTypes = false,
  disabled = false
}) {

  // Handle main entry type change
  const handleMainEntryTypeChange = (value) => {
    let newEntryType = null;
    let newShowOthersDropdown = false;
    let newSelectedHoursId = null;

    if (value === 'others') {
      newShowOthersDropdown = true;
      form.setFieldValue('othersEntryType', undefined);
    } else {
      newEntryType = value;
      form.setFieldValue('othersEntryType', undefined);
      
      // Auto-select default hours for working hours
      if (value === 'working_hours') {
        // This will be handled by parent component
        newSelectedHoursId = 'default';
      }
    }

    // Call parent handler with state updates
    if (onEntryTypeChange) {
      onEntryTypeChange(value, {
        entryType: newEntryType,
        showOthersDropdown: newShowOthersDropdown,
        selectedHoursId: newSelectedHoursId
      });
    }
  };

  // Handle others entry type change
  const handleOthersEntryTypeChange = (value) => {
    if (onEntryTypeChange) {
      onEntryTypeChange(value, {
        entryType: value,
        showOthersDropdown: true,
        selectedHoursId: null
      });
    }
  };

  return (
    <>
      <Form.Item
        label="Entry Type"
        name="entryType"
        rules={[{ required: true, message: 'Please select entry type' }]}
      >
        <Select
          placeholder={allowBulkSpecificTypes ? "Select entry type for all days" : "Select entry type"}
          onChange={handleMainEntryTypeChange}
          options={entryTypeConfig.mainEntryTypeOptions}
          disabled={disabled}
        />
      </Form.Item>

      {/* Others Entry Type Dropdown */}
      {showOthersDropdown && (
        <Form.Item
          label="Select Leave Type"
          name="othersEntryType"
          rules={[{ required: true, message: 'Please select a leave type' }]}
        >
          <Select
            placeholder="Select specific leave type"
            onChange={handleOthersEntryTypeChange}
            options={entryTypeConfig.othersEntryTypeOptions}
            disabled={disabled}
          />
        </Form.Item>
      )}

      {/* Half Day Period Selection */}
      {entryType && entryTypeConfig.isHalfDayType(entryType) && (
        <Form.Item
          label="Half Day Period"
          name="halfDayPeriod"
          rules={[{ required: true, message: 'Please select AM or PM' }]}
        >
          <Radio.Group disabled={disabled}>
            <Radio value="AM">AM (Morning)</Radio>
            <Radio value="PM">PM (Afternoon)</Radio>
          </Radio.Group>
        </Form.Item>
      )}
    </>
  );
}

export default SharedEntryTypeSelector;