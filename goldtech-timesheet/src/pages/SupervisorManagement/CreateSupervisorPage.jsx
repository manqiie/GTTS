// CreateSupervisorPage.jsx - FIXED
import React, { useEffect } from 'react';
import { Form, Button, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import SupervisorForm from '../../components/Supervisor/SupervisorForm';
import { useSupervisorStore } from '../../hooks/useSupervisorStore';

function CreateSupervisorPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { createSupervisor } = useSupervisorStore();

  // Set initial values for form
  useEffect(() => {
    form.setFieldsValue({
      status: 'ACTIVE'
    });
  }, [form]);

  const handleFinish = async (values) => {
    try {
      console.log('Form values:', values);

      const supervisorData = {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        client: values.client || null,
        department: values.department || null,
        location: values.location || null,
        roles: values.roles
      };

      console.log('Creating supervisor with data:', supervisorData);

      const newSupervisor = await createSupervisor(supervisorData);
      
      message.success(`Supervisor ${newSupervisor.full_name} created successfully!`);
      navigate('/supervisor-management');
    } catch (error) {
      console.error('Error creating supervisor:', error);
      message.error('Failed to create supervisor. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/supervisor-management');
  };

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Supervisor Management', path: '/supervisor-management' },
    { title: 'Create New Supervisor' }
  ];

  const submitButton = (
    <div>
      <Button onClick={handleBack} style={{ marginRight: 8 }}>
        <ArrowLeftOutlined /> Back
      </Button>
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
        Create Supervisor
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Create New Supervisor"
        breadcrumbs={breadcrumbs}
        description="Add a new supervisor to the system"
      />

      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <SupervisorForm
          form={form}
          onFinish={handleFinish}
          submitButton={submitButton}
          isEdit={false}
        />
      </div>
    </div>
  );
}

export default CreateSupervisorPage;