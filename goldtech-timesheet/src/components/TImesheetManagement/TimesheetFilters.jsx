import React from 'react';
import { Card, Row, Col, Input, Select } from 'antd';
import dayjs from 'dayjs';

const { Search } = Input;

function TimesheetFilters({
  filters,
  filterOptions,
  searchTerm,
  onSearchChange,
  onFilterChange
}) {
  // Generate month options
  const monthOptions = [
    { label: 'All Months', value: 'all' },
    ...Array.from({ length: 12 }, (_, i) => ({
      label: dayjs().month(i).format('MMMM'),
      value: (i + 1).toString()
    }))
  ];

  // Generate year options
  const currentYear = dayjs().year();
  const yearOptions = [
    { label: 'All Years', value: 'all' },
    ...Array.from({ length: 5 }, (_, i) => ({
      label: (currentYear - i).toString(),
      value: (currentYear - i).toString()
    }))
  ];

  // Generate client options
  const clientOptions = [
    { label: 'All Clients', value: 'all' },
    ...filterOptions.clients.map(client => ({
      label: client,
      value: client
    }))
  ];

  // Generate department options
  const departmentOptions = [
    { label: 'All Departments', value: 'all' },
    ...filterOptions.departments.map(dept => ({
      label: dept,
      value: dept
    }))
  ];

  // Generate location options
  const locationOptions = [
    { label: 'All Locations', value: 'all' },
    ...filterOptions.locations.map(loc => ({
      label: loc,
      value: loc
    }))
  ];

  // Generate supervisor options
  const supervisorOptions = [
    { label: 'All Supervisors', value: 'all' },
    ...filterOptions.supervisors.map(sup => ({
      label: sup.name,
      value: sup.id.toString()
    }))
  ];

  return (
    <Card style={{ marginBottom: 20 }}>
      <Row gutter={[16, 16]} align="middle">
        {/* First Row */}
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="Search by employee..."
            allowClear
            value={searchTerm}
            onSearch={onSearchChange}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </Col>


        <Col xs={12} sm={6} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Client"
            value={filters.client}
            onChange={(value) => onFilterChange('client', value)}
            options={clientOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Col>
        
        <Col xs={12} sm={6} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Department"
            value={filters.department}
            onChange={(value) => onFilterChange('department', value)}
            options={departmentOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            disabled={filters.client === 'all'}
          />
        </Col>
        
        <Col xs={12} sm={6} md={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Location"
            value={filters.location}
            onChange={(value) => onFilterChange('location', value)}
            options={locationOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Col>

        <Col xs={12} sm={6} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Month"
            value={filters.month}
            onChange={(value) => onFilterChange('month', value)}
            options={monthOptions}
          />
        </Col>

        {/* Second Row */}
        <Col xs={12} sm={6} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Year"
            value={filters.year}
            onChange={(value) => onFilterChange('year', value)}
            options={yearOptions}
          />
        </Col>
        
        <Col xs={12} sm={6} md={4}>
          <Select
            style={{ width: '100%' }}
            placeholder="Status"
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Pending', value: 'submitted' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' }
            ]}
          />
        </Col>
 
      </Row>
    </Card>
  );
}

export default TimesheetFilters;