// src/components/ApproveTimesheet/ApproveTimesheetTable.jsx - WITHOUT GREY BACKGROUND
import React from 'react';
import { Table, Tag, Button, Tooltip } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function ApproveTimesheetTable({ 
  timesheets, 
  loading, 
  onView 
}) {
  // Sort timesheets before rendering: pending first, then by submission time (newest first)
  const sortedTimesheets = [...timesheets].sort((a, b) => {
    // First, prioritize pending status at the top
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    
    // For all records, sort by submission time (newest first)
    if (!a.submittedAt && !b.submittedAt) return 0;
    if (!a.submittedAt) return 1;
    if (!b.submittedAt) return -1;
    return dayjs(b.submittedAt).unix() - dayjs(a.submittedAt).unix();
  });

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      width: 180,
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.employeeName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.employeeId}</div>
        </div>
      ),
    },
    {
      title: 'Period',
      key: 'period',
      width: 150,
      sorter: (a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        return (b.version || 1) - (a.version || 1);
      },
      render: (_, record) => (
        <div>
          <div>{record.monthName} {record.year}</div>
          {/* Show version badge for resubmissions */}
          {record.version && record.version > 1 && (
            <Tooltip title={`This is version ${record.version} - Resubmitted after rejection`}>
              <Tag 
                icon={<RedoOutlined />} 
                color="purple" 
                size="small" 
                style={{ marginTop: 4, cursor: 'help' }}
              >
                v{record.version} (Resubmitted)
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Summary',
      key: 'summary',
      width: 160,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            <span style={{ fontWeight: 500 }}>{record.workingDays || 0}</span>
            <span style={{ color: '#666' }}> working days</span>
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>{record.leaveDays || 0}</span>
            <span style={{ color: '#666' }}> leave days</span>
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>{record.totalEntries || 0}</span>
            <span style={{ color: '#666' }}> total entries</span>
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
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Pending' },
          approved: { color: 'green', text: 'Approved' },
          rejected: { color: 'red', text: 'Rejected' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Submitted',
      key: 'submitted',
      width: 130,
      sorter: (a, b) => {
        // First, prioritize pending status at the top
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        
        // For all records, sort by submission time (newest first)
        if (!a.submittedAt && !b.submittedAt) return 0;
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        return dayjs(b.submittedAt).unix() - dayjs(a.submittedAt).unix();
      },
      // Removed defaultSortOrder to eliminate grey background
      render: (_, record) => {
        if (!record.submittedAt) return <span style={{ color: '#999' }}>-</span>;
        return (
          <div style={{ fontSize: '12px' }}>
            {dayjs(record.submittedAt).format('MMM DD, YYYY')}
          </div>
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
          onClick={() => onView(record)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={sortedTimesheets}
      loading={loading}
      rowKey={(record) => `${record.id}-${record.version || 1}`}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} timesheets`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 10,
      }}
      scroll={{ x: 800 }}
      rowClassName={(record) => {
        if (record.status === 'pending') return 'pending-approval-row';
        return '';
      }}
    />
  );
}

export default ApproveTimesheetTable;