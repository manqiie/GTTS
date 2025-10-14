import React, { useState, useEffect } from 'react';
import { 
  Card, Form, Input, DatePicker, Button, Space, message, Spin 
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/Common/PageHeader';
import { standinApi } from '../../services/standinApi';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function EditStandinPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [standin, setStandin] = useState(null);

  useEffect(() => {
    loadStandin();
  }, [id]);

  const loadStandin = async () => {
    try {
      const response = await standinApi.getStandinById(id);
      if (response.success && response.data) {
        const data = response.data;
        setStandin(data);
        
        form.setFieldsValue({
          standinName: data.standinName,
          standinEmail: data.standinEmail,
          dateRange: [dayjs(data.startDate), dayjs(data.endDate)],
          reason: data.reason
        });
      }
    } catch (error) {
      message.error('Failed to load stand-in delegation');
      navigate('/standin-management');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const standinData = {
        supervisorId: standin.supervisorId,
        standinEmail: values.standinEmail,
        standinName: values.standinName,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason
      };

      const response = await standinApi.updateStandin(id, standinData);
      
      if (response.success) {
        message.success('Stand-in delegation updated successfully');
        navigate('/standin-management');
      }
    } catch (error) {
      message.error(error.message || 'Failed to update stand-in delegation');
    } finally {
      setSubmitting(false);
    }
  };

  const disabledDate = (current) => {
    // Allow today and future dates
    // Compare without time component to allow selection of today
    const today = dayjs().startOf('day');
    return current && current.isBefore(today, 'day');
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600, margin: '0 auto' }}
        >
          <Form.Item
            label="Stand-in Person Name"
            name="standinName"
            rules={[
              { required: true, message: 'Please enter stand-in person name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 255, message: 'Name must not exceed 255 characters' }
            ]}
          >
            <Input 
              placeholder="Enter full name of the stand-in person"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Stand-in Person Email"
            name="standinEmail"
            rules={[
              { required: true, message: 'Please enter stand-in person email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input 
              placeholder="stand-in@company.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Delegation Period"
            name="dateRange"
            rules={[
              { required: true, message: 'Please select delegation period' }
            ]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              disabledDate={disabledDate}
              popupClassName="mobile-friendly-picker"
              getPopupContainer={(trigger) => trigger.parentElement}
            />
          </Form.Item>

          <Form.Item
            label="Reason (Optional)"
            name="reason"
            rules={[
              { max: 1000, message: 'Reason must not exceed 1000 characters' }
            ]}
          >
            <TextArea 
              rows={4}
              placeholder="Enter reason for delegation"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitting}
                size="large"
              >
                Update Stand-in Delegation
              </Button>
              <Button 
                onClick={() => navigate('/standin-management')}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default EditStandinPage;