// Updated App.jsx - Add history route
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import TimesheetPage from './pages/TimesheetPage';
import TimesheetHistoryPage from './pages/TimesheetHistoryPage'; // New import
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import CreateEmployeePage from './pages/CreateEmployeePage';
import EditEmployeePage from './pages/EditEmployeePage';
import TimesheetManagementPage from './pages/TimesheetManagementPage';
import ApproveTimesheetPage from './pages/ApproveTimesheetPage';
import TimesheetReviewPage from './pages/TimesheetReviewPage';
import './App.css';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#b39f65',
        },
      }}
    >
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

function AppContent() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Routes>
      {/* Public Routes - Login Page */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes - All other pages require authentication */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout style={{ minHeight: '100vh' }}>
            <Sidebar 
              collapsed={collapsed} 
              setCollapsed={setCollapsed}
            />
            
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
              <Content style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
                <Routes>
                  {/* Default redirect to home */}
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  
                  {/* Basic user pages */}
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/timesheet" element={<TimesheetPage />} />
                  <Route path="/history" element={<TimesheetHistoryPage />} /> {/* New route */}
                  
                  {/* Manager/Admin Routes - Timesheet Approval */}
                  <Route path="/approve" element={
                    <ProtectedRoute requiredPermissions={['timesheet.approve']}>
                      <ApproveTimesheetPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/approve/review/:timesheetId" element={
                    <ProtectedRoute requiredPermissions={['timesheet.approve']}>
                      <TimesheetReviewPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes - Timesheet Management */}
                  <Route path="/timesheet-management" element={
                    <ProtectedRoute requiredPermissions={['timesheet.manage']}>
                      <TimesheetManagementPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes - Employee Management */}
                  <Route path="/employee-management" element={
                    <ProtectedRoute requiredPermissions={['employee.manage']}>
                      <EmployeeManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/employee-management/create" element={
                    <ProtectedRoute requiredPermissions={['employee.create']}>
                      <CreateEmployeePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/employee-management/edit/:id" element={
                    <ProtectedRoute requiredPermissions={['employee.edit']}>
                      <EditEmployeePage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes - System Administration */}
                  <Route path="/clients" element={
                    <ProtectedRoute requiredPermissions={['system.admin']}>
                      <ClientsPlaceholder />
                    </ProtectedRoute>
                  } />
                  <Route path="/invoices" element={
                    <ProtectedRoute requiredPermissions={['system.admin']}>
                      <InvoicesPlaceholder />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Content>
            </Layout>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

// Placeholder components for pages not yet implemented
const ClientsPlaceholder = () => (
  <div style={{ 
    padding: '50px', 
    textAlign: 'center',
    background: '#fff',
    borderRadius: '8px',
    margin: '20px 0'
  }}>
    <h1>Client Management</h1>
    <p style={{ color: '#666', marginBottom: '24px' }}>
      Manage client information, projects, and billing details.
    </p>
    <p style={{ color: '#999', fontSize: '14px' }}>
      This feature is coming soon...
    </p>
  </div>
);

const InvoicesPlaceholder = () => (
  <div style={{ 
    padding: '50px', 
    textAlign: 'center',
    background: '#fff',
    borderRadius: '8px',
    margin: '20px 0'
  }}>
    <h1>Invoice Generator</h1>
    <p style={{ color: '#666', marginBottom: '24px' }}>
      Generate invoices based on approved timesheets and project billing rates.
    </p>
    <p style={{ color: '#999', fontSize: '14px' }}>
      This feature is coming soon...
    </p>
  </div>
);

export default App;