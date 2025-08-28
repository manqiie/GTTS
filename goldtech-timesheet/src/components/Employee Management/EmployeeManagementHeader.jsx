import React from 'react';
import { Card, Typography, Breadcrumb, Row, Col, Statistic } from 'antd';
import { HomeOutlined, TeamOutlined, UserOutlined, UserDeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * EmployeeManagementHeader Component
 * 
 * Displays the page header with:
 * - Breadcrumb navigation
 * - Page title
 * - Summary statistics
 */
function EmployeeManagementHeader() {
  // Mock statistics - in real app, these would come from props or API
  const stats = {
    totalEmployees: 24,
    activeEmployees: 22,
    inactiveEmployees: 2,
    pendingApprovals: 5
  };

  return (
    <Card style={{ marginBottom: 20 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Management</Breadcrumb.Item>
        <Breadcrumb.Item>Timesheet Management</Breadcrumb.Item>
      </Breadcrumb>

      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Employee Management
          </Title>
         
        </Col>
        
        <Col>
          <Row gutter={24}>
            <Col>
              <Statistic
                title="Total Employees"
                value={stats.totalEmployees}
                prefix={<TeamOutlined />}
                valueStyle={{ fontSize: '20px', fontWeight: 'bold' }}
              />
            </Col>
            <Col>
              <Statistic
                title="Active"
                value={stats.activeEmployees}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Col>
            <Col>
              <Statistic
                title="Inactive"
                value={stats.inactiveEmployees}
                prefix={<UserDeleteOutlined />}
                valueStyle={{ color: '#cf1322', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}

export default EmployeeManagementHeader;