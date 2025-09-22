// src/components/TimesheetReview/ApprovalHistory.jsx
import React from 'react';
import { Card, Descriptions, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

const { Title } = Typography;

const ApprovalHistory = ({ timesheet }) => {
  if (!timesheet) return null;

  const statusConfig = {
    pending: { color: 'orange', text: 'Pending Review' },
    approved: { color: 'green', text: 'Approved' },
    rejected: { color: 'red', text: 'Rejected' }
  };
  
  const currentStatusConfig = statusConfig[timesheet.status] || statusConfig.pending;

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 16 }}>Approval History</Title>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Decision">
          <Tag color={currentStatusConfig.color}>
            {currentStatusConfig.text}
          </Tag>
        </Descriptions.Item>
        {timesheet.approvedBy && (
          <Descriptions.Item label="Processed By">
            {timesheet.approvedBy}
          </Descriptions.Item>
        )}
        {timesheet.approvedAt && (
          <Descriptions.Item label="Processed At">
            {dayjs(timesheet.approvedAt).format('MMMM DD, YYYY HH:mm')}
          </Descriptions.Item>
        )}
        {timesheet.approvalComments && (
          <Descriptions.Item label="Comments">
            {timesheet.approvalComments}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default ApprovalHistory;