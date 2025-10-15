import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Steps, 
  message, 
  Space,
  Typography,
  Alert
} from 'antd';
import { 
  LockOutlined, 
  MailOutlined, 
  SafetyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import PageHeader from '../../components/Common/PageHeader';

const { Title, Text, Paragraph } = Typography;

function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send verification code
  const handleSendCode = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/password-reset/send-code', {
        userId: user.id
      });

      if (response.success) {
        message.success('Verification code sent to your email!');
        setCurrentStep(1);
        setCountdown(60); // 60 seconds cooldown
      } else {
        message.error(response.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending code:', error);
      message.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await apiService.post('/password-reset/resend-code', {
        userId: user.id
      });

      if (response.success) {
        message.success('Verification code resent!');
        setCountdown(60);
      } else {
        message.error(response.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      message.error('Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify and reset password
  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const response = await apiService.post('/password-reset/verify-and-reset', {
        userId: String(user.id),
        verificationCode: values.verificationCode,
        newPassword: values.newPassword
      });

      if (response.success) {
        message.success('Password changed successfully! Please login again.');
        setCurrentStep(2);
        
        // Auto logout after 2 seconds
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        message.error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Send Code',
      icon: <MailOutlined />
    },
    {
      title: 'Verify & Reset',
      icon: <SafetyOutlined />
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />
    }
  ];

  const breadcrumbs = [
    { title: 'Profile', path: '/profile' },
    { title: 'Change Password' }
  ];

  return (
    <div>
      <PageHeader
        title="Change Password"
        breadcrumbs={breadcrumbs}
        description="Secure your account with a new password"
      />

      <div>
        <Card>
          {/* Centered content wrapper */}
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

            {/* Step 0: Send Verification Code */}
            {currentStep === 0 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <Title level={4}>Verify Your Identity</Title>
                  <Paragraph type="secondary">
                    We'll send a 6-digit verification code to your email address to confirm it's you.
                  </Paragraph>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Text strong>Your Email</Text>
                  <Input
                    value={user.email}
                    prefix={<MailOutlined />}
                    readOnly 
                    style={{
                      marginTop: 8,
                      fontSize: 16,
                      backgroundColor: '#f5f5f5', 
                      cursor: 'not-allowed'
                    }}
                  />
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loading}
                  onClick={handleSendCode}
                >
                  Send Verification Code
                </Button>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button type="link" onClick={() => navigate('/profile')}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Verify Code and Set New Password */}
            {currentStep === 1 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Title level={4}>Enter Verification Code</Title>
                  <Paragraph type="secondary">
                    We've sent a 6-digit code to <strong>{user.email}</strong>
                    <br />
                    The code will expire in 15 minutes.
                  </Paragraph>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleResetPassword}
                >
                  <Form.Item
                    label="Verification Code"
                    name="verificationCode"
                    rules={[
                      { required: true, message: 'Please enter the verification code' },
                      { len: 6, message: 'Code must be exactly 6 digits' },
                      { pattern: /^\d+$/, message: 'Code must contain only numbers' }
                    ]}
                  >
                    <Input
                      prefix={<SafetyOutlined />}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      style={{ letterSpacing: 4, textAlign: 'center' }}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Please enter your new password' },
                      { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Enter new password"
                    />
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
                          return Promise.reject(new Error('Passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Confirm new password"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                      >
                        Reset Password
                      </Button>

                      <Button
                        type="link"
                        block
                        disabled={countdown > 0}
                        onClick={handleResendCode}
                      >
                        {countdown > 0 
                          ? `Resend code in ${countdown}s` 
                          : 'Resend verification code'}
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button type="link" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Success */}
            {currentStep === 2 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#1a69c4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  color: 'white',
                  fontSize: '40px'
                }}>
                  <CheckCircleOutlined />
                </div>
                
                <Title level={3} style={{ color: '#1a69c4ff' }}>
                  Password Changed Successfully!
                </Title>
                
                <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 32 }}>
                  Your password has been updated. You will be redirected to the login page.
                </Paragraph>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ChangePasswordPage;