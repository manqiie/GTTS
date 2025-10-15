import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Button, Space, Alert } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function StandinForm({ initialValues, onSubmit, submitting, mode, onCancel }) {
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (initialValues && mode === 'edit') {
      form.setFieldsValue({
        standinName: initialValues.standinName,
        standinEmail: initialValues.standinEmail,
        dateRange: [dayjs(initialValues.startDate), dayjs(initialValues.endDate)],
        reason: initialValues.reason
      });
    }
  }, [initialValues, mode, form]);

  const handleSubmit = async (values) => {
    setErrorMessage(null); // Clear previous errors
    
    const formattedData = {
      standinEmail: values.standinEmail,
      standinName: values.standinName,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      reason: values.reason
    };
    
    try {
      await onSubmit(formattedData);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while submitting the form');
    }
  };

  const disabledDate = (current) => {
    // Allow today and future dates
    const today = dayjs().startOf('day');
    return current && current.isBefore(today, 'day');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: 600 }}
    >
      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMessage(null)}
          style={{ marginBottom: 24 }}
        />
      )}

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
          { required: true, message: 'Please select delegation period' },
          {
            validator: (_, value) => {
              if (!value || value.length !== 2) {
                return Promise.resolve();
              }
              const [start, end] = value;
              if (end.isBefore(start)) {
                return Promise.reject(new Error('End date must be on or after start date'));
              }
              return Promise.resolve();
            }
          }
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
          placeholder="Enter reason for delegation (e.g., vacation, business trip, etc.)"
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
            {mode === 'create' ? 'Create Stand-in Delegation' : 'Update Stand-in Delegation'}
          </Button>
          <Button 
            onClick={onCancel}
            size="large"
          >
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default StandinForm;