// src/components/TimesheetReview/EmployeeInfoCard.jsx
import React from 'react';
import { Card, Descriptions, Tag, Row, Col } from 'antd';
import dayjs from 'dayjs';

const EmployeeInfoCard = ({ timesheet }) => {
  if (!timesheet) return null;

  const statusConfig = {
    pending: { color: 'orange', text: 'Pending Review' },
    approved: { color: 'green', text: 'Approved' },
    rejected: { color: 'red', text: 'Rejected' }
  };
  
  const currentStatusConfig = statusConfig[timesheet.status] || statusConfig.pending;

  return (
    <Card style={{ marginBottom: 20 }}>
      <Row gutter={24}>
        <Col span={12}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Employee">{timesheet.employeeName}</Descriptions.Item>
            <Descriptions.Item label="Employee ID">{timesheet.employeeId || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Position">{timesheet.position || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Location">{timesheet.location || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Period">
              {timesheet.monthName} {timesheet.year}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={currentStatusConfig.color}>
                {currentStatusConfig.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Submitted">
              {timesheet.submittedAt ? 
                dayjs(timesheet.submittedAt).format('MMMM DD, YYYY HH:mm') : 
                'Not submitted'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Manager">{timesheet.managerName || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default EmployeeInfoCard;