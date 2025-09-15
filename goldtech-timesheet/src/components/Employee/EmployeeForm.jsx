// EmployeeForm.jsx 
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Card, Typography } from 'antd';
import dayjs from 'dayjs';

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

  // Load roles and managers on component mount
  useEffect(() => {
    loadRoles();
    loadManagers();
  }, []);

  const loadRoles = () => {
    // In real implementation, this would be an API call
    // For now, using static data based on your database structure
    const roles = [
      { id: 1, name: 'admin', description: 'Administrator' },
      { id: 2, name: 'manager', description: 'Manager' },
      { id: 3, name: 'employee', description: 'Employee' }
    ];
    setAvailableRoles(roles);
  };

  const loadManagers = () => {
    // In real implementation, this would fetch users with manager role
    // For now, using mock data
    const managers = [
      { id: 1, full_name: 'Alice Johnson', employee_id: 'MGR001' },
      { id: 2, full_name: 'Bob Chen', employee_id: 'MGR002' },
      { id: 3, full_name: 'Carol Smith', employee_id: 'MGR003' },
      { id: 4, full_name: 'David Lee', employee_id: 'MGR004' },
      { id: 5, full_name: 'Emily Wong', employee_id: 'MGR005' }
    ];
    setAvailableManagers(managers);
  };

  // Sample data for dropdowns
  const positionOptions = [
    { label: 'Senior Developer', value: 'Senior Developer' },
    { label: 'Junior Developer', value: 'Junior Developer' },
    { label: 'Project Manager', value: 'Project Manager' },
    { label: 'QA Engineer', value: 'QA Engineer' },
    { label: 'Business Analyst', value: 'Business Analyst' },
    { label: 'UI/UX Designer', value: 'UI/UX Designer' },
    { label: 'DevOps Engineer', value: 'DevOps Engineer' },
    { label: 'Team Lead', value: 'Team Lead' },
    { label: 'System Administrator', value: 'System Administrator' }
  ];

  const projectSiteOptions = [
    { label: 'Marina Bay Project', value: 'Marina Bay Project' },
    { label: 'Orchard Road Development', value: 'Orchard Road Development' },
    { label: 'Sentosa Resort', value: 'Sentosa Resort' },
    { label: 'Changi Airport Expansion', value: 'Changi Airport Expansion' },
    { label: 'CBD Tower Complex', value: 'CBD Tower Complex' },
    { label: 'Punggol Smart City', value: 'Punggol Smart City' }
  ];

  const departmentOptions = [
    { label: 'Development', value: 'Development' },
    { label: 'Project Management', value: 'Project Management' },
    { label: 'Quality Assurance', value: 'Quality Assurance' },
    { label: 'Business Analysis', value: 'Business Analysis' },
    { label: 'Design', value: 'Design' },
    { label: 'DevOps', value: 'DevOps' },
    { label: 'Human Resources', value: 'Human Resources' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Administration', value: 'Administration' }
  ];

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
              rules={[{ required: true, message: 'Please select position!' }]}
            >
              <Select
                placeholder="Select position"
                options={positionOptions}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: 'Please select department!' }]}
            >
              <Select
                placeholder="Select department"
                options={departmentOptions}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Project Site"
              name="project_site"
            >
              <Select
                placeholder="Select project site (optional)"
                options={projectSiteOptions}
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
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
              name="manager_id"
              help="Select the direct manager for this user"
            >
              <Select
                placeholder="Select manager (optional)"
                options={availableManagers.map(manager => ({
                  label: `${manager.full_name} (${manager.employee_id})`,
                  value: manager.id
                }))}
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
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