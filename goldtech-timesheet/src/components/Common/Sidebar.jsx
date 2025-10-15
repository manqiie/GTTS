// Sidebar.jsx - Fixed Sidebar on Desktop, Mobile Drawer on Small Screens
import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Space, Button, Modal, message, Drawer } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  UserSwitchOutlined,
  SwapOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Sider } = Layout;
const { Title, Text } = Typography;

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  // Filter menu items based on user permissions
  const getMenuItems = () => {
    const baseItems = [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: 'Home',
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'My Profile',
      }
    ];

    // Only show timesheet items for employees (users with employee role)
    if (user?.roles?.some(role => role.name === 'employee')) {
      baseItems.push(
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
        }
      );
    }

    // Add management items based on user roles (supervisor instead of manager)
    if (user?.roles?.some(role => ['supervisor', 'admin'].includes(role.name))) {
      baseItems.push(
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
          key: 'standin-management',
          icon: <SwapOutlined />,
          label: 'Stand-in Management',
        }
      );
    }

    if (user?.roles?.some(role => role.name === 'admin')) {
      baseItems.push(
        {
          key: 'timesheet-management',
          icon: <CheckSquareOutlined />,
          label: 'Timesheet Management',
        },
        {
          key: 'supervisor-management',
          icon: <UserSwitchOutlined />,
          label: 'Supervisor Management',
        },
        {
          key: 'employee-management',
          icon: <TeamOutlined />,
          label: 'Employee Management',
        }
      );
    }

    return baseItems;
  };

  const handleMenuClick = (e) => {
    const routeMap = {
      'home': '/home',
      'profile': '/profile',
      'timesheet': '/timesheet',
      'history': '/history',
      'approve': '/approve',
      'timesheet-management': '/timesheet-management',
      'supervisor-management': '/supervisor-management',
      'employee-management': '/employee-management',
      'standin-management': '/standin-management',
    };

    const route = routeMap[e.key];
    if (route) {
      navigate(route);
      setMobileDrawerVisible(false);
    }
  };

  // Get current selected key from location
  const getCurrentKey = () => {
    const path = location.pathname;
    if (path.startsWith('/supervisor-management')) return 'supervisor-management';
    if (path.startsWith('/employee-management')) return 'employee-management';
    if (path.startsWith('/approve')) return 'approve';
    if (path === '/timesheet') return 'timesheet';
    if (path === '/home') return 'home';
    if (path === '/profile') return 'profile';
    if (path === '/history') return 'history';
    if (path === '/timesheet-management') return 'timesheet-management';
    if (path === '/standin-management') return 'standin-management';
    return 'home';
  };

  const handleLogoutClick = () => {
    setLogoutModalVisible(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setLogoutModalVisible(false);
    message.success('Logged out successfully');
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setLogoutModalVisible(false);
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.full_name ? user.full_name.split(' ')[0] : user.name?.split(' ')[0] || 'User';
  };



  // Sidebar content component (reusable for both desktop and mobile)
  const SidebarContent = ({ isMobile = false }) => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%' 
    }}>
      {/* Company Logo/Brand */}
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        borderBottom: '1px solid #34495e',
        marginBottom: '20px'
      }}>
        <Title 
          level={4} 
          style={{ 
            color: '#b39f65', 
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.2',
            letterSpacing: '1px',
            whiteSpace: 'pre-line'
          }}
        >
          GOLDTECH RESOURCES
        </Title>
      </div>

      {/* User Info Section */}
      {user && (
        <div style={{
          padding: '0 20px 20px 20px',
          borderBottom: '1px solid #34495e',
          marginBottom: '20px'
        }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                size={32} 
                icon={<UserOutlined />} 
                style={{ 
                  backgroundColor: '#b39f65',
                  marginRight: 8
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  color: '#fff', 
                  fontSize: '13px', 
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {getUserDisplayName()}
                </div>
              </div>
            </div>
          </Space>
        </div>
      )}

      {/* Navigation Menu */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          theme="dark"
          selectedKeys={[getCurrentKey()]}
          mode="inline"
          items={getMenuItems()}
          onClick={handleMenuClick}
          style={{
            backgroundColor: 'transparent',
            border: 'none'
          }}
        />
      </div>

      {/* Logout Section */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #34495e',
        marginTop: 'auto'
      }}>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogoutClick}
          style={{
            color: '#fff',
            width: '100%',
            textAlign: 'left',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - FIXED, NO COLLAPSE (hidden on mobile) */}
      <Sider
        width={250}
        className="desktop-sidebar"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: '#2C3367',
          zIndex: 100
        }}
      >
        <SidebarContent />
      </Sider>

      {/* Mobile Hamburger Button (only visible on mobile) */}
      <Button
        type="primary"
        icon={<MenuOutlined />}
        onClick={() => setMobileDrawerVisible(true)}
        className="mobile-menu-button"
        size="large"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      />

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerVisible(false)}
        open={mobileDrawerVisible}
        width={280}
        styles={{
          body: { padding: 0, backgroundColor: '#2C3367' },
          header: { backgroundColor: '#2C3367', borderBottom: '1px solid #34495e' }
        }}
      >
        <SidebarContent isMobile={true} />
      </Drawer>

      {/* Logout Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Confirm Logout
          </Space>
        }
        open={logoutModalVisible}
        onOk={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        okText="Yes, Logout"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to logout from the system?</p>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: 0 }}>
          You will need to login again to access your timesheet.
        </p>
      </Modal>

      {/* Responsive styles */}
      <style jsx global>{`
        /* Hide mobile button on desktop */
        @media (min-width: 992px) {
          .mobile-menu-button {
            display: none !important;
          }
        }

        /* Hide desktop sidebar on mobile */
        @media (max-width: 991px) {
          .desktop-sidebar {
            display: none !important;
          }
          
          .mobile-menu-button {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;