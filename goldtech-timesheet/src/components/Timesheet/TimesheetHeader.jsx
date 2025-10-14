// TimesheetHeader.jsx - Complete Responsive Version
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const getAvailableOptions = () => {
    const options = [];
    
    availableMonths.forEach(availableMonth => {
      const optionValue = `${availableMonth.year}-${availableMonth.month}`;
      const displayText = isMobile 
        ? `${availableMonth.monthName.substring(0, 3)} ${availableMonth.year}`
        : `${availableMonth.monthName} ${availableMonth.year}`;
      
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
        {/* Breadcrumb Navigation - Hide on very small screens */}
        {!isMobile && (
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item>
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item>Timesheet</Breadcrumb.Item>
            <Breadcrumb.Item>My Timesheet</Breadcrumb.Item>
          </Breadcrumb>
        )}

        {/* Header Content - Stack on mobile */}
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12} lg={16}>
            <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
              My Timesheet
            </Title>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                Manage your working hours and leave applications
              </Text>
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={12} lg={8}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ marginRight: 8, fontWeight: 500, fontSize: isMobile ? '13px' : '14px' }}>Period:</span>
              <Select
                value={getCurrentValue()}
                onChange={handlePeriodChange}
                options={availableOptions}
                style={{ width: isMobile ? '100%' : 200, maxWidth: '100%' }}
                size={isMobile ? 'middle' : 'middle'}
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default TimesheetHeader;