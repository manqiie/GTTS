// src/pages/CreateEmployeePage.jsx
import React from 'react';
import { Form, Button, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import EmployeeForm from '../components/Employee/EmployeeForm';
import { useEmployeeStore } from '../hooks/useEmployeeStore';

function CreateEmployeePage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { createEmployee } = useEmployeeStore();

  const handleFinish = async (values) => {
    try {
      // Transform form values
      const employeeData = {
        ...values,
        joinDate: values.joinDate.format('YYYY-MM-DD'),
        // Set default values
        managerId: `MGR${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`, // Mock manager ID
      };

      const newEmployee = createEmployee(employeeData);
      
      message.success(`Employee ${newEmployee.name} created successfully!`);
      navigate('/employee-management');
    } catch (error) {
      console.error('Error creating employee:', error);
      message.error('Failed to create employee. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/employee-management');
  };

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Employee Management', path: '/employee-management' },
    { title: 'Create New Employee' }
  ];

  const submitButton = (
    <div>
      <Button onClick={handleBack} style={{ marginRight: 8 }}>
        <ArrowLeftOutlined /> Back
      </Button>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Create Employee
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Create New Employee"
        breadcrumbs={breadcrumbs}
        description="Add a new employee to the system"
      />

      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <EmployeeForm
          form={form}
          onFinish={handleFinish}
          submitButton={submitButton}
        />
      </div>
    </div>
  );
}

export default CreateEmployeePage;