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

           
            </Row>
          </Col>
        </Row>


      </Card>

      
    </div>
  );
}

export default TimesheetHeader;