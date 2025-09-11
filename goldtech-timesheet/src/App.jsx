// Updated App.jsx - Add the new imports and routes
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import Sidebar from './components/Sidebar';
import TimesheetPage from './pages/TimesheetPage';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import CreateEmployeePage from './pages/CreateEmployeePage';
import EditEmployeePage from './pages/EditEmployeePage';
import TimesheetManagementPage from './pages/TimesheetManagementPage';
import ApproveTimesheetPage from './pages/ApproveTimesheetPage';
import TimesheetReviewPage from './pages/TimesheetReviewPage'; // Add this import
import './App.css';

const { Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#b39f65',
        },
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar 
            collapsed={collapsed} 
            setCollapsed={setCollapsed}
          />
                  
          <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
            <Content style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/timesheet" replace />} />
                <Route path="/home" element={<HomePlaceholder />} />
                <Route path="/profile" element={<ProfilePlaceholder />} />
                <Route path="/timesheet" element={<TimesheetPage />} />
                <Route path="/history" element={<HistoryPlaceholder />} />
                <Route path="/approve" element={<ApproveTimesheetPage />} />
                <Route path="/approve/review/:timesheetId" element={<TimesheetReviewPage />} /> {/* Add this route */}
                <Route path="/timesheet-management" element={<TimesheetManagementPage />} />
                <Route path="/employee-management" element={<EmployeeManagementPage />} />
                <Route path="/employee-management/create" element={<CreateEmployeePage />} />
                <Route path="/employee-management/edit/:id" element={<EditEmployeePage />} />
                <Route path="/clients" element={<ClientsPlaceholder />} />
                <Route path="/invoices" element={<InvoicesPlaceholder />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

// Placeholder components for other pages (keep existing ones)
const HomePlaceholder = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Welcome to GOLDTECH RESOURCES</h1>
    <p>Dashboard coming soon...</p>
  </div>
);

const ProfilePlaceholder = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>My Profile</h1>
    <p>Profile page coming soon...</p>
  </div>
);

const HistoryPlaceholder = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Timesheet History</h1>
    <p>History page coming soon...</p>
  </div>
);

const ClientsPlaceholder = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Client Management</h1>
    <p>Client management page coming soon...</p>
  </div>
);

const InvoicesPlaceholder = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Invoice Generator</h1>
    <p>Invoice generator coming soon...</p>
  </div>
);

export default App;