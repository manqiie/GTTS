// TimesheetHistoryPage.jsx - With Real API Integration
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Tooltip, Space, Row, Col, Spin, message } from 'antd';
import { EyeOutlined, ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/Common/PageHeader';

const API_BASE_URL = 'http://localhost:8080/api';

function TimesheetHistoryPage() {
  console.log('TimesheetHistoryPage - API version loading...');
  
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // API helper function
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: getHeaders(),
      ...options,
    };

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - redirecting to login');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load history function
  const loadHistory = async () => {
    console.log('Loading timesheet history from API...');
    setLoading(true);
    
    try {
      const response = await apiRequest('/timesheets/history');
      
      if (response.success && response.data) {
        console.log('History loaded successfully:', response.data);
        setHistory(response.data);
      } else {
        console.log('No history data received or API error');
        message.warning('Could not load history from server, showing test data');
      }
    } catch (error) {
      console.error('Error loading timesheet history:', error);
      message.error('Failed to load timesheet history, showing test data');
  
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('TimesheetHistoryPage - useEffect triggered');
    loadHistory();
  }, []);

  const handleViewTimesheet = (record) => {
    console.log('Viewing timesheet:', record);
    // Navigate to timesheet page for that specific month
    navigate(`/timesheet?year=${record.year}&month=${record.month}`);
  };

  const handleRefresh = () => {
    console.log('Refreshing history...');
    loadHistory();
  };

  // Define table columns
  const columns = [
    {
      title: 'Period',
      key: 'period',
      width: 120,
      sorter: (a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      },
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 500, fontSize: '14px' }}>
            {record.monthName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.year}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Submitted', value: 'submitted' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          submitted: { color: 'processing', text: 'Pending' },
          approved: { color: 'success', text: 'Approved' },
          rejected: { color: 'error', text: 'Rejected' }
        };
        
        const config = statusConfig[status] || statusConfig.submitted;
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 150,
      sorter: (a, b) => {
        if (!a.submittedAt && !b.submittedAt) return 0;
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        return dayjs(b.submittedAt).unix() - dayjs(a.submittedAt).unix();
      },
      render: (submittedAt) => {
        if (!submittedAt) return <span style={{ color: '#999' }}>-</span>;
        return (
          <div>
            <div style={{ fontSize: '13px' }}>
              {dayjs(submittedAt).format('MMM DD, YYYY')}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {dayjs(submittedAt).format('h:mm A')}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Processed By',
      dataIndex: 'approvedBy',
      key: 'approvedBy',
      width: 140,
      render: (approvedBy) => {
        if (!approvedBy) return <span style={{ color: '#999' }}>Pending</span>;
        return (
          <div style={{ fontSize: '13px' }}>
            {approvedBy}
          </div>
        );
      },
    },
    {
      title: 'Summary',
      key: 'summary',
      width: 160,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            <span style={{  fontWeight: 500 }}>{record.workingDays}</span>
            <span style={{ color: '#666' }}> working days</span>
          </div>
          <div>
            <span style={{fontWeight: 500 }}>{record.leaveDays}</span>
            <span style={{ color: '#666' }}> leave days</span>
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>{record.totalEntries}</span>
            <span style={{ color: '#666' }}> total entries</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Comments',
      dataIndex: 'approvalComments',
      key: 'approvalComments',
      ellipsis: {
        showTitle: false,
      },
      render: (comments) => {
        if (!comments) return <span style={{ color: '#999' }}>-</span>;
        return (
          <Tooltip title={comments} placement="topLeft">
            <span style={{ 
              fontSize: '12px',
              color: '#666',
              maxWidth: '200px',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {comments}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewTimesheet(record)}
        >
          View
        </Button>
      ),
    },
  ];

  const breadcrumbs = [
    { title: 'Timesheet' },
    { title: 'History' }
  ];

  console.log('TimesheetHistoryPage - About to render with history:', history);

  if (loading && history.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading history..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Timesheet History"
        breadcrumbs={breadcrumbs}
        description="View your previous timesheet submissions and their approval status"
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

      <Card>

        {/* History Table */}
        <Table
          columns={columns}
          dataSource={history}
          loading={loading}
          rowKey="timesheetId"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} submissions`,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10,
          }}
          scroll={{ x: 800 }}
          rowClassName={(record) => {
            if (record.status === 'rejected') return 'rejected-row';
            if (record.status === 'approved') return 'approved-row';
            return 'pending-row';
          }}
          locale={{
            emptyText: (
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
            )
          }}
        />
      </Card>

      {/* Custom styles for row highlighting */}
      <style jsx global>{`
        .approved-row {
          background-color: #f6ffed !important;
        }
        .approved-row:hover td {
          background-color: #f6ffed !important;
        }
        
        .rejected-row {
          background-color: #fff2f0 !important;
        }
        .rejected-row:hover td {
          background-color: #fff2f0 !important;
        }
        
        .pending-row {
          background-color: #f9f9f9 !important;
        }
        .pending-row:hover td {
          background-color: #f9f9f9 !important;
        }
      `}</style>
    </div>
  );
}

export default TimesheetHistoryPage;