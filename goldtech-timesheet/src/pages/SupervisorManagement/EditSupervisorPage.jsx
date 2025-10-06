// EditSupervisorPage.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, message, Spin, Alert } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import SupervisorForm from '../../components/Supervisor/SupervisorForm';
import { useSupervisorStore } from '../../hooks/useSupervisorStore';

function EditSupervisorPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSupervisor, updateSupervisor, loading: storeLoading } = useSupervisorStore();
  
  const [supervisor, setSupervisor] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!storeLoading) {
      loadSupervisor();
    }
  }, [id, storeLoading]);

  const loadSupervisor = () => {
    setPageLoading(true);
    setNotFound(false);
    
    try {
      const sup = getSupervisor(id);
      
      if (sup) {
        setSupervisor(sup);
        
        const initialValues = {
          email: sup.email,
          full_name: sup.full_name,
          client: sup.client,
          department: sup.department,
          location: sup.location,
          roles: sup.roles ? sup.roles.map(role => role.id) : [],
          status: sup.status
        };
        
        form.setFieldsValue(initialValues);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error loading supervisor:', error);
      messageApi.error('Failed to load supervisor data');
      setNotFound(true);
    } finally {
      setPageLoading(false);
    }
  };

  const handleFinish = async (values) => {
    try {
      const updateData = {
        email: values.email,
        full_name: values.full_name,
        client: values.client || null,
        department: values.department || null,
        location: values.location || null,
        roles: values.roles,
        status: values.status
      };

      const updatedSupervisor = await updateSupervisor(id, updateData);
      
      if (updatedSupervisor) {
        messageApi.success(`Supervisor ${updatedSupervisor.full_name} updated successfully!`);
        navigate('/supervisor-management');
      } else {
        messageApi.error('Failed to update supervisor');
      }
    } catch (error) {
      console.error('Error updating supervisor:', error);
      messageApi.error('Failed to update supervisor. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/supervisor-management');
  };

  if (storeLoading || pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading supervisor data..." />
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <PageHeader
          title="Supervisor Not Found"
          breadcrumbs={[
            { title: 'Management' },
            { title: 'Supervisor Management', path: '/supervisor-management' },
            { title: 'Edit Supervisor' }
          ]}
        />
        <Alert
          message="Supervisor Not Found"
          description={`The supervisor with ID "${id}" doesn't exist or may have been removed.`}
          type="error"
          showIcon
          action={
            <Button onClick={handleBack}>
              Back to Supervisor Management
            </Button>
          }
        />
      </div>
    );
  }

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Supervisor Management', path: '/supervisor-management' },
    { title: `Edit ${supervisor?.full_name}` }
  ];

  const submitButton = (
    <div>
      <Button onClick={handleBack} style={{ marginRight: 8 }}>
        <ArrowLeftOutlined /> Back
      </Button>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Update Supervisor
      </Button>
    </div>
  );

  return (
    <div>
      {contextHolder}
      <PageHeader
        title={`Edit Supervisor: ${supervisor?.full_name}`}
        breadcrumbs={breadcrumbs}
        description={`Update information for ${supervisor?.full_name}`}
      />

      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <SupervisorForm
          form={form}
          initialValues={supervisor}
          onFinish={handleFinish}
          submitButton={submitButton}
          isEdit={true}
        />
      </div>
    </div>
  );
}

export default EditSupervisorPage;