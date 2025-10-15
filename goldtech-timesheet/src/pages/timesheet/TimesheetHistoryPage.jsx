// src/pages/timesheet/TimesheetHistoryPage.jsx - Refactored
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, message } from 'antd';
import { ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/Common/PageHeader';
import TimesheetHistoryTable from '../../components/TimesheetHistory/TimesheetHistoryTable';
import { useTimesheetHistoryStore } from '../../hooks/useTimesheetHistoryStore';

const { Search } = Input;

function TimesheetHistoryPage() {
  console.log('TimesheetHistoryPage - Refactored version loading...');
  
  const navigate = useNavigate();
  const {
    history,
    loading,
    loadHistory,
    searchHistory
  } = useTimesheetHistoryStore();

  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    month: 'all',
    year: 'all',
  });

  useEffect(() => {
    const results = searchHistory(searchTerm, filters);
    setFilteredHistory(results);
  }, [history, searchTerm, filters]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewTimesheet = (record) => {
    console.log('Viewing timesheet:', record);
    // Navigate to timesheet page for that specific month
    navigate(`/timesheet?year=${record.year}&month=${record.month}`);
  };

  // Filter options
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
    { title: 'Timesheet' },
    { title: 'History' }
  ];

  console.log('TimesheetHistoryPage - About to render with history:', history);

  return (
    <div>
      <PageHeader
        title="Timesheet History"
        breadcrumbs={breadcrumbs}
        description="View your previous timesheet submissions and their approval status"
      />

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by period or approver..."
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
                { label: 'Pending', value: 'submitted' },
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
        <TimesheetHistoryTable
          history={filteredHistory}
          loading={loading}
          onView={handleViewTimesheet}
        />

        {/* Empty state styling */}
        {!loading && filteredHistory.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#666' 
          }}>
            <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>No timesheet history found</div>
            <div style={{ fontSize: '14px' }}>
              Submit your first timesheet to see it appear here
            </div>
          </div>
        )}
      </Card>

      {/* Custom styles for row highlighting */}
      <style jsx global>{`
       
        
        .rejected-timesheet-row {
          background-color: #fff2f0 !important;
        }
        .rejected-timesheet-row:hover td {
          background-color: #ffe2dd !important;
        }
        
        /* Remove the pending-timesheet-row styles to use default Ant Design styling */
      `}</style>
    </div>
  );
}

export default TimesheetHistoryPage;