// Fixed ApproveTimesheetPage.jsx - Better ID handling and navigation
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/Common/PageHeader';
import ApproveTimesheetTable from '../components/ApproveTimesheet/ApproveTimesheetTable';
import { useApproveTimesheetStore } from '../hooks/useApproveTimesheetStore';
import dayjs from 'dayjs';

const { Search } = Input;

function ApproveTimesheetPage() {
  const navigate = useNavigate();
  const {
    timesheets,
    loading,
    loadTimesheets,
    searchTimesheets
  } = useApproveTimesheetStore();

  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'pending',
    month: 'all',
    year: 'all',
  });

  useEffect(() => {
    const results = searchTimesheets(searchTerm, filters);
    setFilteredTimesheets(results);
  }, [timesheets, searchTerm, filters]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleView = (timesheet) => {
    console.log('ApproveTimesheetPage - handleView called with:', timesheet);
    
    // Validate timesheet object
    if (!timesheet || !timesheet.id) {
      console.error('Invalid timesheet object:', timesheet);
      message.error('Invalid timesheet data');
      return;
    }

    // Use the exact ID from the timesheet object (no encoding needed for numeric IDs)
    const timesheetId = timesheet.id;
    const targetPath = `/approve/review/${timesheetId}`;
    
    console.log('Navigating to:', targetPath);
    
    // Store timesheet data in sessionStorage for the review page
    try {
      sessionStorage.setItem('currentTimesheet', JSON.stringify(timesheet));
      console.log('Timesheet data stored in sessionStorage');
    } catch (error) {
      console.warn('Failed to store timesheet in sessionStorage:', error);
    }
    
    // Navigate to the review page
    navigate(targetPath);
  };

  const handleRefresh = () => {
    loadTimesheets();
    message.info('Timesheets refreshed');
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    const values = [...new Set(timesheets.map(ts => ts[key]))].sort();
    return values.map(value => ({ label: value, value }));
  };

  const monthOptions = [
    { label: 'All Months', value: 'all' },
    ...Array.from({ length: 12 }, (_, i) => ({
      label: dayjs().month(i).format('MMMM'),
      value: (i + 1).toString()
    }))
  ];

  const currentYear = dayjs().year();
  const yearOptions = [
    { label: 'All Years', value: 'all' },
    ...Array.from({ length: 3 }, (_, i) => ({
      label: (currentYear - i).toString(),
      value: (currentYear - i).toString()
    }))
  ];

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Approve Timesheets' }
  ];

  return (
    <div>
      <PageHeader
        title="Approve Timesheets"
        breadcrumbs={breadcrumbs}
        description="Review and approve employee timesheet submissions"
        extra={
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search by employee name..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Pending Approval', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' }
              ]}
            />
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Month"
              value={filters.month}
              onChange={(value) => handleFilterChange('month', value)}
              options={monthOptions}
            />
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Year"
              value={filters.year}
              onChange={(value) => handleFilterChange('year', value)}
              options={yearOptions}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <ApproveTimesheetTable
          timesheets={filteredTimesheets}
          loading={loading}
          onView={handleView}
        />
      </Card>
    </div>
  );
}

export default ApproveTimesheetPage;