// EditEmployeePage.jsx (keeping filename but updating for user management)
import React, { useState, useEffect } from 'react';
import { Form, Button, message, Spin, Alert } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../components/Common/PageHeader';
import EmployeeForm from '../components/Employee/EmployeeForm';
import { useEmployeeStore } from '../hooks/useEmployeeStore';

function EditEmployeePage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { getEmployee, updateEmployee, loading: storeLoading } = useEmployeeStore();
  
  const [employee, setEmployee] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Wait for store to finish loading before trying to get user
    if (!storeLoading) {
      loadEmployee();
    }
  }, [id, storeLoading]);

  const loadEmployee = () => {
    setPageLoading(true);
    setNotFound(false);
    
    try {
      const emp = getEmployee(id);
      if (emp) {
        setEmployee(emp);
        // Set form initial values with proper role ID conversion
        const initialValues = {
          employee_id: emp.employee_id,
          email: emp.email,
          full_name: emp.full_name,
          phone: emp.phone,
          position: emp.position,
          department: emp.department,
          project_site: emp.project_site,
          company: emp.company,
          join_date: dayjs(emp.join_date),
          manager_id: emp.manager_id,
          roles: emp.roles ? emp.roles.map(role => role.id) : [], // Convert role objects to IDs
          status: emp.status
        };
        form.setFieldsValue(initialValues);
        setNotFound(false);
      } else {
        console.log('User not found with ID:', id);
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      message.error('Failed to load user data');
      setNotFound(true);
    } finally {
      setPageLoading(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      // Transform form values to match database structure
      const updateData = {
        employee_id: values.employee_id || null,
        email: values.email,
        full_name: values.full_name,
        phone: values.phone || null,
        position: values.position,
        department: values.department,
        project_site: values.project_site || null,
        company: values.company || null,
        join_date: values.join_date.format('YYYY-MM-DD'),
        manager_id: values.manager_id || null,
        roles: values.roles, // Array of role IDs
        status: values.status
      };

      const updatedEmployee = updateEmployee(id, updateData);
      
      if (updatedEmployee) {
        message.success(`User ${updatedEmployee.full_name} updated successfully!`);
        navigate('/employee-management');
      } else {
        message.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('Failed to update user. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/employee-management');
  };

  // Show loading while store is loading OR page is loading
  if (storeLoading || pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading user data..." />
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <PageHeader
          title="User Not Found"
          breadcrumbs={[
            { title: 'Management' },
            { title: 'User Management', path: '/employee-management' },
            { title: 'Edit User' }
          ]}
        />
        <Alert
          message="User Not Found"
          description={`The user with ID "${id}" doesn't exist or may have been removed.`}
          type="error"
          showIcon
          action={
            <Button onClick={handleBack}>
              Back to User Management
            </Button>
          }
        />
      </div>
    );
  }

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'User Management', path: '/employee-management' },
    { title: `Edit ${employee?.full_name}` }
  ];

  const submitButton = (
    <div>
      <Button onClick={handleBack} style={{ marginRight: 8 }}>
        <ArrowLeftOutlined /> Back
      </Button>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Update User
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Edit User: ${employee?.full_name}`}
        breadcrumbs={breadcrumbs}
        description={`Update information for ${employee?.full_name} (${employee?.employee_id || 'No Employee ID'})`}
      />

      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <EmployeeForm
          form={form}
          initialValues={employee}
          onFinish={handleFinish}
          submitButton={submitButton}
        />
      </div>
    </div>
  );
}

export default EditEmployeePage;