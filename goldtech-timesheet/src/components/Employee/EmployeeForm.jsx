// EmployeeForm.jsx - UPDATED with ClientDepartmentLocationSelector
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

  useEffect(() => {
    loadRoles();
    loadSupervisors();
  }, []);

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
        // UPDATED: Filter out supervisor role - only show admin and employee
        const filteredRoles = response.data.filter(role => 
          role.name === 'admin' || role.name === 'employee'
        );
        setAvailableRoles(filteredRoles);
      } else {
        console.error('Failed to load roles:', response.message);
        setAvailableRoles([
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 3, name: 'employee', description: 'Employee' }
        ]);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setAvailableRoles([
        { id: 1, name: 'admin', description: 'Administrator' },
        { id: 3, name: 'employee', description: 'Employee' }
      ]);
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

  const handleFormFinish = (values) => {
    if (!values.supervisor_id && supervisorSearchValue && supervisorSearchValue.trim()) {
      const supervisor = availableSupervisors.find(s => 
        `${s.full_name} (${s.employee_id || 'No ID'})` === supervisorSearchValue
      );
      if (supervisor) {
        values.supervisor_id = supervisor.id;
      }
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
              rules={[
                { required: true, message: 'Please input employee ID!' }
              ]}
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
              help="Select Admin or Employee role. Users can have multiple roles."
            >
              <Select
                mode="multiple"
                placeholder="Select user roles"
                loading={loadingRoles}
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
              label="Join Date (Optional)"
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

        {/* Supervisor Selection - UPDATED: Required */}
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Supervisor"
              name="supervisor_id"
              rules={[
                { required: true, message: 'Please select a supervisor!' }
              ]}
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
            
            {/* Hidden field to store actual supervisor_id */}
            <Form.Item name="supervisor_id" hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>
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