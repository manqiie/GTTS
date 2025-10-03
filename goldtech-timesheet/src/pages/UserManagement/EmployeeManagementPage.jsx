// EmployeeManagementPage.jsx - Updated with hierarchical filtering
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import EmployeeTable from '../../components/Employee/EmployeeTable';
import EmployeeViewModal from '../../components/Employee/EmployeeViewModal';
import { useEmployeeStore } from '../../hooks/useEmployeeStore';
import apiService from '../../services/apiService';

const { Search } = Input;

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
    position: 'all',
    department: 'all',
    location: 'all'
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Hierarchical filter options
  const [allLocations, setAllLocations] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);

  // Load initial filter data
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Update filtered employees when data or filters change
  useEffect(() => {
    const results = searchEmployees(searchTerm, filters);
    setFilteredEmployees(results);
  }, [employees, searchTerm, filters]);

  // Update dependent filters when higher level filters change
  useEffect(() => {
    updateDependentFilters();
  }, [filters.location, filters.department, filters.position]);

  const loadFilterOptions = async () => {
    try {
      // Load project sites
      const locationsResponse = await apiService.getLocations();
      if (locationsResponse.success) {
        setAllLocations(locationsResponse.data || []);
      }

      // Load all departments initially
      loadDepartments();
      loadPositions();
      loadRoles();
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadDepartments = async (location = null) => {
    try {
      const response = location 
        ? await apiService.getDepartmentsByLocation(location)
        : await apiService.getAllDepartments();
      
      if (response.success) {
        setFilteredDepartments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setFilteredDepartments([]);
    }
  };

  const loadPositions = async (location = null, department = null) => {
    try {
      const response = await apiService.getPositionsByFilters(location, department);
      if (response.success) {
        setFilteredPositions(response.data || []);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
      setFilteredPositions([]);
    }
  };

  const loadRoles = async (location = null, department = null) => {
    try {
      const response = await apiService.getRolesByFilters(location, department);
      if (response.success) {
        setFilteredRoles(response.data || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setFilteredRoles(['admin', 'supervisor', 'employee']);
    }
  };

  const updateDependentFilters = async () => {
    const { location, department } = filters;
    
    // Update departments based on project site
    if (location && location !== 'all') {
      await loadDepartments(location);
    } else {
      await loadDepartments();
    }

    // Update positions based on project site and department
    const locationFilter = location === 'all' ? null : location;
    const departmentFilter = department === 'all' ? null : department;
    await loadPositions(locationFilter, departmentFilter);
    await loadRoles(locationFilter, departmentFilter);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Clear dependent filters when parent filter changes
    if (key === 'location') {
      newFilters.department = 'all';
      newFilters.position = 'all';
      newFilters.role = 'all';
    } else if (key === 'department') {
      newFilters.position = 'all';
      newFilters.role = 'all';
    }
    
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      role: 'all',
      position: 'all',
      department: 'all',
      location: 'all'
    });
    loadFilterOptions(); // Reload all options
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

  // Generate filter options
  const locationOptions = [
    { label: 'All Location', value: 'all' },
    ...allLocations.map(site => ({ label: site, value: site }))
  ];

  const departmentOptions = [
    { label: 'All Departments', value: 'all' },
    ...filteredDepartments.map(dept => ({ label: dept, value: dept }))
  ];

  const positionOptions = [
    { label: 'All Positions', value: 'all' },
    ...filteredPositions.map(pos => ({ label: pos, value: pos }))
  ];

  const roleOptions = [
    { label: 'All Roles', value: 'all' },
    ...filteredRoles.map(role => ({ 
      label: role.charAt(0).toUpperCase() + role.slice(1), 
      value: role 
    }))
  ];

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

      {/* Hierarchical Search and Filters */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search by name, ID, email..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchTerm}
            />
          </Col>
          
          <Col xs={12} sm={6} md={3}>
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

          <Col xs={12} sm={6} md={3}>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClearFilters}
              title="Clear all filters"
            >
              Clear
            </Button>
          </Col>
        </Row>
        
        {/* Hierarchical Filters Row */}
        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by Location"
              value={filters.location}
              onChange={(value) => handleFilterChange('location', value)}
              options={locationOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          
          <Col xs={24} sm={12} md={6}>
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
              disabled={filteredDepartments.length === 0}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
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
              disabled={filteredPositions.length === 0}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by role"
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              options={roleOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              disabled={filteredRoles.length === 0}
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