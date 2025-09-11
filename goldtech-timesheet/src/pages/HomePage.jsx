// src/pages/HomePage.jsx - Simple empty homepage
import React from 'react';
import { 
  Card, 
  Typography, 
  Space,
  Avatar
} from 'antd';
import { 
  UserOutlined
} from '@ant-design/icons';
import PageHeader from '../components/Common/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

function HomePage() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const breadcrumbs = [
    { title: 'Dashboard' }
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        breadcrumbs={breadcrumbs}
        description={`${getGreeting()}, ${user?.name.split(' ')[0]}! Welcome to GOLDTECH RESOURCES.`}
      />

      {/* Simple Welcome Card */}
      <Card>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: '#4f63d2',
              marginBottom: 24
            }}
          />
          
          <Title level={2} style={{ margin: 0, marginBottom: 16, color: '#2C3367' }}>
            {getGreeting()}, {user?.name}!
          </Title>
          
          <Space direction="vertical" align="center" size="small">
            <Text style={{ fontSize: '18px', color: '#666' }}>
              {user?.position}
            </Text>
            <Text style={{ fontSize: '16px', color: '#999' }}>
              {user?.department} • {user?.projectSite}
            </Text>
          </Space>

          <div style={{ marginTop: 40, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Text style={{ fontSize: '16px', color: '#666' }}>
              Welcome to GOLDTECH RESOURCES Timesheet Management System
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default HomePage;