// Updated TimesheetHeader.jsx - With available months logic
import React from 'react';
import { Card, Row, Col, Select, Tag, Typography, Breadcrumb, Alert } from 'antd';
import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * Updated TimesheetHeader Component with Available Months Logic
 * 
 * Now shows only available months based on business rules:
 * - Current month (always available)
 * - Previous month (only if within first 10 days and not submitted/approved)
 */
function TimesheetHeader({ 
  year, 
  month, 
  status, 
  availableMonths = [],
  onYearChange, 
  onMonthChange,
  canSubmit,
  canResubmit,
  showSubmitButton
}) {
  
  // Get current available month/year combinations
  const getAvailableOptions = () => {
    const options = [];
    
    availableMonths.forEach(availableMonth => {
      const optionValue = `${availableMonth.year}-${availableMonth.month}`;
      const displayText = `${availableMonth.monthName} ${availableMonth.year}`;
      
      let suffix = '';
      if (availableMonth.isCurrentMonth) {
        suffix = ' (Current)';
      } else if (availableMonth.isSubmitted) {
        suffix = ' (Submitted)';
      }
      
      options.push({
        value: optionValue,
        label: displayText + suffix,
        year: availableMonth.year,
        month: availableMonth.month,
        isSubmitted: availableMonth.isSubmitted,
        isCurrentMonth: availableMonth.isCurrentMonth
      });
    });

    return options;
  };

  // Handle month/year change from dropdown
  const handlePeriodChange = (value) => {
    const selectedOption = getAvailableOptions().find(opt => opt.value === value);
    if (selectedOption) {
      onYearChange(selectedOption.year);
      onMonthChange(selectedOption.month);
    }
  };

  // Get current selection value
  const getCurrentValue = () => {
    return `${year}-${month}`;
  };

  // Get status configuration
  const getStatusConfig = (currentStatus) => {
    const configs = {
      draft: { color: 'default', text: 'Draft' },
      submitted: { color: 'processing', text: 'Submitted' },
      pending: { color: 'warning', text: 'Pending Approval' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'error', text: 'Rejected' }
    };
    return configs[currentStatus] || configs.draft;
  };

  // Show submission rules info
  const getSubmissionInfo = () => {
    const today = dayjs();
    const isFirstTenDays = today.date() <= 10;
    const currentMonth = dayjs().format('MMMM YYYY');
    const previousMonth = dayjs().subtract(1, 'month').format('MMMM YYYY');

    if (isFirstTenDays) {
      return (
        <Alert
          message="Submission Window"
          description={
            <div>
              <div>• <strong>{currentMonth}</strong>: Can be submitted anytime</div>
              <div>• <strong>{previousMonth}</strong>: Can be submitted until {dayjs().format('MMMM')} 10th</div>
              <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                After the 10th, previous month submissions are not allowed.
              </div>
            </div>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginTop: 12 }}
        />
      );
    }
    
    return null;
  };

  const statusConfig = getStatusConfig(status);
  const availableOptions = getAvailableOptions();

  return (
    <div>
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
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Manage your working hours and leave applications
              </Text>
            </div>
          </Col>
          
          <Col>
            <Row gutter={16} align="middle">
              {/* Period Selector (Combined Year/Month) */}
              <Col>
                <span style={{ marginRight: 8, fontWeight: 500 }}>Period:</span>
                <Select
                  value={getCurrentValue()}
                  onChange={handlePeriodChange}
                  options={availableOptions}
                  style={{ width: 200 }}
                  optionRender={(option) => {
                    const optionData = option.data;
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{optionData.label}</span>
                        {optionData.isSubmitted && (
                          <Tag size="small" color="blue">Submitted</Tag>
                        )}
                        {optionData.isCurrentMonth && (
                          <Tag size="small" color="green">Current</Tag>
                        )}
                      </div>
                    );
                  }}
                />
              </Col>

              {/* Status Display */}
              <Col>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
                  <Tag color={statusConfig.color} style={{ margin: 0 }}>
                    {statusConfig.text}
                  </Tag>
                </div>
              </Col>

              {/* Submission Capability Indicators */}
              {(canSubmit || canResubmit) && (
                <Col>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Action Available</div>
                    <Tag color={canResubmit ? 'orange' : 'blue'} style={{ margin: 0 }}>
                      {canResubmit ? 'Can Resubmit' : 'Can Submit'}
                    </Tag>
                  </div>
                </Col>
              )}
            </Row>
          </Col>
        </Row>

        {/* Submission Rules Information */}
        {getSubmissionInfo()}
      </Card>

      {/* Additional Status Information for Non-Draft Timesheets */}
      {status !== 'draft' && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text strong>
                {dayjs().year(year).month(month - 1).format('MMMM YYYY')} Timesheet Status
              </Text>
            </Col>
            <Col>
              <Tag color={statusConfig.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {statusConfig.text}
              </Tag>
            </Col>
          </Row>
          
          {status === 'rejected' && (
            <div style={{ marginTop: 8 }}>
              <Alert
                message="Timesheet Rejected"
                description="This timesheet has been rejected and can be edited and resubmitted."
                type="warning"
                showIcon
                style={{ marginTop: 8 }}
              />
            </div>
          )}
          
          {status === 'submitted' && (
            <div style={{ marginTop: 8 }}>
              <Alert
                message="Awaiting Approval"
                description="This timesheet has been submitted and is awaiting supervisor approval."
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            </div>
          )}
          
          {status === 'approved' && (
            <div style={{ marginTop: 8 }}>
              <Alert
                message="Approved"
                description="This timesheet has been approved and is now final."
                type="success"
                showIcon
                style={{ marginTop: 8 }}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default TimesheetHeader;