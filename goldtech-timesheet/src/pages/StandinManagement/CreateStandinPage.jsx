import React, { useState } from 'react';
import { Card, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import StandinForm from '../../components/StandinManagement/StandinForm';
import { standinApi } from '../../services/standinApi';
import { useAuth } from '../../contexts/AuthContext';

function CreateStandinPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const standinData = {
        supervisorId: user.id,
        ...formData
      };

      const response = await standinApi.createStandin(standinData);
      
      if (response.success) {
        messageApi.success('Stand-in delegation created successfully');
        navigate('/standin-management');
      }
    } catch (error) {
      // Re-throw error so form can catch it and display
      setSubmitting(false);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/standin-management');
  };

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Stand-in Management', path: '/standin-management' },
    { title: 'Create Stand-in' }
  ];

  return (
    <div>
      {contextHolder}  
      <PageHeader
        title="Create Stand-in Delegation"
        breadcrumbs={breadcrumbs}
        description="Delegate your timesheet approval authority to another person"
        extra={
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/standin-management')}
          >
            Back
          </Button>
        }
      />

      <Card>
        <StandinForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      </Card>
    </div>
  );
}

export default CreateStandinPage;