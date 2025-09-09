// src/pages/EmployeeManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import EmployeeTable from '../components/Employee/EmployeeTable';
import EmployeeViewModal from '../components/Employee/EmployeeViewModal';
import { useEmployeeStore } from '../hooks/useEmployeeStore';

const { Search } = Input;

function EmployeeManagementPage() {
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
    position: 'all',
    projectSite: 'all'
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Update filtered employees when data or filters change
  useEffect(() => {
    const results = searchEmployees(searchTerm, filters);
    setFilteredEmployees(results);
  }, [employees, searchTerm, filters]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setViewModalVisible(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedEmployee = toggleEmployeeStatus(id);
      if (updatedEmployee) {
        message.success(
          `Employee ${updatedEmployee.status === 'active' ? 'activated' : 'deactivated'} successfully`
        );
      }
    } catch (error) {
      message.error('Failed to update employee status');
    }
  };

  const handleCreateNew = () => {
    navigate('/employee-management/create');
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    const values = [...new Set(employees.map(emp => emp[key]))].sort();
    return values.map(value => ({ label: value, value }));
  };

  const positionOptions = [
    { label: 'All Positions', value: 'all' },
    ...getUniqueValues('position')
  ];

  const projectSiteOptions = [
    { label: 'All Project Sites', value: 'all' },
    ...getUniqueValues('projectSite')
  ];

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Employee Management' }
  ];

  return (
    <div>
      <PageHeader
        title="Employee Management"
        breadcrumbs={breadcrumbs}
        description="Manage employee information, assignments, and status"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Add New Employee
          </Button>
        }
      />

      {/* Search and Filters */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by name, ID, position..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]}
            />
          </Col>
          
          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: '100%' }}
              value={filters.position}
              onChange={(value) => handleFilterChange('position', value)}
              options={positionOptions}
            />
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={filters.projectSite}
              onChange={(value) => handleFilterChange('projectSite', value)}
              options={projectSiteOptions}
            />
          </Col>
        </Row>
      </Card>

      {/* Employee Table */}
      <Card>
        <EmployeeTable
          employees={filteredEmployees}
          loading={loading}
          onView={handleView}
          onToggleStatus={handleToggleStatus}
        />
      </Card>

      {/* Employee View Modal */}
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