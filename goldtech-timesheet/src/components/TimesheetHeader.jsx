import React from 'react';
import { Card, Row, Col, Select, Tag, Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

/**
 * TimesheetHeader Component
 * 
 * Displays the page header with:
 * - Breadcrumb navigation
 * - Year and month selectors (separate controls)
 * - Timesheet status indicator
 */
function TimesheetHeader({ year, month, status, onYearChange, onMonthChange }) {
  // Generate year options (current year ± 2)
  const currentYear = dayjs().year();
  const yearOptions = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    yearOptions.push({ value: i, label: i.toString() });
  }

  // Month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Status configuration
  const statusConfig = {
    draft: { color: 'orange', text: 'Draft' },
    pending: { color: 'blue', text: 'Pending Approval' },
    approved: { color: 'green', text: 'Approved' },
    rejected: { color: 'red', text: 'Rejected' },
  };

  const currentStatus = statusConfig[status] || statusConfig.draft;

  return (
    <Card style={{ marginBottom: 20 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Timesheet</Breadcrumb.Item>
        <Breadcrumb.Item>My Timesheet</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            My Timesheet
          </Title>
        </Col>
        
        <Col>
          <Row gutter={16} align="middle">
            {/* Year Selector */}
            <Col>
              <span style={{ marginRight: 8, fontWeight: 500 }}>Year:</span>
              <Select
                value={year}
                onChange={onYearChange}
                options={yearOptions}
                style={{ width: 100 }}
              />
            </Col>
            
            {/* Month Selector */}
            <Col>
              <span style={{ marginRight: 8, fontWeight: 500 }}>Month:</span>
              <Select
                value={month}
                onChange={onMonthChange}
                options={monthOptions}
                style={{ width: 120 }}
              />
            </Col>
            
            {/* Status Tag */}
            <Col>
              <Tag color={currentStatus.color} style={{ margin: 0 }}>
                {currentStatus.text}
              </Tag>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}

export default TimesheetHeader;