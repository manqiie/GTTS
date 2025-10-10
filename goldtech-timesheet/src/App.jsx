// Updated App.jsx - Add supervisor management routes
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Sidebar from './components/Common/Sidebar';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/auth/HomePage';
import ProfilePage from './pages/auth/ProfilePage';
import TimesheetPage from './pages/timesheet/TimesheetPage';
import TimesheetHistoryPage from './pages/timesheet/TimesheetHistoryPage'; 
import EmployeeManagementPage from './pages/UserManagement/EmployeeManagementPage';
import CreateEmployeePage from './pages/UserManagement/CreateEmployeePage';
import EditEmployeePage from './pages/UserManagement/EditEmployeePage';
import SupervisorManagementPage from './pages/SupervisorManagement/SupervisorManagementPage';
import CreateSupervisorPage from './pages/SupervisorManagement/CreateSupervisorPage';
import EditSupervisorPage from './pages/SupervisorManagement/EditSupervisorPage';
import TimesheetManagementPage from './pages/TimesheetManagementPage';
import ApproveTimesheetPage from './pages/TimesheetApproval/ApproveTimesheetPage';
import TimesheetReviewPage from './pages/TimesheetApproval/TimesheetReviewPage';
import AdminTimesheetEditPage from './pages/AdminTimesheetEditPage';
import StandinManagementPage from './pages/StandinManagement/StandinManagementPage';
import CreateStandinPage from './pages/StandinManagement/CreateStandinPage';
import EditStandinPage from './pages/StandinManagement/EditStandinPage';
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
                  <Route path="/history" element={<TimesheetHistoryPage />} />
                  
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

                  {/* Admin Route - Edit Employee Timesheet */}
                  <Route path="/timesheet-management/edit/:userId" element={
                    <ProtectedRoute requiredPermissions={['timesheet.manage']}>
                      <AdminTimesheetEditPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes - Supervisor Management */}
                  <Route path="/supervisor-management" element={
                    <ProtectedRoute requiredPermissions={['employee.manage']}>
                      <SupervisorManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/supervisor-management/create" element={
                    <ProtectedRoute requiredPermissions={['employee.create']}>
                      <CreateSupervisorPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/supervisor-management/edit/:id" element={
                    <ProtectedRoute requiredPermissions={['employee.edit']}>
                      <EditSupervisorPage />
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
                  {/* stand in  */}
                  <Route path="/standin-management" element={
                    <ProtectedRoute requiredPermissions={['timesheet.approve']}>
                      <StandinManagementPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/standin-management/create" element={
                    <ProtectedRoute requiredPermissions={['timesheet.approve']}>
                      <CreateStandinPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/standin-management/edit/:id" element={
                    <ProtectedRoute requiredPermissions={['timesheet.approve']}>
                      <EditStandinPage />
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