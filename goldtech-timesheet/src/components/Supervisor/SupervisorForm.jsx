// SupervisorForm.jsx - Form for creating/editing supervisors
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Row, Col, Card, Typography, message } from 'antd';
import apiService from '../../services/apiService';
import ClientDepartmentLocationSelector from '../Employee/ClientDepartmentLocationSelector';

const { Title } = Typography;

function SupervisorForm({ 
  form, 
  initialValues, 
  onFinish, 
  submitButton,
  disabled = false,
  isEdit = false
}) {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await apiService.getRoles();
      if (response.success && response.data) {
        // Filter to only show supervisor and employee roles
        const filteredRoles = response.data.filter(role => 
          role.name === 'supervisor' || role.name === 'employee'
        );
        setAvailableRoles(filteredRoles);
      } else {
        console.error('Failed to load roles:', response.message);
        setAvailableRoles([
          { id: 2, name: 'supervisor', description: 'Supervisor' },
          { id: 3, name: 'employee', description: 'Employee' }
        ]);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setAvailableRoles([
        { id: 2, name: 'supervisor', description: 'Supervisor' },
        { id: 3, name: 'employee', description: 'Employee' }
      ]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleFormFinish = (values) => {
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
              label="Full Name"
              name="full_name"
              rules={[
                { required: true, message: 'Please input full name!' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="Alice Johnson" />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please input valid email!' }
              ]}
            >
              <Input placeholder="alice.johnson@goldtech.com" />
            </Form.Item>
          </Col>
        </Row>

        {/* Password fields - only shown when creating new supervisor */}
        {!isEdit && (
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
              help="Supervisors must have the Supervisor role. They can also have Employee role."
              initialValue={[2]} // Default to supervisor 
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
        <Title level={5} style={{ marginBottom: 16 }}>Work Assignment (Optional)</Title>
        
        {/* Client, Department, Location Hierarchical Selector */}
        <ClientDepartmentLocationSelector
          form={form}
          initialClient={initialValues?.client}
          initialDepartment={initialValues?.department}
          initialLocation={initialValues?.location}
          disabled={disabled}
          clientRequired={false}
          departmentRequired={false}
          locationRequired={false}
        />

        {/* Status - only shown when editing */}
        {isEdit && (
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

      {/* Submit Button */}
      {submitButton && (
        <Form.Item style={{ marginTop: 24 }}>
          {submitButton}
        </Form.Item>
      )}
    </Form>
  );
}

export default SupervisorForm;