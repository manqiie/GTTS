// EmployeeForm.jsx - Updated with real API integration
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Card, Typography, AutoComplete } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

const { TextArea } = Input;
const { Title } = Typography;

function EmployeeForm({ 
  form, 
  initialValues, 
  onFinish, 
  submitButton,
  disabled = false 
}) {
  const [availableManagers, setAvailableManagers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [managerSearchValue, setManagerSearchValue] = useState('');
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Load roles and managers on component mount
  useEffect(() => {
    loadRoles();
    loadManagers();
  }, []);

  // Update manager options when search value changes
  useEffect(() => {
    filterManagerOptions(managerSearchValue);
  }, [managerSearchValue, availableManagers]);

  // Set initial manager search value when editing
  useEffect(() => {
    if (initialValues && initialValues.manager_id) {
      const manager = availableManagers.find(m => m.id === initialValues.manager_id);
      if (manager) {
        setManagerSearchValue(`${manager.full_name} (${manager.employee_id || 'No ID'})`);
      }
    }
  }, [initialValues, availableManagers]);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await apiService.getRoles();
      if (response.success && response.data) {
        setAvailableRoles(response.data);
      } else {
        console.error('Failed to load roles:', response.message);
        // Fallback to default roles
        setAvailableRoles([
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 2, name: 'manager', description: 'Manager' },
          { id: 3, name: 'employee', description: 'Employee' }
        ]);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      // Fallback to default roles
      setAvailableRoles([
        { id: 1, name: 'admin', description: 'Administrator' },
        { id: 2, name: 'manager', description: 'Manager' },
        { id: 3, name: 'employee', description: 'Employee' }
      ]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadManagers = async () => {
    setLoadingManagers(true);
    try {
      const response = await apiService.getManagers();
      if (response.success && response.data) {
        // Transform backend data to expected format
        const managers = response.data.map(manager => ({
          id: manager.id,
          full_name: manager.fullName || manager.full_name,
          employee_id: manager.employeeId || manager.employee_id
        }));
        setAvailableManagers(managers);
      } else {
        console.error('Failed to load managers:', response.message);
        setAvailableManagers([]);
      }
    } catch (error) {
      console.error('Error loading managers:', error);
      setAvailableManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const filterManagerOptions = (searchText) => {
    if (!searchText) {
      setManagerOptions([]);
      return;
    }

    const filtered = availableManagers.filter(manager => {
      const fullName = manager.full_name.toLowerCase();
      const employeeId = (manager.employee_id || '').toLowerCase();
      const search = searchText.toLowerCase();
      
      return fullName.includes(search) || employeeId.includes(search);
    });

    if (filtered.length === 0) {
      setManagerOptions([
        { 
          value: '', 
          label: <span style={{ color: '#ff4d4f' }}>Manager doesn't exist</span>,
          disabled: true 
        }
      ]);
    } else {
      setManagerOptions(filtered.map(manager => ({
        value: `${manager.full_name} (${manager.employee_id || 'No ID'})`,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 500 }}>{manager.full_name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                ID: {manager.employee_id || 'No Employee ID'}
              </div>
            </div>
          </div>
        ),
        managerId: manager.id
      })));
    }
  };

  const handleManagerSelect = (value, option) => {
    if (option && option.managerId) {
      form.setFieldValue('manager_id', option.managerId);
      setManagerSearchValue(value);
    }
  };

  const handleManagerSearch = (value) => {
    setManagerSearchValue(value);
    
    // Clear manager_id if the search doesn't match any existing manager
    const matchedManager = availableManagers.find(manager => 
      `${manager.full_name} (${manager.employee_id || 'No ID'})` === value
    );
    
    if (!matchedManager) {
      form.setFieldValue('manager_id', null);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      disabled={disabled}
    >
      {/* Basic Information */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>Basic Information</Title>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Employee ID"
              name="employee_id"
              help="Leave empty for managers/admins if they don't need employee ID"
            >
              <Input placeholder="GT001 (optional for managers)" />
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
      </Card>

      {/* Role Assignment */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>Role Assignment</Title>
        
        <Row gutter={24}>
          <Col xs={24}>
            <Form.Item
              label="User Roles"
              name="roles"
              rules={[{ required: true, message: 'Please select at least one role!' }]}
              help="Users can have multiple roles. Select all applicable roles."
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

      {/* Work Information */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>Work Information</Title>
        
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Position"
              name="position"
              rules={[{ required: true, message: 'Please input position!' }]}
            >
              <Input placeholder="e.g. Senior Developer, Project Manager, QA Engineer" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: 'Please input department!' }]}
            >
              <Input placeholder="e.g. Development, Project Management, Quality Assurance" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Project Site"
              name="project_site"
            >
              <Input placeholder="e.g. Marina Bay Project, Orchard Road Development" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              label="Company"
              name="company"
              help="For client managers or external users"
            >
              <Input placeholder="Company name (if applicable)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Manager"
              name="manager_search"
              help="Type to search for manager by name or ID"
            >
              <AutoComplete
                value={managerSearchValue}
                options={managerOptions}
                onSelect={handleManagerSelect}
                onSearch={handleManagerSearch}
                placeholder="Type manager name to search..."
                allowClear
                loading={loadingManagers}
                notFoundContent={
                  loadingManagers ? 'Loading...' :
                  managerSearchValue ? 
                  <span style={{ color: '#ff4d4f' }}>Manager doesn't exist</span> : 
                  <span style={{ color: '#999' }}>Start typing to search managers</span>
                }
              />
            </Form.Item>
            
            {/* Hidden field to store actual manager_id */}
            <Form.Item name="manager_id" hidden>
              <Input type="hidden" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              label="Join Date"
              name="join_date"
              rules={[{ required: true, message: 'Please select join date!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        {initialValues && (
          <Row gutter={24}>
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
          </Row>
        )}
      </Card>

      {submitButton && (
        <Form.Item style={{ marginTop: 24 }}>
          {submitButton}
        </Form.Item>
      )}
    </Form>
  );
}

export default EmployeeForm;