// EmployeeForm.jsx - UPDATED: Default role to employee and hide supervisor for admin
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Card, Typography, AutoComplete, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';
import ClientDepartmentLocationSelector from './ClientDepartmentLocationSelector';

const { Title } = Typography;

function EmployeeForm({ 
  form, 
  initialValues, 
  onFinish, 
  submitButton,
  disabled = false 
}) {
  const [availableSupervisors, setAvailableSupervisors] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [supervisorOptions, setSupervisorOptions] = useState([]);
  const [supervisorSearchValue, setSupervisorSearchValue] = useState('');
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Check if this is edit mode (has initialValues)
  const isEditMode = !!initialValues;

  // Check if admin role is selected
  const isAdminSelected = selectedRoles.some(roleId => {
    const role = availableRoles.find(r => r.id === roleId);
    return role && role.name === 'admin';
  });

  useEffect(() => {
    loadRoles();
    loadSupervisors();
  }, []);

  // Set default role to employee when roles are loaded (only for create mode)
  useEffect(() => {
    if (!isEditMode && availableRoles.length > 0 && !form.getFieldValue('roles')) {
      const employeeRole = availableRoles.find(role => role.name === 'employee');
      if (employeeRole) {
        form.setFieldValue('roles', [employeeRole.id]);
        setSelectedRoles([employeeRole.id]);
      }
    }
  }, [availableRoles, isEditMode, form]);

  // Track initial roles in edit mode
  useEffect(() => {
    if (isEditMode && initialValues?.roles) {
      setSelectedRoles(initialValues.roles);
    }
  }, [isEditMode, initialValues]);

  useEffect(() => {
    filterSupervisorOptions(supervisorSearchValue);
  }, [supervisorSearchValue, availableSupervisors]);

  useEffect(() => {
    if (initialValues && availableSupervisors.length > 0) {
      const supervisorId = initialValues.supervisor_id;
      
      if (supervisorId) {
        const supervisor = availableSupervisors.find(s => s.id === supervisorId);
        
        if (supervisor) {
          const displayValue = `${supervisor.full_name} (${supervisor.employee_id || 'No ID'})`;
          setSupervisorSearchValue(displayValue);
          
          setTimeout(() => {
            form.setFieldValue('supervisor_id', supervisor.id);
          }, 100);
        }
      } else {
        setSupervisorSearchValue('');
        form.setFieldValue('supervisor_id', null);
      }
    }
  }, [initialValues, availableSupervisors, form]);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await apiService.getRoles();
      if (response.success && response.data) {
        // UPDATED: Filter roles based on mode
        let filteredRoles;
        if (isEditMode) {
          // In edit mode, show all roles including supervisor
          filteredRoles = response.data;
        } else {
          // In create mode, only show admin and employee roles
          filteredRoles = response.data.filter(role => 
            role.name === 'admin' || role.name === 'employee'
          );
        }
        setAvailableRoles(filteredRoles);
      } else {
        console.error('Failed to load roles:', response.message);
        // Fallback roles based on mode
        if (isEditMode) {
          setAvailableRoles([
            { id: 1, name: 'admin', description: 'Administrator' },
            { id: 2, name: 'supervisor', description: 'Supervisor' },
            { id: 3, name: 'employee', description: 'Employee' }
          ]);
        } else {
          setAvailableRoles([
            { id: 1, name: 'admin', description: 'Administrator' },
            { id: 3, name: 'employee', description: 'Employee' }
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      // Fallback roles based on mode
      if (isEditMode) {
        setAvailableRoles([
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 2, name: 'supervisor', description: 'Supervisor' },
          { id: 3, name: 'employee', description: 'Employee' }
        ]);
      } else {
        setAvailableRoles([
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 3, name: 'employee', description: 'Employee' }
        ]);
      }
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadSupervisors = async () => {
    setLoadingSupervisors(true);
    try {
      const response = await apiService.getSupervisors();
      if (response.success && response.data) {
        const supervisors = response.data.map(supervisor => ({
          id: supervisor.id,
          full_name: supervisor.fullName || supervisor.full_name,
          employee_id: supervisor.employeeId || supervisor.employee_id
        }));
        setAvailableSupervisors(supervisors);
      } else {
        console.error('Failed to load supervisors:', response.message);
        setAvailableSupervisors([]);
      }
    } catch (error) {
      console.error('Error loading supervisors:', error);
      setAvailableSupervisors([]);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const filterSupervisorOptions = (searchText) => {
    if (!searchText) {
      setSupervisorOptions([]);
      return;
    }

    const filtered = availableSupervisors.filter(supervisor => {
      const fullName = supervisor.full_name.toLowerCase();
      const employeeId = (supervisor.employee_id || '').toLowerCase();
      const search = searchText.toLowerCase();
      
      return fullName.includes(search) || employeeId.includes(search);
    });

    if (filtered.length === 0) {
      setSupervisorOptions([
        { 
          value: '', 
          label: <span style={{ color: '#ff4d4f' }}>Supervisor doesn't exist</span>,
          disabled: true 
        }
      ]);
    } else {
      setSupervisorOptions(filtered.map(supervisor => ({
        value: `${supervisor.full_name} (${supervisor.employee_id || 'No ID'})`,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 500 }}>{supervisor.full_name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                ID: {supervisor.employee_id || 'No Employee ID'}
              </div>
            </div>
          </div>
        ),
        supervisorId: supervisor.id
      })));
    }
  };

  const handleSupervisorSelect = (value, option) => {
    if (option && option.supervisorId) {
      form.setFieldValue('supervisor_id', option.supervisorId);
      setSupervisorSearchValue(value);
      
      const supervisor = availableSupervisors.find(s => s.id === option.supervisorId);
      if (supervisor) {
        message.success(`Selected supervisor: ${supervisor.full_name}`);
      }
    }
  };

  const handleSupervisorSearch = (value) => {
    setSupervisorSearchValue(value);
    
    if (value === '') {
      form.setFieldValue('supervisor_id', null);
      return;
    }
    
    const matchedSupervisor = availableSupervisors.find(supervisor => 
      `${supervisor.full_name} (${supervisor.employee_id || 'No ID'})` === value
    );
    
    if (matchedSupervisor) {
      form.setFieldValue('supervisor_id', matchedSupervisor.id);
    }
  };

  const handleSupervisorClear = () => {
    setSupervisorSearchValue('');
    form.setFieldValue('supervisor_id', null);
    message.info('Supervisor cleared');
  };

  const handleRoleChange = (values) => {
    setSelectedRoles(values);
    
    // If admin is selected, clear supervisor field
    const hasAdmin = values.some(roleId => {
      const role = availableRoles.find(r => r.id === roleId);
      return role && role.name === 'admin';
    });
    
    if (hasAdmin) {
      setSupervisorSearchValue('');
      form.setFieldValue('supervisor_id', null);
    }
  };

  const handleFormFinish = (values) => {
    // Skip supervisor validation if admin role is selected
    if (!isAdminSelected) {
      if (!values.supervisor_id && supervisorSearchValue && supervisorSearchValue.trim()) {
        const supervisor = availableSupervisors.find(s => 
          `${s.full_name} (${s.employee_id || 'No ID'})` === supervisorSearchValue
        );
        if (supervisor) {
          values.supervisor_id = supervisor.id;
        }
      }
    } else {
      // Clear supervisor_id for admin users
      values.supervisor_id = null;
    }
    
    onFinish(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      initialValues={initialValues}
      disabled={disabled}
    >
      {/* BASIC INFORMATION CARD */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>Basic Information</Title>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Employee ID"
              name="employee_id"
            >
              <Input placeholder="GT001" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              label="Full Name"
              name="full_name"
              rules={[
                { required: true, message: 'Please input full name!' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="John Smith" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please input valid email!' }
              ]}
            >
              <Input placeholder="john.smith@goldtech.com" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                { pattern: /^\+65\s\d{4}\s\d{4}$/, message: 'Please use Singapore format: +65 1234 5678' }
              ]}
            >
              <Input placeholder="+65 9123 4567" />
            </Form.Item>
          </Col>
        </Row>

        {/* Password fields - only shown when creating new user */}
        {!initialValues && (
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input password!' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={24}>
          <Col xs={24} md={24}>
            <Form.Item
              label="User Roles"
              name="roles"
              rules={[{ required: true, message: 'Please select at least one role!' }]}
              help={
                isEditMode 
                  ? "Select user roles. Available roles: Admin, Supervisor, and Employee. Users can have multiple roles."
                  : "Select Admin or Employee role. Users can have multiple roles. Note: Supervisor role can only be assigned when editing existing users."
              }
            >
              <Select
                mode="multiple"
                placeholder="Select user roles"
                loading={loadingRoles}
                onChange={handleRoleChange}
                options={availableRoles.map(role => ({
                  label: `${role.description} (${role.name})`,
                  value: role.id
                }))}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* WORK INFORMATION CARD */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>Work Information</Title>
        
        {/* Client, Department, Location Hierarchical Selector */}
        <ClientDepartmentLocationSelector
          form={form}
          initialClient={initialValues?.client}
          initialDepartment={initialValues?.department}
          initialLocation={initialValues?.location}
          disabled={disabled}
          clientRequired={false}
          departmentRequired={true}
          locationRequired={false}
        />

        <Row gutter={24}>
          {/* Position */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Position"
              name="position"
              rules={[{ required: true, message: 'Please input position!' }]}
            >
              <Input placeholder="e.g. Senior Developer, QA Engineer" />
            </Form.Item>
          </Col>
          
          {/* Join Date - UPDATED: Not compulsory */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Join Date "
              name="join_date"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>

          {/* Status - only shown when editing */}
          {initialValues && (
            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="status"
              >
                <Select
                  options={[
                    { label: 'Active', value: 'ACTIVE' },
                    { label: 'Inactive', value: 'INACTIVE' }
                  ]}
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* Supervisor Selection - Hidden when admin role is selected */}
        {!isAdminSelected && (
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Supervisor"
                required={true}
              >
                <AutoComplete
                  value={supervisorSearchValue}
                  options={supervisorOptions}
                  onSelect={handleSupervisorSelect}
                  onSearch={handleSupervisorSearch}
                  onClear={handleSupervisorClear}
                  placeholder="Type supervisor name to search..."
                  allowClear
                  loading={loadingSupervisors}
                  notFoundContent={
                    loadingSupervisors ? 'Loading...' :
                    supervisorSearchValue ? 
                    <span style={{ color: '#ff4d4f' }}>Supervisor doesn't exist</span> : 
                    <span style={{ color: '#999' }}>Start typing to search supervisors</span>
                  }
                  style={{ width: '100%' }}
                />
              </Form.Item>

              {/* Hidden field to store actual supervisor_id - this is what gets submitted */}
              <Form.Item 
                name="supervisor_id" 
                hidden
                rules={[
                  { 
                    required: !isAdminSelected, 
                    message: 'Please select a supervisor!' 
                  }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Card>

      {/* Submit Button */}
      {submitButton && (
        <Form.Item style={{ marginTop: 24 }}>
          {submitButton}
        </Form.Item>
      )}
    </Form>
  );
}

export default EmployeeForm;