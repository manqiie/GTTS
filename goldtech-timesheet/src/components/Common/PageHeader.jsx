// src/components/Common/PageHeader.jsx
import React from 'react';
import { Card, Row, Col, Typography, Breadcrumb, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Title } = Typography;

function PageHeader({ 
  title, 
  breadcrumbs = [], 
  extra = null,
  description = null 
}) {
  const defaultBreadcrumbs = [
    {
      icon: <HomeOutlined />,
      title: 'Home'
    },
    ...breadcrumbs
  ];

  return (
    <Card style={{ marginBottom: 20 }}>
      <Breadcrumb items={defaultBreadcrumbs} style={{ marginBottom: 16 }} />
      
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {description && (
            <div style={{ marginTop: 8, color: '#666' }}>
              {description}
            </div>
          )}
        </Col>
        
        {extra && (
          <Col>
            <Space>
              {extra}
            </Space>
          </Col>
        )}
      </Row>
    </Card>
  );
}

export default PageHeader;