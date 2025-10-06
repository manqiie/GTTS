// EmployeeFilterPanel.jsx - Reusable Filter Component
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Search } = Input;

function EmployeeFilterPanel({ 
  searchTerm, 
  filters, 
  onSearchChange, 
  onFilterChange, 
  onClearFilters 
}) {
  // Hierarchical filter options
  const [allClients, setAllClients] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);

  // Load initial filter data
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Update dependent filters when higher level filters change
  useEffect(() => {
    updateDependentFilters();
  }, [filters.client, filters.department]);

  const loadFilterOptions = async () => {
    try {
      // Load clients
      const clientsResponse = await apiService.getClients();
      if (clientsResponse.success) {
        setAllClients(clientsResponse.data || []);
      }

      // Load all departments initially
      loadDepartments();
      loadLocations();
      loadPositions();
      loadRoles();
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadDepartments = async (client = null) => {
    try {
      const response = client 
        ? await apiService.getDepartmentsByClient(client)
        : await apiService.getAllDepartments();
      
      if (response.success) {
        setFilteredDepartments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setFilteredDepartments([]);
    }
  };

  const loadLocations = async (client = null, department = null) => {
    try {
      const response = await apiService.getLocationsByFilters(client, department);
      if (response.success) {
        setFilteredLocations(response.data || []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      setFilteredLocations([]);
    }
  };

  const loadPositions = async (client = null, department = null, location = null) => {
    try {
      const response = await apiService.getPositionsByFilters(client, department, location);
      if (response.success) {
        setFilteredPositions(response.data || []);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
      setFilteredPositions([]);
    }
  };

  const loadRoles = async (client = null, department = null) => {
    try {
      const response = await apiService.getRolesByFilters(client, department);
      if (response.success) {
        setFilteredRoles(response.data || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setFilteredRoles(['admin', 'supervisor', 'employee']);
    }
  };

  const updateDependentFilters = async () => {
    const { client, department } = filters;
    
    // Update departments based on client
    if (client && client !== 'all') {
      await loadDepartments(client);
    } else {
      await loadDepartments();
    }

    // Update locations based on client and department
    const clientFilter = client === 'all' ? null : client;
    const departmentFilter = department === 'all' ? null : department;
    await loadLocations(clientFilter, departmentFilter);
    await loadPositions(clientFilter, departmentFilter, null);
    await loadRoles(clientFilter, departmentFilter);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Clear dependent filters when parent filter changes
    if (key === 'client') {
      newFilters.department = 'all';
      newFilters.location = 'all';
      newFilters.position = 'all';
      newFilters.role = 'all';
    } else if (key === 'department') {
      newFilters.location = 'all';
      newFilters.position = 'all';
      newFilters.role = 'all';
    }
    
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    loadFilterOptions(); // Reload all options
    onClearFilters();
  };

  // Generate filter options
  const clientOptions = [
    { label: 'All Clients', value: 'all' },
    ...allClients.map(client => ({ label: client, value: client }))
  ];

  const departmentOptions = [
    { label: 'All Departments', value: 'all' },
    ...filteredDepartments.map(dept => ({ label: dept, value: dept }))
  ];

  const locationOptions = [
    { label: 'All Locations', value: 'all' },
    ...filteredLocations.map(loc => ({ label: loc, value: loc }))
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

  return (
    <Card style={{ marginBottom: 20 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="Search by name, ID, email, client..."
            allowClear
            onSearch={onSearchChange}
            onChange={(e) => onSearchChange(e.target.value)}
            value={searchTerm}
          />
        </Col>
        
        <Col xs={12} sm={6} md={6}>
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

        <Col xs={12} sm={6} md={3}>
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClear}
            title="Clear all filters"
            style={{ width: '100%' }}
          >
            Clear Filters
          </Button>
        </Col>



      </Row>
      
      {/* Hierarchical Filters Row - CLIENT -> DEPARTMENT -> LOCATION */}
      <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by client"
            value={filters.client}
            onChange={(value) => handleFilterChange('client', value)}
            options={clientOptions}
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
            placeholder="Filter by location"
            value={filters.location}
            onChange={(value) => handleFilterChange('location', value)}
            options={locationOptions}
            showSearch
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            disabled={filteredLocations.length === 0}
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
      </Row>

    </Card>
  );
}

export default EmployeeFilterPanel;