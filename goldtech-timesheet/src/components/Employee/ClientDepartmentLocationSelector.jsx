// src/components/Employee/ClientDepartmentLocationSelector.jsx
// Hierarchical selector for Client -> Department -> Location with "Others" option
import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Row, Col } from 'antd';
import { 
  getAllClients, 
  getDepartmentsByClient, 
  getLocationsByClientAndDepartment 
} from './clientDepartmentLocationData';

const { Option } = Select;

function ClientDepartmentLocationSelector({ 
  form, 
  initialClient,
  initialDepartment,
  initialLocation,
  disabled = false,
  clientFieldName = 'client',
  departmentFieldName = 'department',
  locationFieldName = 'location',
  clientLabel = 'Client',
  departmentLabel = 'Department',
  locationLabel = 'Location',
  clientRequired = false,
  departmentRequired = true,
  locationRequired = false
}) {
  const [selectedClient, setSelectedClient] = useState(initialClient || null);
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment || null);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  
  const [showClientOther, setShowClientOther] = useState(false);
  const [showDepartmentOther, setShowDepartmentOther] = useState(false);
  const [showLocationOther, setShowLocationOther] = useState(false);

  // Get all clients and add "Others"
  const allClients = [...getAllClients(), 'Others'];

  useEffect(() => {
    // Check if initial client is custom (not in predefined list)
    if (initialClient && !getAllClients().includes(initialClient)) {
      setShowClientOther(true);
      setSelectedClient('Others');
    } else {
      setSelectedClient(initialClient);
    }

    // Update available departments when client changes
    if (initialClient) {
      updateDepartments(initialClient);
    }
  }, [initialClient]);

  useEffect(() => {
    // Check if initial department is custom
    if (initialDepartment && selectedClient) {
      const depts = getDepartmentsByClient(selectedClient);
      if (!depts.includes(initialDepartment)) {
        setShowDepartmentOther(true);
      }
      setSelectedDepartment(initialDepartment);
    }

    // Update available locations when department changes
    if (initialDepartment && selectedClient) {
      updateLocations(selectedClient, initialDepartment);
    }
  }, [initialDepartment, selectedClient]);

  useEffect(() => {
    // Check if initial location is custom
    if (initialLocation && selectedClient && selectedDepartment) {
      const locs = getLocationsByClientAndDepartment(selectedClient, selectedDepartment);
      if (!locs.includes(initialLocation)) {
        setShowLocationOther(true);
      }
    }
  }, [initialLocation, selectedClient, selectedDepartment]);

  const updateDepartments = (client) => {
    if (client === 'Others') {
      setAvailableDepartments(['Others']);
      setShowDepartmentOther(false);
      form.setFieldValue(departmentFieldName, undefined);
      setAvailableLocations(['Others']);
      form.setFieldValue(locationFieldName, undefined);
    } else {
      const departments = getDepartmentsByClient(client);
      setAvailableDepartments([...departments, 'Others']);
      setShowDepartmentOther(false);
      setAvailableLocations([]);
    }
  };

  const updateLocations = (client, department) => {
    if (client === 'Others' || department === 'Others') {
      setAvailableLocations(['Others']);
      setShowLocationOther(false);
      form.setFieldValue(locationFieldName, undefined);
    } else {
      const locations = getLocationsByClientAndDepartment(client, department);
      setAvailableLocations([...locations, 'Others']);
      setShowLocationOther(false);
    }
  };

  const handleClientChange = (value) => {
    setSelectedClient(value);
    
    if (value === 'Others') {
      setShowClientOther(true);
      setAvailableDepartments(['Others']);
      setAvailableLocations(['Others']);
      form.setFieldValue(clientFieldName, undefined);
      form.setFieldValue(departmentFieldName, undefined);
      form.setFieldValue(locationFieldName, undefined);
      setShowDepartmentOther(false);
      setShowLocationOther(false);
      setSelectedDepartment(null);
    } else {
      setShowClientOther(false);
      form.setFieldValue(clientFieldName, value);
      updateDepartments(value);
      form.setFieldValue(departmentFieldName, undefined);
      form.setFieldValue(locationFieldName, undefined);
      setSelectedDepartment(null);
    }
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    
    if (value === 'Others') {
      setShowDepartmentOther(true);
      setAvailableLocations(['Others']);
      form.setFieldValue(departmentFieldName, undefined);
      form.setFieldValue(locationFieldName, undefined);
      setShowLocationOther(false);
    } else {
      setShowDepartmentOther(false);
      form.setFieldValue(departmentFieldName, value);
      updateLocations(selectedClient, value);
      form.setFieldValue(locationFieldName, undefined);
    }
  };

  const handleLocationChange = (value) => {
    if (value === 'Others') {
      setShowLocationOther(true);
      form.setFieldValue(locationFieldName, undefined);
    } else {
      setShowLocationOther(false);
      form.setFieldValue(locationFieldName, value);
    }
  };

  const handleClientOtherChange = (e) => {
    const value = e.target.value;
    form.setFieldValue(clientFieldName, value);
  };

  const handleDepartmentOtherChange = (e) => {
    const value = e.target.value;
    form.setFieldValue(departmentFieldName, value);
  };

  const handleLocationOtherChange = (e) => {
    const value = e.target.value;
    form.setFieldValue(locationFieldName, value);
  };

  return (
    <>
      <Row gutter={24}>
        {/* Client Selection */}
        <Col xs={24} md={8}>
          <Form.Item
            label={clientLabel}
            required={clientRequired}
          >
            <Select
              value={showClientOther ? 'Others' : (selectedClient || undefined)}
              onChange={handleClientChange}
              placeholder="Select client"
              disabled={disabled}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {allClients.map(client => (
                <Option key={client} value={client}>
                  {client}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Client - Others Text Input */}
          {showClientOther && (
            <Form.Item
              name={clientFieldName}
              rules={[
                { required: clientRequired, message: `Please input ${clientLabel.toLowerCase()}!` }
              ]}
              style={{ marginTop: -16 }}
            >
              <Input 
                placeholder="Enter custom client name"
                disabled={disabled}
                onChange={handleClientOtherChange}
              />
            </Form.Item>
          )}

          {/* Hidden field for non-other clients */}
          {!showClientOther && (
            <Form.Item name={clientFieldName} hidden>
              <Input />
            </Form.Item>
          )}
        </Col>

        {/* Department Selection */}
        <Col xs={24} md={8}>
          <Form.Item
            label={departmentLabel}
            required={departmentRequired}
          >
            <Select
              value={showDepartmentOther ? 'Others' : (selectedDepartment || undefined)}
              onChange={handleDepartmentChange}
              placeholder={
                !selectedClient 
                  ? "Select client first" 
                  : "Select department"
              }
              disabled={disabled || !selectedClient}
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
                placeholder="Enter custom department name"
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

        {/* Location Selection */}
        <Col xs={24} md={8}>
          <Form.Item
            label={locationLabel}
            required={locationRequired}
          >
            <Select
              value={showLocationOther ? 'Others' : (form.getFieldValue(locationFieldName) || undefined)}
              onChange={handleLocationChange}
              placeholder={
                !selectedClient 
                  ? "Select client first" 
                  : !selectedDepartment
                  ? "Select department first"
                  : "Select location"
              }
              disabled={disabled || !selectedClient || !selectedDepartment}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableLocations.map(loc => (
                <Option key={loc} value={loc}>
                  {loc}
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
      </Row>
    </>
  );
}

export default ClientDepartmentLocationSelector;