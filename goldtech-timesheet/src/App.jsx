import React, { useState } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import Sidebar from './components/Sidebar';
import TimesheetPage from './pages/TimesheetPage';
import './App.css';

const { Content } = Layout;

/**
 * Main App Component
 * This is the root component that provides the overall layout structure
 * using Ant Design's Layout system
 */
function App() {
  const [collapsed, setCollapsed] = useState(false);

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
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        {/* Main Content Area */}
        <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
          <Content style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
            {/* Currently showing timesheet page, but this could be router-based later */}
            <TimesheetPage />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;