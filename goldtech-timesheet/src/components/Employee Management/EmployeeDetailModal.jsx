import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Descriptions, 
  Tag, 
  Button, 
  Form, 
  Input, 
  Select, 
  InputNumber,
  Space,
  Avatar,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Option } = Select;

/**
 * EmployeeDetailModal Component
 * 
 * Features:
 * - View mode: Display employee details in read-only format
 * - Edit mode: Allow editing of employee details with form validation
 * - Add mode: Allow adding new employee with form validation (NEW)
 * - Responsive design with proper UX flow
 * - Form validation and error handling
 */
function EmployeeDetailModal({ visible, employee, mode, onCancel, onUpdate }) {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // UPDATED: Set editing state based on mode prop (now includes 'add' mode)
  useEffect(() => {
    setIsEditing(mode === 'edit' || mode === 'add');
  }, [mode]);

  // UPDATED: Initialize form values when employee data changes or when adding new employee
  useEffect(() => {
    if (visible) {
      if (employee && (mode === 'view' || mode === 'edit')) {
        // Existing employee data
        form.setFieldsValue({
          name: employee.name,
          email: employee.email,
          position: employee.position,
          projectSide: employee.projectSide,
          managerName: employee.managerName,
          managerEmail: employee.managerEmail,
          annualLeaveBalance: employee.annualLeaveBalance,
          medicalLeaveBalance: employee.medicalLeaveBalance,
          status: employee.status
        });
      } else if (mode === 'add') {
        // NEW: Clear form and set default values for new employee
        form.resetFields();
        form.setFieldsValue({
          status: 'active',
          annualLeaveBalance: 21, // Default annual leave
          medicalLeaveBalance: 14  // Default medical leave
        });
      }
    }
  }, [employee, visible, form, mode]);

  /**
   * Handle form submission for updates/creation
   */
  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      let updatedEmployee;
      
      if (mode === 'add') {
        // NEW: Creating new employee
        updatedEmployee = {
          ...values
        };
      } else {
        // Existing update logic
        updatedEmployee = {
          ...employee,
          ...values
        };
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate(updatedEmployee);
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * UPDATED: Handle cancel action
   */
  const handleCancel = () => {
    form.resetFields();
    setIsEditing(mode === 'edit' || mode === 'add');
    onCancel();
  };

  /**
   * Toggle edit mode (for view mode only)
   */
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // UPDATED: Allow modal to show even when employee is null (for add mode)
  if (!employee && mode !== 'add') return null;

  // UPDATED: Modal title now handles add mode
  const modalTitle = (
    <Space>
      <Avatar size="large" icon={<UserOutlined />} />
      <div>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {mode === 'add' ? 'Add New Employee' : employee?.name}
        </div>
        {mode !== 'add' && employee && (
          <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
            Employee ID: {employee.id}
          </div>
        )}
      </div>
    </Space>
  );

  // UPDATED: Modal footer now handles add mode
  const modalFooter = isEditing ? (
    <Space>
      <Button 
        icon={<CloseOutlined />} 
        onClick={() => mode === 'edit' || mode === 'add' ? handleCancel() : toggleEditMode()}
      >
        Cancel
      </Button>
      <Button 
        type="primary" 
        icon={<SaveOutlined />} 
        onClick={() => form.submit()}
        loading={loading}
      >
        {mode === 'add' ? 'Add Employee' : 'Update'}
      </Button>
    </Space>
  ) : (
    <Space>
      <Button onClick={handleCancel}>
        Close
      </Button>
      {mode === 'view' && (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={toggleEditMode}
        >
          Edit
        </Button>
      )}
    </Space>
  );

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleCancel}
      footer={modalFooter}
      width={700}
      destroyOnClose
    >
      {!isEditing ? (
        // View Mode - Read-only display (only shows when mode is 'view')
        <div>
          <Descriptions 
            bordered 
            column={2} 
            size="middle"
            labelStyle={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}
          >
            <Descriptions.Item label={<><MailOutlined /> Email</>} span={2}>
              {employee.email}
            </Descriptions.Item>
            
            <Descriptions.Item label="Status">
              <Tag color={employee.status === 'active' ? 'green' : 'red'}>
                {employee.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Position">
              {employee.position}
            </Descriptions.Item>
            
            <Descriptions.Item label="Project Side" span={2}>
              <Tag color="blue">{employee.projectSide}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Manager Name">
              {employee.managerName}
            </Descriptions.Item>
            
            <Descriptions.Item label={<><MailOutlined /> Manager Email</>}>
              {employee.managerEmail}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Leave Balances</Divider>
          
          <Descriptions 
            bordered 
            column={2} 
            size="middle"
            labelStyle={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}
          >
            <Descriptions.Item label={<><CalendarOutlined /> Annual Leave</>}>
              <Tag color="orange">{employee.annualLeaveBalance} days</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label={<><CalendarOutlined /> Medical Leave</>}>
              <Tag color="red">{employee.medicalLeaveBalance} days</Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        // Edit/Add Mode - Editable form (shows for both 'edit' and 'add' modes)
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={mode === 'add' ? {
            status: 'active',
            annualLeaveBalance: 21,
            medicalLeaveBalance: 14
          } : employee}
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter employee name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true, message: 'Please enter position' }]}
          >
            <Input placeholder="Enter position/job title" />
          </Form.Item>

          <Form.Item
            label="Project Side"
            name="projectSide"
            rules={[{ required: true, message: 'Please select project side' }]}
          >
            <Select placeholder="Select project side">
              <Option value="Frontend">Frontend</Option>
              <Option value="Backend">Backend</Option>
              <Option value="Fullstack">Fullstack</Option>
              <Option value="DevOps">DevOps</Option>
              <Option value="QA">QA</Option>
              <Option value="Design">Design</Option>
              <Option value="Management">Management</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Manager Name"
            name="managerName"
            rules={[{ required: true, message: 'Please enter manager name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter manager name" />
          </Form.Item>

          <Form.Item
            label="Manager Email"
            name="managerEmail"
            rules={[
              { required: true, message: 'Please enter manager email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter manager email" />
          </Form.Item>

          <Divider orientation="left">Leave Balances</Divider>

          <Form.Item
            label="Annual Leave Balance (days)"
            name="annualLeaveBalance"
            rules={[
              { required: true, message: 'Please enter annual leave balance' },
              { type: 'number', min: 0, max: 365, message: 'Balance must be between 0 and 365 days' }
            ]}
          >
            <InputNumber 
              min={0} 
              max={365} 
              placeholder="Enter annual leave balance" 
              style={{ width: '100%' }}
              suffix="days"
            />
          </Form.Item>

          <Form.Item
            label="Medical Leave Balance (days)"
            name="medicalLeaveBalance"
            rules={[
              { required: true, message: 'Please enter medical leave balance' },
              { type: 'number', min: 0, max: 365, message: 'Balance must be between 0 and 365 days' }
            ]}
          >
            <InputNumber 
              min={0} 
              max={365} 
              placeholder="Enter medical leave balance" 
              style={{ width: '100%' }}
              suffix="days"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}

export default EmployeeDetailModal;