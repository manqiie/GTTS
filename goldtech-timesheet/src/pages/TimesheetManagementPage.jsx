// src/pages/TimesheetManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, Button, Space, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import PageHeader from '../components/Common/PageHeader';
import TimesheetManagementTable from '../components/TimesheetManagement/TimesheetManagementTable';
import TimesheetDetailModal from '../components/TimesheetManagement/TimesheetDetailModal';
import { useTimesheetManagementStore } from '../hooks/useTimesheetManagementStore';
import dayjs from 'dayjs';

const { Search } = Input;

function TimesheetManagementPage() {
  const {
    timesheets,
    loading,
    loadTimesheets,
    updateTimesheetStatus,
    searchTimesheets,
    getTimesheetDetails
  } = useTimesheetManagementStore();

  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    projectSite: 'all',
    month: 'all',
    year: 'all'
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [selectedTimesheetDetails, setSelectedTimesheetDetails] = useState(null);

  // Update filtered timesheets when data or filters change
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
    setSelectedTimesheet(timesheet);
    
    // Get detailed timesheet data
    const details = getTimesheetDetails(timesheet.id);
    setSelectedTimesheetDetails(details);
    
    setDetailModalVisible(true);
  };

  const handleStatusUpdate = async (timesheetId, newStatus, comments) => {
    try {
      const success = await updateTimesheetStatus(timesheetId, newStatus, comments);
      if (success) {
        // Refresh the selected timesheet if it's the one being updated
        if (selectedTimesheet && selectedTimesheet.id === timesheetId) {
          const updatedTimesheet = timesheets.find(ts => ts.id === timesheetId);
          setSelectedTimesheet(updatedTimesheet);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating timesheet status:', error);
      return false;
    }
  };

  const handleDownloadPDF = async (timesheet, action) => {
    try {
      // In real implementation, this would call backend API
      // For now, simulate the API call
      message.loading(`${action === 'view' ? 'Opening' : 'Downloading'} PDF...`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get timesheet details for PDF generation
      const details = getTimesheetDetails(timesheet.id);
      
      if (!details) {
        message.error('Timesheet data not found');
        return;
      }

      // This would be the actual API call to backend:
      // const response = await fetch(`/api/timesheets/${timesheet.id}/pdf?action=${action}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(details)
      // });
      
      // For demo purposes, simulate the PDF action
      if (action === 'view') {
        // In real implementation, this would open PDF in new tab
        window.open(`/api/timesheets/${timesheet.id}/pdf`, '_blank');
        message.success('PDF opened in new tab');
      } else {
        // In real implementation, this would trigger download
        const filename = `timesheet_${timesheet.employeeName}_${timesheet.monthName}_${timesheet.year}.pdf`;
        // simulateDownload(filename);
        message.success(`PDF downloaded: ${filename}`);
      }
    } catch (error) {
      console.error('Error handling PDF:', error);
      message.error(`Failed to ${action} PDF`);
    }
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

  const projectSiteOptions = [
    { label: 'All Project Sites', value: 'all' },
    ...getUniqueValues('projectSite')
  ];

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
    ...Array.from({ length: 3 }, (_, i) => ({
      label: (currentYear - i).toString(),
      value: (currentYear - i).toString()
    }))
  ];

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Timesheet Management' }
  ];

  return (
    <div>
      <PageHeader
        title="Timesheet Management"
        breadcrumbs={breadcrumbs}
        description="Review and manage employee timesheets, approve submissions, and generate reports"
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

      {/* Search and Filters */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
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
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
                { label: 'Not Submitted', value: 'na' }
              ]}
            />
          </Col>
          
          <Col xs={12} sm={6} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Project Site"
              value={filters.projectSite}
              onChange={(value) => handleFilterChange('projectSite', value)}
              options={projectSiteOptions}
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

      {/* Timesheet Management Table */}
      <Card>
        <TimesheetManagementTable
          timesheets={filteredTimesheets}
          loading={loading}
          onView={handleView}
          onDownloadPDF={handleDownloadPDF}
        />
      </Card>

      {/* Timesheet Detail Modal */}
      <TimesheetDetailModal
        visible={detailModalVisible}
        timesheet={selectedTimesheet}
        timesheetDetails={selectedTimesheetDetails}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedTimesheet(null);
          setSelectedTimesheetDetails(null);
        }}
        onStatusUpdate={handleStatusUpdate}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
}

export default TimesheetManagementPage;