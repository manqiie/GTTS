import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
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

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

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
      type: 'divider',
    },
    {
      key: 'timesheet-group',
      label: 'Timesheet',
      type: 'group',
    },
    {
      key: 'timesheet',
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
      key: 'timesheet-management',
      icon: <CheckSquareOutlined />,
      label: 'Timesheet Management',
    },
    {
      key: 'employee-management',
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
    const routeMap = {
      'home': '/home',
      'profile': '/profile',
      'timesheet': '/timesheet',
      'history': '/history',
      'approve': '/approve',
      'timesheet-management': '/timesheet-management',
      'employee-management': '/employee-management',
      'clients': '/clients',
      'invoices': '/invoices',
    };

    const route = routeMap[e.key];
    if (route) {
      navigate(route);
    }
  };

  // Get current selected key from location
  const getCurrentKey = () => {
    const path = location.pathname;
    if (path.startsWith('/employee-management')) return 'employee-management';
    if (path === '/timesheet') return 'timesheet';
    if (path === '/home') return 'home';
    if (path === '/profile') return 'profile';
    if (path === '/history') return 'history';
    if (path === '/approve') return 'approve';
    if (path === '/timesheet-management') return 'timesheet-management';
    if (path === '/clients') return 'clients';
    if (path === '/invoices') return 'invoices';
    return 'timesheet'; // default
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
        selectedKeys={[getCurrentKey()]}
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