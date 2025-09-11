// src/pages/ProfilePage.jsx - Simplified without work info card and avatar
import React, { useState } from 'react';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Typography, 
  Tag,
  message,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  EditOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BankOutlined,
  TeamOutlined,
  CalendarOutlined,
  SaveOutlined,
  KeyOutlined,
  LockOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../components/Common/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Please log in to view your profile.</Text>
      </div>
    );
  }

  const handleEditProfile = () => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      position: user.position,
      department: user.department
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      updateProfile(values);
      message.success('Profile updated successfully');
      setEditModalVisible(false);
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (values) => {
    try {
      // In real implementation, this would call the backend API
      // await changePassword(values);
      
      message.success('Password changed successfully');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    }
  };

  const getRoleDisplay = (role) => {
    const roleConfig = {
      employee: { color: 'blue', text: 'Employee' },
      manager: { color: 'orange', text: 'Manager' },
      admin: { color: 'red', text: 'Administrator' }
    };
    return roleConfig[role] || { color: 'default', text: role };
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'red';
  };

  const roleDisplay = getRoleDisplay(user.role);

  const breadcrumbs = [
    { title: 'My Profile' }
  ];

  return (
    <div>
      <PageHeader
        title="My Profile"
        breadcrumbs={breadcrumbs}
        description="View and manage your personal information"
        extra={
          <Space>
            <Button 
              icon={<KeyOutlined />}
              onClick={() => setPasswordModalVisible(true)}
            >
              Change Password
            </Button>
          
          </Space>
        }
      />

      {/* Single Main Profile Card */}
      <Card>
        {/* Profile Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
            {user.name}
          </Title>
          <Space size="middle">
            <Text strong style={{ color: '#666' }}>
              {user.position}
            </Text>
            <Tag color={roleDisplay.color}>
              {roleDisplay.text}
            </Tag>
            <Tag color={getStatusColor(user.status)}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Tag>
          </Space>
        </div>

        <Divider />

        {/* All Information in One Card */}
        <Row gutter={[48, 24]}>
          {/* Personal Information Column */}
          <Col xs={24} lg={12}>
            <Title level={4} style={{ marginBottom: 20, color: '#1890ff' }}>
              Personal Information
            </Title>
            
            <Descriptions column={1} size="middle" labelStyle={{ fontWeight: 'bold', width: '140px' }}>
              <Descriptions.Item label="Employee ID">
                <Text strong>{user.employeeId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                {user.name}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><MailOutlined />Email</Space>}>
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><PhoneOutlined />Phone</Space>}>
                {user.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><CalendarOutlined />Join Date</Space>}>
                {dayjs(user.joinDate).format('MMMM DD, YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {/* Work Information Column */}
          <Col xs={24} lg={12}>
            <Title level={4} style={{ marginBottom: 20, color: '#52c41a' }}>
              Work Information
            </Title>
            
            <Descriptions column={1} size="middle" labelStyle={{ fontWeight: 'bold', width: '140px' }}>
              <Descriptions.Item label="Position">
                {user.position}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><BankOutlined />Department</Space>}>
                {user.department}
              </Descriptions.Item>
              <Descriptions.Item label="Project Site">
                {user.projectSite}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><TeamOutlined />Manager</Space>}>
                {user.managerName}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color={roleDisplay.color}>
                  {roleDisplay.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

    
      </Card>


      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => {
                setPasswordModalVisible(false);
                passwordForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<KeyOutlined />}>
                Change Password
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default ProfilePage;