// src/components/Common/LocationDepartmentSelector.jsx
// Hierarchical selector for Location -> Department with "Others" option
import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Row, Col } from 'antd';
import { getAllLocations, getDepartmentsByLocation } from './locationDepartmentData';

const { Option } = Select;

function LocationDepartmentSelector({ 
  form, 
  initialLocation, 
  initialDepartment,
  disabled = false,
  locationFieldName = 'location',
  departmentFieldName = 'department',
  locationLabel = 'Location',
  departmentLabel = 'Department',
  locationRequired = false,
  departmentRequired = true
}) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [showLocationOther, setShowLocationOther] = useState(false);
  const [showDepartmentOther, setShowDepartmentOther] = useState(false);

  // Get all locations and add "Others"
  const allLocations = [...getAllLocations(), 'Others'];

  useEffect(() => {
    // Check if initial location is custom (not in predefined list)
    if (initialLocation && !getAllLocations().includes(initialLocation)) {
      setShowLocationOther(true);
      setSelectedLocation('Others');
    } else {
      setSelectedLocation(initialLocation);
    }

    // Update available departments when location changes
    if (initialLocation) {
      updateDepartments(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    // Check if initial department is custom (not in predefined list)
    if (initialDepartment && selectedLocation) {
      const depts = getDepartmentsByLocation(selectedLocation);
      if (!depts.includes(initialDepartment)) {
        setShowDepartmentOther(true);
      }
    }
  }, [initialDepartment, selectedLocation]);

  const updateDepartments = (location) => {
    if (location === 'Others') {
      // When location is "Others", show only "Others" option for department
      setAvailableDepartments(['Others']);
      setShowDepartmentOther(false);
      // Clear department when location is "Others"
      form.setFieldValue(departmentFieldName, undefined);
    } else {
      const departments = getDepartmentsByLocation(location);
      setAvailableDepartments([...departments, 'Others']);
      setShowDepartmentOther(false);
    }
  };

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    
    if (value === 'Others') {
      setShowLocationOther(true);
      // When location is "Others", enable department with "Others" option
      setAvailableDepartments(['Others']);
      form.setFieldValue(locationFieldName, undefined);
      form.setFieldValue(departmentFieldName, undefined);
      setShowDepartmentOther(false);
    } else {
      setShowLocationOther(false);
      form.setFieldValue(locationFieldName, value);
      updateDepartments(value);
      // Clear department when location changes
      form.setFieldValue(departmentFieldName, undefined);
    }
  };

  const handleDepartmentChange = (value) => {
    if (value === 'Others') {
      setShowDepartmentOther(true);
      form.setFieldValue(departmentFieldName, undefined);
    } else {
      setShowDepartmentOther(false);
      form.setFieldValue(departmentFieldName, value);
    }
  };

  const handleLocationOtherChange = (e) => {
    const value = e.target.value;
    form.setFieldValue(locationFieldName, value);
  };

  const handleDepartmentOtherChange = (e) => {
    const value = e.target.value;
    form.setFieldValue(departmentFieldName, value);
  };

  return (
    <Row gutter={24}>
      {/* Location Selection */}
      <Col xs={24} md={12}>
        <Form.Item
          label={locationLabel}
          required={locationRequired}
        >
          <Select
            value={showLocationOther ? 'Others' : (selectedLocation || undefined)}
            onChange={handleLocationChange}
            placeholder="Select location"
            disabled={disabled}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {allLocations.map(location => (
              <Option key={location} value={location}>
                {location}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Location - Others Text Input */}
        {showLocationOther && (
          <Form.Item
            name={locationFieldName}
            rules={[
              { required: locationRequired, message: `Please input ${locationLabel.toLowerCase()}!` }
            ]}
            style={{ marginTop: -16 }}
          >
            <Input 
              placeholder="Enter custom location"
              disabled={disabled}
              onChange={handleLocationOtherChange}
            />
          </Form.Item>
        )}

        {/* Hidden field for non-other locations */}
        {!showLocationOther && (
          <Form.Item name={locationFieldName} hidden>
            <Input />
          </Form.Item>
        )}
      </Col>

      {/* Department Selection */}
      <Col xs={24} md={12}>
        <Form.Item
          label={departmentLabel}
          required={departmentRequired}
        >
          <Select
            value={showDepartmentOther ? 'Others' : (form.getFieldValue(departmentFieldName) || undefined)}
            onChange={handleDepartmentChange}
            placeholder={
              !selectedLocation 
                ? "Select location first" 
                : "Select department"
            }
            disabled={disabled || !selectedLocation}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {availableDepartments.map(dept => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Department - Others Text Input */}
        {showDepartmentOther && (
          <Form.Item
            name={departmentFieldName}
            rules={[
              { required: departmentRequired, message: `Please input ${departmentLabel.toLowerCase()}!` }
            ]}
            style={{ marginTop: -16 }}
          >
            <Input 
              placeholder="Enter custom department"
              disabled={disabled}
              onChange={handleDepartmentOtherChange}
            />
          </Form.Item>
        )}

        {/* Hidden field for non-other departments */}
        {!showDepartmentOther && (
          <Form.Item name={departmentFieldName} hidden>
            <Input />
          </Form.Item>
        )}
      </Col>
    </Row>
  );
}

export default LocationDepartmentSelector;