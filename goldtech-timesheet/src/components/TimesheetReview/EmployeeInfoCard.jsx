// src/components/TimesheetReview/EmployeeInfoCard.jsx
import React from 'react';
import { Card, Descriptions, Tag, Row, Col } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const EmployeeInfoCard = ({ timesheet }) => {
  if (!timesheet) return null;

  const statusConfig = {
    pending: { color: 'orange', text: 'Pending Review' },
    submitted: { color: 'orange', text: 'Pending Review' },
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
            <Descriptions.Item label="Position">{timesheet.employeePosition || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Location">{timesheet.employeeLocation || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={12}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Period">
              {timesheet.monthName} {timesheet.year}
              {timesheet.version > 1 && (
                <Tag color="blue" size="small" style={{ marginLeft: 8 }}>
                  v{timesheet.version}
                </Tag>
              )}
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
            <Descriptions.Item label="Supervisor">
              {timesheet.approvedBy || 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          {timesheet.isStandinApproval && (
            <Descriptions column={1} size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Approved By">
                <div>
                  <Tag color="purple" icon={<SwapOutlined />}>
                    Stand-in Approval
                  </Tag>
                  <div style={{ marginTop: 8, fontWeight: 500 }}>
                    {timesheet.standinApproverName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {timesheet.standinApproverEmail}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                    On behalf of {timesheet.approvedBy}
                  </div>
                </div>
              </Descriptions.Item>
              {timesheet.standinDelegationReason && (
                <Descriptions.Item label="Delegation Reason">
                  <i style={{ color: '#666' }}>{timesheet.standinDelegationReason}</i>
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default EmployeeInfoCard;