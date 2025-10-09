import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, message } from 'antd';
import PageHeader from '../components/Common/PageHeader';
import TimesheetFilters from '../components/TimesheetManagement/TimesheetFilters';
import TimesheetManagementTable from '../components/TimesheetManagement/TimesheetManagementTable';
import ViewTimesheetModal from '../components/TimesheetManagement/ViewTimesheetModal';
import { useTimesheetManagement } from '../hooks/useTimesheetManagementStore';
import { timesheetManagementApi } from '../services/timesheetManagementApi';

function TimesheetManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const {
    timesheets,
    loading,
    filterOptions,
    loadTimesheets,
    loadFilterOptions,
    getTimesheetDetails
  } = useTimesheetManagement();

  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    department: 'all',
    location: 'all',
    month: 'all',
    year: 'all',
    supervisorId: 'all'
  });

  // View modal state
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [timesheetDetails, setTimesheetDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Load timesheets on mount and when filters change
  useEffect(() => {
    loadTimesheets(filters);
  }, [filters]);

  // Reload cascading filters when client or department changes
  useEffect(() => {
    const client = filters.client !== 'all' ? filters.client : null;
    const department = filters.department !== 'all' ? filters.department : null;
    loadFilterOptions(client, department);
  }, [filters.client, filters.department]);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTimesheets(timesheets);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = timesheets.filter(ts => 
        ts.employeeName.toLowerCase().includes(term) ||
        ts.employeeId?.toLowerCase().includes(term) ||
        ts.employeeLocation?.toLowerCase().includes(term)
      );
      setFilteredTimesheets(filtered);
    }
  }, [timesheets, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key, value) => {
    // Reset dependent filters when parent filter changes
    if (key === 'client') {
      setFilters(prev => ({
        ...prev,
        client: value,
        department: 'all',
        location: 'all'
      }));
    } else if (key === 'department') {
      setFilters(prev => ({
        ...prev,
        department: value,
        location: 'all'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };



  const handleView = async (timesheet) => {
    console.log('View timesheet:', timesheet);
    setSelectedTimesheet(timesheet);
    setViewModalVisible(true);
    setDetailsLoading(true);

    try {
      const details = await getTimesheetDetails(timesheet.timesheetId);
      setTimesheetDetails(details);
    } catch (error) {
      console.error('Error loading timesheet details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEdit = (timesheet) => {
    console.log('Edit timesheet:', timesheet);;
    // Navigate to admin edit page - note the updated path
    navigate(`/timesheet-management/edit/${timesheet.userId}?year=${timesheet.year}&month=${timesheet.month}`);
  };

  const handleDownload = async (timesheet) => {
    console.log('Download clicked for timesheet:', timesheet);
    console.log('Timesheet ID:', timesheet.timesheetId);
    
    try {
      messageApi.loading({ content: 'Generating PDF...', key: 'pdf-download' });
      
      const result = await timesheetManagementApi.downloadTimesheetPdf(timesheet.timesheetId);
      console.log('Download result:', result);
      
      messageApi.success({ content: 'PDF downloaded!', key: 'pdf-download', duration: 2 });
    } catch (error) {
      console.error('Download error:', error);
      messageApi.error({ content: 'Failed to download PDF: ' + error.message, key: 'pdf-download', duration: 3 });
    }
  };

  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setSelectedTimesheet(null);
    setTimesheetDetails(null);
  };

  const breadcrumbs = [
    { title: 'Administration' },
    { title: 'Timesheet Management' }
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Timesheet Management"
        breadcrumbs={breadcrumbs}
        description="View and manage all employee timesheets"
     
      />

      {/* Filters Component */}
      <TimesheetFilters
        filters={filters}
        filterOptions={filterOptions}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Timesheets Table */}
      <Card>
        <TimesheetManagementTable
          timesheets={filteredTimesheets}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDownload={handleDownload}
        />
      </Card>

      {/* View Timesheet Modal */}
      <ViewTimesheetModal
        visible={viewModalVisible}
        timesheet={selectedTimesheet}
        timesheetDetails={timesheetDetails}
        loading={detailsLoading}
        onClose={handleCloseViewModal}
 
      />
    </div>
  );
}

export default TimesheetManagementPage;