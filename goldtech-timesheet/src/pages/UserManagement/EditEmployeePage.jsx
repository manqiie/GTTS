// EditEmployeePage.jsx - DEBUG VERSION with extensive logging
import React, { useState, useEffect } from 'react';
import { Form, Button, message, Spin, Alert } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/Common/PageHeader';
import EmployeeForm from '../../components/Employee/EmployeeForm';
import { useEmployeeStore } from '../../hooks/useEmployeeStore';

function EditEmployeePage() {
  const [messageApi, contextHolder] = message.useMessage();
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
    console.log('Loading employee with ID:', id);
    setPageLoading(true);
    setNotFound(false);
    
    try {
      const emp = getEmployee(id);
      console.log('Raw employee data from store:', emp);
      
      if (emp) {
        setEmployee(emp);
        
        // DEBUG: Log all supervisor-related fields
        console.log('Employee supervisor fields:');
        console.log('- supervisor_id:', emp.supervisor_id);
        console.log('- manager_id:', emp.manager_id);
        console.log('- supervisor_name:', emp.supervisor_name);
        console.log('- manager_name:', emp.manager_name);
        
        // FIXED: Set form initial values with proper supervisor handling
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
          
          // CRITICAL: Set supervisor_id with fallback
          supervisor_id: emp.supervisor_id || emp.manager_id || null,
          
          roles: emp.roles ? emp.roles.map(role => role.id) : [],
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
      messageApi.error('Failed to load user data');
      setNotFound(true);
    } finally {
      setPageLoading(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      console.log('Form submission started');
      console.log('Form values received:', values);
      console.log('Supervisor ID from form:', values.supervisor_id);
      
      // Check form fields directly
      const formValues = form.getFieldsValue();
      console.log('Direct form field values:', formValues);
      console.log('Direct supervisor_id field:', formValues.supervisor_id);
      
      // FIXED: Transform form values to match database structure
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
        
        // CRITICAL: Map supervisor_id properly
        supervisor_id: values.supervisor_id || null,
        
        roles: values.roles,
        status: values.status
      };

      console.log('Update data being sent to API:', updateData);
      console.log('Supervisor ID in update data:', updateData.supervisor_id);

      const updatedEmployee = await updateEmployee(id, updateData);
      
      console.log('Updated employee returned from API:', updatedEmployee);
      
      if (updatedEmployee) {
        messageApi.success(`User ${updatedEmployee.full_name} updated successfully!`);
        
        
        navigate('/employee-management');
      } else {
        messageApi.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      messageApi.error('Failed to update user. Please try again.');
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
      {contextHolder}
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