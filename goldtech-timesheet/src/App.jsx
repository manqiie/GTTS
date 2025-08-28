import React, { useState } from 'react';
import { Layout, ConfigProvider } from 'antd';
import Sidebar from './components/Sidebar';
import TimesheetPage from './pages/TimesheetPage';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import './App.css';

const { Content } = Layout;

/**
 * Main App Component
 * This is the root component that provides the overall layout structure
 * using Ant Design's Layout system with simple page routing
 */
function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('my-timesheet'); // Default page

  /**
   * Handle menu navigation
   */
  const handleMenuClick = (menuKey) => {
    setCurrentPage(menuKey);
  };

  /**
   * Render the current page based on selected menu item
   */
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'my-timesheet':
        return <TimesheetPage />;
      case 'employee-management':
        return <EmployeeManagementPage />;
      case 'home':
        return (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Welcome to GOLDTECH RESOURCES</h1>
            <p>Select a menu item to get started.</p>
          </div>
        );
      case 'profile':
        return (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>My Profile</h1>
            <p>Profile page coming soon...</p>
          </div>
        );
      case 'history':
        return (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Timesheet History</h1>
            <p>History page coming soon...</p>
          </div>
        );
      case 'approve':
        return (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Approve Timesheets</h1>
            <p>Approval page coming soon...</p>
          </div>
        );
      case 'clients':
        return (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Client Management</h1>
            <p>Client management page coming soon...</p>
          </div>
        );
      case 'invoices':
        return (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Invoice Generator</h1>
            <p>Invoice generator coming soon...</p>
          </div>
        );
      default:
        return <TimesheetPage />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#b39f65', // Golden color from your original design
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar Component - contains navigation menu */}
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          onMenuClick={handleMenuClick}
        />
                
        {/* Main Content Area */}
        <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
          <Content style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
            {/* Render current page based on menu selection */}
            {renderCurrentPage()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;