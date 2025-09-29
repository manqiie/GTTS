// src/components/TimesheetReview/ApprovalSection.jsx
import React from 'react';
import { Card, Typography, Input, Button, Space, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ApprovalSection = ({
  comments,
  onCommentsChange,
  onApprove,
  onReject,
  submitting = false
}) => {
  const navigate = useNavigate();

  const handleReject = () => {
    if (!comments || !comments.trim()) {
      message.warning('Please provide comments for rejection');
      return;
    }
    onReject();
  };

  const handleApprove = () => {
    onApprove();
  };

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>Approval Decision</Title>
      
      <div style={{ marginBottom: 20 }}>
        <Text strong>Comments:</Text>
        <TextArea
          rows={4}
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          placeholder="Add comments about the approval/rejection (required for rejection)..."
          style={{ marginTop: 8 }}
        />
      </div>

      <div style={{ textAlign: 'right' }}>
        <Space size="middle">
          <Button onClick={() => navigate('/approve')}>
            Cancel
          </Button>
          <Button 
            danger
            icon={<CloseOutlined />}
            loading={submitting}
            onClick={onReject}
            disabled={submitting}
          >
            Reject
          </Button>
          <Button 
            type="primary"
            icon={<CheckOutlined />}
            loading={submitting}
            onClick={handleApprove}
            disabled={submitting}
          >
            Approve
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default ApprovalSection;