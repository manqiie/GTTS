// SupervisorFilterPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Search } = Input;

function SupervisorFilterPanel({ 
  searchTerm, 
  filters, 
  onSearchChange, 
  onFilterChange, 
  onClearFilters 
}) {
  const [allClients, setAllClients] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    updateDependentFilters();
  }, [filters.client, filters.department]);

  const loadFilterOptions = async () => {
    try {
      const clientsResponse = await apiService.getClients();
      if (clientsResponse.success) {
        setAllClients(clientsResponse.data || []);
      }

      loadDepartments();loadLocations();
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

  const updateDependentFilters = async () => {
    const { client, department } = filters;
    
    if (client && client !== 'all') {
      await loadDepartments(client);
    } else {
      await loadDepartments();
    }

    const clientFilter = client === 'all' ? null : client;
    const departmentFilter = department === 'all' ? null : department;
    await loadLocations(clientFilter, departmentFilter);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    if (key === 'client') {
      newFilters.department = 'all';
      newFilters.location = 'all';
    } else if (key === 'department') {
      newFilters.location = 'all';
    }
    
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    loadFilterOptions();
    onClearFilters();
  };

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

  return (
    <Card style={{ marginBottom: 20 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Search by name or email..."
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

        <Col xs={12} sm={6} md={4}>
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
      
      <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={8}>
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
        
        <Col xs={24} sm={12} md={8}>
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

        <Col xs={24} sm={12} md={8}>
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
      </Row>
    </Card>
  );
}

export default SupervisorFilterPanel;