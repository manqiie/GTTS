import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import StandinForm from '../../components/StandinManagement/StandinForm';
import { standinApi } from '../../services/standinApi';

function EditStandinPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [standin, setStandin] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    loadStandin();
  }, [id]);

  const loadStandin = async () => {
    setLoading(true);
    try {
      const response = await standinApi.getStandinById(id);
      if (response.success && response.data) {
        setStandin(response.data);
      }
    } catch (error) {
      messageApi.error('Failed to load stand-in delegation');
      navigate('/standin-management');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const standinData = {
        supervisorId: standin.supervisorId,
        ...formData
      };

      const response = await standinApi.updateStandin(id, standinData);
      
      if (response.success) {
        messageApi.success('Stand-in delegation updated successfully');
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
    { title: 'Edit Stand-in' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {contextHolder}  
      <PageHeader
        title="Edit Stand-in Delegation"
        breadcrumbs={breadcrumbs}
        description="Update stand-in delegation details"
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
          mode="edit"
          initialValues={standin}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitting={submitting}
        />
      </Card>
    </div>
  );
}

export default EditStandinPage;