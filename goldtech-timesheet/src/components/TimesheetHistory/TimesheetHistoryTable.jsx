// src/components/TimesheetHistory/TimesheetHistoryTable.jsx
import React from 'react';
import { Table, Tag, Button, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function TimesheetHistoryTable({ 
  history, 
  loading, 
  onView 
}) {
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
        <div>
          {record.monthName} {record.year}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Pending', value: 'submitted' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          submitted: { color: 'orange', text: 'Pending' },
          approved: { color: 'green', text: 'Approved' },
          rejected: { color: 'red', text: 'Rejected' }
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
      title: 'Submitted',
      key: 'submitted',
      width: 130,
      sorter: (a, b) => {
        if (!a.submittedAt && !b.submittedAt) return 0;
        if (!a.submittedAt) return 1;
        if (!b.submittedAt) return -1;
        return dayjs(b.submittedAt).unix() - dayjs(a.submittedAt).unix();
      },
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
          onClick={() => onView(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      locale={{ emptyText: null }}
      dataSource={history}
      loading={loading}
      rowKey="timesheetId"
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} submissions`,
        pageSizeOptions: ['10', '20', '50'],
        defaultPageSize: 20,
      }}
      scroll={{ x: 800 }}
      rowClassName={(record) => {
        if (record.status === 'rejected') return 'rejected-timesheet-row';
        if (record.status === 'approved') return 'approved-timesheet-row';
        return 'pending-timesheet-row';
      }}
    />
  );
}

export default TimesheetHistoryTable;