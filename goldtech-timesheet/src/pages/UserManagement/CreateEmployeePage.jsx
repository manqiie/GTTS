// CreateEmployeePage.jsx (keeping filename but updating for user management)
import React from 'react';
import { Form, Button, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import EmployeeForm from '../../components/Employee/EmployeeForm';
import { useEmployeeStore } from '../../hooks/useEmployeeStore';

function CreateEmployeePage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { createEmployee } = useEmployeeStore();

  const handleFinish = async (values) => {
    try {
      // Transform form values to match database structure
      const userData = {
        employee_id: values.employee_id || null,
        email: values.email,
        password: values.password, // In real app, this would be hashed on backend
        full_name: values.full_name,
        phone: values.phone || null,
        position: values.position,
        department: values.department,
        location: values.location || null,
        company: values.company || null,
        join_date: values.join_date ? values.join_date.format('YYYY-MM-DD') : null,
        supervisor_id: values.supervisor_id || null,
        roles: values.roles // Array of role IDs
      };

      const newUser = createEmployee(userData);
      
      message.success(`User ${newUser.full_name} created successfully!`);
      navigate('/employee-management');
    } catch (error) {
      console.error('Error creating user:', error);
      message.error('Failed to create user. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/employee-management');
  };

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'User Management', path: '/employee-management' },
    { title: 'Create New User' }
  ];

  const submitButton = (
    <div>
      <Button onClick={handleBack} style={{ marginRight: 8 }}>
        <ArrowLeftOutlined /> Back
      </Button>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Create User
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Create New User"
        breadcrumbs={breadcrumbs}
        description="Add a new user to the system with roles and permissions"
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