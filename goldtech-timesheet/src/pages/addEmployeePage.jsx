import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Button, 
  Space, 
  Divider, 
  message,
  Row,
  Col,
  Typography,
  Avatar,
  Steps
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  BriefcaseOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // If you're using React Router

const { Option } = Select;
const { Title, Text } = Typography;

/**
 * AddEmployeePage - Dedicated page for adding new employees
 * 
 * Features:
 * - Multi-step form with validation
 * - Clean, focused interface for employee creation
 * - Form validation and error handling
 * - Success feedback and navigation
 * - Responsive design
 * - Auto-generated employee ID preview
 */
function AddEmployeePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [employeeId, setEmployeeId] = useState('');
  const navigate = useNavigate(); // Remove this line if not using React Router

  // Generate employee ID when component mounts
  React.useEffect(() => {
    // In a real app, this would come from your backend/API
    const generateEmployeeId = () => {
      const timestamp = Date.now().toString().slice(-4);
      const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      return `EMP${timestamp}${randomNum}`;
    };
    
    setEmployeeId(generateEmployeeId());
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const newEmployee = {
        ...values,
        id: employeeId,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('New Employee Created:', newEmployee);
      
      // Show success message
      message.success({
        content: 'Employee added successfully!',
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });

      // Reset form
      form.resetFields();
      setCurrentStep(0);
      
      // Navigate back to employee list (remove if not using React Router)
      // navigate('/employee-management');
      
    } catch (error) {
      console.error('Failed to create employee:', error);
      message.error('Failed to add employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle back navigation
   */
  const handleGoBack = () => {
    // If using React Router
    // navigate('/employee-management');
    
    // If not using React Router, you can emit a custom event or call a callback
    window.history.back();
  };

  /**
   * Form validation steps
   */
  const validateCurrentStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    try {
      await form.validateFields(fieldsToValidate);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * Get fields for current step
   */
  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['name', 'email', 'status'];
      case 1:
        return ['position', 'projectSide'];
      case 2:
        return ['managerName', 'managerEmail', 'annualLeaveBalance', 'medicalLeaveBalance'];
      default:
        return [];
    }
  };

  /**
   * Move to next step
   */
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Move to previous step
   */
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Step configuration
   */
  const steps = [
    {
      title: 'Personal Info',
      icon: <UserOutlined />,
      description: 'Basic employee details',
    },
    {
      title: 'Job Details',
      icon: <BriefcaseOutlined />,
      description: 'Position and project',
    },
    {
      title: 'Management & Leave',
      icon: <TeamOutlined />,
      description: 'Manager and leave balances',
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleGoBack}
          style={{ marginBottom: '16px' }}
        >
          Back to Employee List
        </Button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar size={64} icon={<UserAddOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>Add New Employee</Title>
            <Text type="secondary">Create a new employee profile for your organization</Text>
            {employeeId && (
              <div style={{ marginTop: '8px' }}>
                <Text strong>Employee ID: </Text>
                <Text code>{employeeId}</Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card style={{ marginBottom: '24px' }}>
        <Steps 
          current={currentStep} 
          items={steps}
          style={{ marginBottom: '24px' }}
        />
      </Card>

      {/* Form Card */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            annualLeaveBalance: 21,
            medicalLeaveBalance: 14,
          }}
          size="large"
        >
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <div>
              <Title level={4} style={{ marginBottom: '24px' }}>
                <UserOutlined /> Personal Information
              </Title>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[
                      { required: true, message: 'Please enter employee full name' },
                      { min: 2, message: 'Name must be at least 2 characters' },
                      { max: 50, message: 'Name cannot exceed 50 characters' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter employee's full name" 
                      showCount
                      maxLength={50}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter email address' },
                      { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="Enter email address" 
                      type="email"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Employment Status"
                    name="status"
                    rules={[{ required: true, message: 'Please select employment status' }]}
                  >
                    <Select placeholder="Select employment status" size="large">
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Step 2: Job Details */}
          {currentStep === 1 && (
            <div>
              <Title level={4} style={{ marginBottom: '24px' }}>
                <BriefcaseOutlined /> Job Details
              </Title>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Position / Job Title"
                    name="position"
                    rules={[
                      { required: true, message: 'Please enter job position' },
                      { min: 2, message: 'Position must be at least 2 characters' }
                    ]}
                  >
                    <Input 
                      placeholder="e.g., Senior Frontend Developer, Product Manager" 
                      showCount
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Project Side / Department"
                    name="projectSide"
                    rules={[{ required: true, message: 'Please select project side' }]}
                  >
                    <Select placeholder="Select project side or department" size="large">
                      <Option value="Frontend">Frontend Development</Option>
                      <Option value="Backend">Backend Development</Option>
                      <Option value="Fullstack">Fullstack Development</Option>
                      <Option value="DevOps">DevOps & Infrastructure</Option>
                      <Option value="QA">Quality Assurance</Option>
                      <Option value="Design">UI/UX Design</Option>
                      <Option value="Management">Management</Option>
                      <Option value="Marketing">Marketing</Option>
                      <Option value="Sales">Sales</Option>
                      <Option value="HR">Human Resources</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Step 3: Management & Leave */}
          {currentStep === 2 && (
            <div>
              <Title level={4} style={{ marginBottom: '24px' }}>
                <TeamOutlined /> Management & Leave Configuration
              </Title>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Direct Manager Name"
                    name="managerName"
                    rules={[
                      { required: true, message: 'Please enter manager name' },
                      { min: 2, message: 'Manager name must be at least 2 characters' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter direct manager's name" 
                      showCount
                      maxLength={50}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Manager Email"
                    name="managerEmail"
                    rules={[
                      { required: true, message: 'Please enter manager email' },
                      { type: 'email', message: 'Please enter a valid email address' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="Enter manager's email address" 
                      type="email"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" orientationMargin={0}>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Leave Balances</span>
              </Divider>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Annual Leave Balance"
                    name="annualLeaveBalance"
                    rules={[
                      { required: true, message: 'Please enter annual leave balance' },
                      { type: 'number', min: 0, max: 365, message: 'Balance must be between 0 and 365 days' }
                    ]}
                    tooltip="Standard annual leave is typically 21 days per year"
                  >
                    <InputNumber 
                      min={0} 
                      max={365} 
                      placeholder="Enter annual leave days" 
                      style={{ width: '100%' }}
                      suffix="days"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Medical Leave Balance"
                    name="medicalLeaveBalance"
                    rules={[
                      { required: true, message: 'Please enter medical leave balance' },
                      { type: 'number', min: 0, max: 365, message: 'Balance must be between 0 and 365 days' }
                    ]}
                    tooltip="Standard medical leave is typically 14 days per year"
                  >
                    <InputNumber 
                      min={0} 
                      max={365} 
                      placeholder="Enter medical leave days" 
                      style={{ width: '100%' }}
                      suffix="days"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Form Navigation */}
          <Divider />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {currentStep > 0 && (
                <Button onClick={prevStep} size="large">
                  Previous
                </Button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {currentStep < 2 ? (
                <Button type="primary" onClick={nextStep} size="large">
                  Next Step
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={() => form.submit()}
                  loading={loading}
                  size="large"
                >
                  Create Employee
                </Button>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">
              Step {currentStep + 1} of {steps.length}
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default AddEmployeePage;