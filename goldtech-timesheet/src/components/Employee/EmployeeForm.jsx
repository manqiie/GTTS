// src/components/Employee/EmployeeForm.jsx
import React from 'react';
import { Form, Input, Select, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

function EmployeeForm({ 
  form, 
  initialValues, 
  onFinish, 
  submitButton,
  disabled = false 
}) {
  // Sample data for dropdowns - In real app, these would come from API
  const positionOptions = [
    { label: 'Senior Developer', value: 'Senior Developer' },
    { label: 'Junior Developer', value: 'Junior Developer' },
    { label: 'Project Manager', value: 'Project Manager' },
    { label: 'QA Engineer', value: 'QA Engineer' },
    { label: 'Business Analyst', value: 'Business Analyst' },
    { label: 'UI/UX Designer', value: 'UI/UX Designer' },
    { label: 'DevOps Engineer', value: 'DevOps Engineer' },
    { label: 'Team Lead', value: 'Team Lead' }
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
    { label: 'Finance', value: 'Finance' }
  ];

  const managerOptions = [
    { label: 'Alice Johnson', value: 'Alice Johnson' },
    { label: 'Bob Chen', value: 'Bob Chen' },
    { label: 'Carol Smith', value: 'Carol Smith' },
    { label: 'David Lee', value: 'David Lee' },
    { label: 'Emily Wong', value: 'Emily Wong' }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      disabled={disabled}
    >
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Employee ID"
            name="employeeId"
            rules={[
              { required: true, message: 'Please input employee ID!' },
            ]}
          >
            <Input placeholder="GT001" />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            label="Full Name"
            name="name"
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
              { required: true, message: 'Please input phone number!' },
              { pattern: /^\+65\s\d{4}\s\d{4}$/, message: 'Please use Singapore format: +65 1234 5678' }
            ]}
          >
            <Input placeholder="+65 9123 4567" />
          </Form.Item>
        </Col>
      </Row>

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
            name="projectSite"
            rules={[{ required: true, message: 'Please select project site!' }]}
          >
            <Select
              placeholder="Select project site"
              options={projectSiteOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            label="Manager"
            name="managerName"
            rules={[{ required: true, message: 'Please select manager!' }]}
          >
            <Select
              placeholder="Select manager"
              options={managerOptions}
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
            label="Join Date"
            name="joinDate"
            rules={[{ required: true, message: 'Please select join date!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </Col>
        
        {initialValues && (
          <Col xs={24} md={12}>
            <Form.Item
              label="Status"
              name="status"
            >
              <Select
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' }
                ]}
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Form.Item
        label="Additional Notes"
        name="notes"
      >
        <TextArea 
          rows={4} 
          placeholder="Any additional information about the employee..."
        />
      </Form.Item>

      {submitButton && (
        <Form.Item style={{ marginTop: 24 }}>
          {submitButton}
        </Form.Item>
      )}
    </Form>
  );
}

export default EmployeeForm;