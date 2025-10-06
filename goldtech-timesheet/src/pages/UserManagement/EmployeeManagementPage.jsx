// EmployeeManagementPage.jsx - Refactored with Separate Filter Component
import React, { useState, useEffect } from 'react';
import { Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import EmployeeTable from '../../components/Employee/EmployeeTable';
import EmployeeViewModal from '../../components/Employee/EmployeeViewModal';
import EmployeeFilterPanel from '../../components/Employee/EmployeeFilterPanel';
import { useEmployeeStore } from '../../hooks/useEmployeeStore';

function EmployeeManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const {
    employees,
    loading,
    toggleEmployeeStatus,
    searchEmployees
  } = useEmployeeStore();

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    client: 'all',
    department: 'all',
    position: 'all',
    location: 'all'
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Update filtered employees when data or filters change
  useEffect(() => {
    const results = searchEmployees(searchTerm, filters);
    setFilteredEmployees(results);
  }, [employees, searchTerm, filters]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      role: 'all',
      client: 'all',
      department: 'all',
      position: 'all',
      location: 'all'
    });
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setViewModalVisible(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedEmployee = toggleEmployeeStatus(id);
      if (updatedEmployee) {
        messageApi.success(
          `User ${updatedEmployee.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`
        );
      }
    } catch (error) {
      messageApi.error('Failed to update user status');
    }
  };

  const handleCreateNew = () => {
    navigate('/employee-management/create');
  };

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'User Management' }
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="User Management"
        breadcrumbs={breadcrumbs}
        description="Manage user accounts, roles, and permissions"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Add New User
          </Button>
        }
      />

      {/* Filter Panel Component */}
      <EmployeeFilterPanel
        searchTerm={searchTerm}
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* User Table */}
      <Card>
        <EmployeeTable
          employees={filteredEmployees}
          loading={loading}
          onView={handleView}
          onToggleStatus={handleToggleStatus}
        />
      </Card>

      {/* User View Modal */}
      <EmployeeViewModal
        visible={viewModalVisible}
        employee={selectedEmployee}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
}

export default EmployeeManagementPage;