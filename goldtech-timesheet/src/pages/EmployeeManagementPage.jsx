// EmployeeManagementPage.jsx - Updated with dynamic dropdown filters
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
    role: 'all',
    position: 'all',
    department: 'all',
    projectSite: 'all',
    company: 'all'
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
          `User ${updatedEmployee.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`
        );
      }
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const handleCreateNew = () => {
    navigate('/employee-management/create');
  };

  // Get unique values for dropdown filters - dynamically populated from user data
  const getUniqueValues = (key) => {
    const values = [...new Set(employees.map(emp => emp[key]).filter(Boolean))].sort();
    return values.map(value => ({ label: value, value }));
  };

  // Get role options from existing users
  const getRoleOptions = () => {
    const roleSet = new Set();
    employees.forEach(emp => {
      if (emp.roles) {
        emp.roles.forEach(role => roleSet.add(role.name));
      }
    });
    return Array.from(roleSet).map(role => ({ 
      label: role.charAt(0).toUpperCase() + role.slice(1), 
      value: role 
    }));
  };

  // Generate filter options based on actual user data
  const positionOptions = [
    { label: 'All Positions', value: 'all' },
    ...getUniqueValues('position')
  ];

  const departmentOptions = [
    { label: 'All Departments', value: 'all' },
    ...getUniqueValues('department')
  ];

  const projectSiteOptions = [
    { label: 'All Project Sites', value: 'all' },
    ...getUniqueValues('project_site')
  ];

  const companyOptions = [
    { label: 'All Companies', value: 'all' },
    ...getUniqueValues('company')
  ];

  const roleOptions = [
    { label: 'All Roles', value: 'all' },
    ...getRoleOptions()
  ];

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'User Management' }
  ];

  return (
    <div>
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

      {/* Search and Filters */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search by name, ID, email..."
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
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' }
              ]}
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              options={roleOptions}
            />
          </Col>
          
          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by position"
              value={filters.position}
              onChange={(value) => handleFilterChange('position', value)}
              options={positionOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          
          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by department"
              value={filters.department}
              onChange={(value) => handleFilterChange('department', value)}
              options={departmentOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by project site"
              value={filters.projectSite}
              onChange={(value) => handleFilterChange('projectSite', value)}
              options={projectSiteOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          
          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by company"
              value={filters.company}
              onChange={(value) => handleFilterChange('company', value)}
              options={companyOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
        </Row>
      </Card>

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