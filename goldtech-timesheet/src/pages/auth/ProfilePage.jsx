// src/pages/ProfilePage.jsx - FIXED supervisor display
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LockOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../../components/Common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const { Title, Text } = Typography;

function ProfilePage() {
  const { user } = useAuth();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();

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

  const getRoleDisplay = () => {
    if (!user.roles || user.roles.length === 0) {
      return [{ color: 'default', text: 'Employee' }];
    }

    return user.roles.map(role => {
      const roleConfig = {
        employee: { color: 'blue', text: 'Employee' },
        supervisor: { color: 'orange', text: 'Supervisor' },
        admin: { color: 'red', text: 'Administrator' }
      };
      return roleConfig[role.name] || { color: 'default', text: role.description || role.name };
    });
  };

  // FIXED: Get supervisor name with fallbacks
  const getSupervisorName = () => {
    // Try multiple fields for backward compatibility
    return user.supervisorName || user.supervisor_name || 'Not assigned';
  };

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
            <Button 
              type="primary" 
               onClick={() => navigate('/change-password')}
            >
              Change Password
            </Button>
      
        }
      />

      {/* Single Main Profile Card */}
      <Card>
        {/* Profile Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ marginRight: 16 }}>
            </div>
            <div>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {user.fullName || user.name}
              </Title>
              <Space size="middle" wrap>
                <Text strong style={{ color: '#666' }}>
                  {user.position}
                </Text>
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
                <Text strong>{user.employeeId || user.employee_id || 'N/A'}</Text>
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
              <Descriptions.Item label="Location">
                {user.location || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><TeamOutlined />Supervisor</Space>}>
                <Text strong style={{ color: getSupervisorName() === 'Not assigned' ? '#999' : '#262626' }}>
                  {getSupervisorName()}
                </Text>
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

    </div>
  );
}

export default ProfilePage;