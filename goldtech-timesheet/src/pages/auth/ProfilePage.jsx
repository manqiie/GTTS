// src/pages/ProfilePage.jsx - Updated to use real API data
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
  Divider,
  Spin
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
  LockOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../../components/Common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const { Title, Text } = Typography;

function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading profile...</Text>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    form.setFieldsValue({
      fullName: user.fullName || user.name,
      email: user.email,
      phone: user.phone,
      position: user.position,
      department: user.department
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (values) => {
    setUpdateLoading(true);
    try {
      // Create update object with only the fields that can be updated
      const updateData = {
        fullName: values.fullName,
        phone: values.phone
        // Note: position, department, email typically can't be updated by user
        // These would require admin privileges
      };

      const result = await updateProfile(updateData);
      
      if (result.success) {
        message.success('Profile updated successfully');
        setEditModalVisible(false);
        await refreshUser(); // Refresh user data from server
      } else {
        message.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setPasswordLoading(true);
    try {
      // Call password change API
      const response = await apiService.patch(`/users/${user.id}/reset-password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      if (response.success) {
        message.success('Password changed successfully');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        message.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      message.error('Failed to change password: ' + error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRoleDisplay = () => {
    if (!user.roles || user.roles.length === 0) {
      return [{ color: 'default', text: 'Employee' }];
    }

    return user.roles.map(role => {
      const roleConfig = {
        employee: { color: 'blue', text: 'Employee' },
        manager: { color: 'orange', text: 'Manager' },
        admin: { color: 'red', text: 'Administrator' }
      };
      return roleConfig[role.name] || { color: 'default', text: role.description || role.name };
    });
  };

  const getStatusColor = (status) => {
    if (typeof status === 'string') {
      return status.toLowerCase() === 'active' ? 'green' : 'red';
    }
    return status === 'ACTIVE' ? 'green' : 'red';
  };

  const getStatusText = (status) => {
    if (typeof status === 'string') {
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  };

  const roleDisplays = getRoleDisplay();

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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ marginRight: 16 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f63d2, #b39f65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {user.fullName || user.name}
              </Title>
              <Space size="middle" wrap>
                <Text strong style={{ color: '#666' }}>
                  {user.position}
                </Text>
                {roleDisplays.map((roleDisplay, index) => (
                  <Tag key={index} color={roleDisplay.color}>
                    {roleDisplay.text}
                  </Tag>
                ))}
                <Tag color={getStatusColor(user.status)}>
                  {getStatusText(user.status)}
                </Tag>
              </Space>
            </div>
          </div>
        </div>

        <Divider />

        {/* All Information in One Card */}
        <Row gutter={[48, 24]}>
          {/* Personal Information Column */}
          <Col xs={24} lg={12}>
            <Title level={4} style={{ marginBottom: 20, color: '#1890ff' }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Personal Information
            </Title>
            
            <Descriptions column={1} size="middle" labelStyle={{ fontWeight: 'bold', width: '140px' }}>
              <Descriptions.Item label="Employee ID">
                <Text strong>{user.employeeId || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                {user.fullName || user.name}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><MailOutlined />Email</Space>}>
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><PhoneOutlined />Phone</Space>}>
                {user.phone || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><CalendarOutlined />Join Date</Space>}>
                {user.joinDate ? dayjs(user.joinDate).format('MMMM DD, YYYY') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {/* Work Information Column */}
          <Col xs={24} lg={12}>
            <Title level={4} style={{ marginBottom: 20, color: '#52c41a' }}>
              <BankOutlined style={{ marginRight: 8 }} />
              Work Information
            </Title>
            
            <Descriptions column={1} size="middle" labelStyle={{ fontWeight: 'bold', width: '140px' }}>
              <Descriptions.Item label="Position">
                {user.position || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {user.department || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Project Site">
                {user.projectSite || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><TeamOutlined />Supervisor</Space>}>
                {user.managerName || 'Not assigned'}
              </Descriptions.Item>
            
            </Descriptions>
          </Col>
        </Row>

        {user.lastLoginAt && (
          <>
            <Divider />
            <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
              Last login: {dayjs(user.lastLoginAt).format('MMMM DD, YYYY HH:mm')}
            </div>
          </>
        )}
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
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<KeyOutlined />}
                loading={passwordLoading}
              >
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