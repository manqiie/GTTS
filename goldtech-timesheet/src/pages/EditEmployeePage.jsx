// src/pages/EditEmployeePage.jsx 
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
  const { getEmployee, updateEmployee, loading: storeLoading } = useEmployeeStore(); // Get store loading state
  
  const [employee, setEmployee] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Wait for store to finish loading before trying to get employee
    if (!storeLoading) {
      loadEmployee();
    }
  }, [id, storeLoading]); // Watch both id and storeLoading

  const loadEmployee = () => {
    setPageLoading(true);
    setNotFound(false);
    
    try {
      const emp = getEmployee(id);
      if (emp) {
        setEmployee(emp);
        // Set form initial values
        const initialValues = {
          ...emp,
          joinDate: dayjs(emp.joinDate)
        };
        form.setFieldsValue(initialValues);
        setNotFound(false);
      } else {
        console.log('Employee not found with ID:', id); // Debug log
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      message.error('Failed to load employee data');
      setNotFound(true);
    } finally {
      setPageLoading(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      // Transform form values
      const updateData = {
        ...values,
        joinDate: values.joinDate.format('YYYY-MM-DD'),
      };

      const updatedEmployee = updateEmployee(id, updateData);
      
      if (updatedEmployee) {
        message.success(`Employee ${updatedEmployee.name} updated successfully!`);
        navigate('/employee-management');
      } else {
        message.error('Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      message.error('Failed to update employee. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/employee-management');
  };

  // Show loading while store is loading OR page is loading
  if (storeLoading || pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading employee data..." />
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <PageHeader
          title="Employee Not Found"
          breadcrumbs={[
            { title: 'Management' },
            { title: 'Employee Management', path: '/employee-management' },
            { title: 'Edit Employee' }
          ]}
        />
        <Alert
          message="Employee Not Found"
          description={`The employee with ID "${id}" doesn't exist or may have been removed.`}
          type="error"
          showIcon
          action={
            <Button onClick={handleBack}>
              Back to Employee Management
            </Button>
          }
        />
      </div>
    );
  }

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Employee Management', path: '/employee-management' },
    { title: `Edit ${employee?.name}` }
  ];

  const submitButton = (
    <div>
      <Button onClick={handleBack} style={{ marginRight: 8 }}>
        <ArrowLeftOutlined /> Back
      </Button>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Update Employee
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Edit Employee: ${employee?.name}`}
        breadcrumbs={breadcrumbs}
        description={`Update information for ${employee?.name} (${employee?.employeeId})`}
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