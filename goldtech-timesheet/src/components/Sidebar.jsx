import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  ContactsOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

/**
 * Sidebar Component
 * Provides navigation menu with hierarchical structure
 * Uses Ant Design's Layout.Sider for responsive collapsing
 */
function Sidebar({ collapsed, setCollapsed }) {
  // Menu items structure - organized by categories
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
    },
    {
      type: 'divider', // Visual separator
    },
    {
      key: 'timesheet-group',
      label: 'Timesheet',
      type: 'group',
    },
    {
      key: 'my-timesheet',
      icon: <ClockCircleOutlined />,
      label: 'My Timesheet',
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'History',
    },
    {
      type: 'divider',
    },
    {
      key: 'management-group',
      label: 'Management',
      type: 'group',
    },
    {
      key: 'approve',
      icon: <CheckSquareOutlined />,
      label: 'Approve Timesheets',
    },
    {
      key: 'staff',
      icon: <TeamOutlined />,
      label: 'Staff Management',
    },
    {
      key: 'clients',
      icon: <ContactsOutlined />,
      label: 'Client Management',
    },
    {
      type: 'divider',
    },
    {
      key: 'reports-group',
      label: 'Reports',
      type: 'group',
    },
    {
      key: 'invoices',
      icon: <FileTextOutlined />,
      label: 'Invoice Generator',
    },
  ];

  const handleMenuClick = (e) => {
    console.log('Menu clicked:', e.key);
    // Here you would implement routing logic
    // For now, we'll just log the selection
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#2C3367',
      }}
    >
      {/* Company Logo/Brand */}
      <div style={{ 
        padding: collapsed ? '20px 10px' : '20px', 
        textAlign: 'center',
        borderBottom: '1px solid #34495e',
        marginBottom: '20px'
      }}>
        <Title 
          level={4} 
          style={{ 
            color: '#b39f65', 
            margin: 0,
            fontSize: collapsed ? '12px' : '14px',
            lineHeight: '1.2',
            letterSpacing: '1px'
          }}
        >
          {collapsed ? 'GT' : 'GOLDTECH\nRESOURCES'}
        </Title>
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        defaultSelectedKeys={['my-timesheet']} // Default active menu item
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          backgroundColor: 'transparent',
        }}
      />
    </Sider>
  );
}

export default Sidebar;