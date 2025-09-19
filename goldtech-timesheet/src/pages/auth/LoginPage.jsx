// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Alert,
  Space,
  Divider,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(values);
      
      if (result.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    {
      title: 'Employee Account',
      email: 'john.smith@goldtech.com',
      employeeId: 'GT001',
      role: 'Employee',
      description: 'Basic timesheet access'
    },
    {
      title: 'Manager Account',
      email: 'alice.johnson@goldtech.com',
      employeeId: 'GT002',
      role: 'Manager',
      description: 'Timesheet approval access'
    },
    {
      title: 'Admin Account',
      email: 'admin@goldtech.com',
      employeeId: 'ADMIN001',
      role: 'Administrator',
      description: 'Full system access'
    }
  ];

  const fillDemoCredentials = (email) => {
    form.setFieldsValue({
      email: email,
      password: 'demo123'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2C3367 0%, #4f63d2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row gutter={[32, 32]} style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Login Form */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              maxWidth: '450px',
              margin: '0 auto',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title 
                level={2} 
                style={{ 
                  color: '#2C3367', 
                  marginBottom: '8px',
                  fontWeight: 600
                }}
              >
                GOLDTECH RESOURCES
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Timesheet Management System
              </Text>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
                closable
                onClose={() => setError('')}
              />
            )}

            {/* Login Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
            >
              <Form.Item
                label="Email or Employee ID"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email or employee ID' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="john.smith@goldtech.com or GT001"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '12px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<LoginOutlined />}
                  block
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 500,
                    background: '#4f63d2',
                    borderColor: '#4f63d2'
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            {/* Help Text */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                For demo purposes, use any of the accounts below with password: <strong>demo123</strong>
              </Text>
            </div>
          </Card>
        </Col>

        {/* Demo Accounts Info */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ color: '#2C3367', marginBottom: '8px' }}>
                <InfoCircleOutlined /> Demo Accounts
              </Title>
              <Text type="secondary">
                Click on any account below to auto-fill the login form
              </Text>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {demoCredentials.map((cred, index) => (
                <Card
                  key={index}
                  size="small"
                  hoverable
                  onClick={() => fillDemoCredentials(cred.email)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid #f0f0f0'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <Text strong style={{ color: '#2C3367' }}>
                        {cred.title}
                      </Text>
                      <Text 
                        style={{ 
                          fontSize: '12px', 
                          padding: '2px 8px',
                          background: '#f0f8ff',
                          borderRadius: '10px',
                          color: '#1890ff'
                        }}
                      >
                        {cred.role}
                      </Text>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <Text style={{ fontSize: '13px' }}>
                        <strong>Email:</strong> {cred.email}
                      </Text>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <Text style={{ fontSize: '13px' }}>
                        <strong>ID:</strong> {cred.employeeId}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {cred.description}
                    </Text>
                  </div>
                </Card>
              ))}
            </Space>

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Paragraph style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                <strong>Default Password:</strong> demo123<br />
                This is a demonstration system with mock authentication.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default LoginPage;