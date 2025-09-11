// src/components/ApproveTimesheet/ApproveTimesheetTable.jsx
import React from 'react';
import { Table, Tag, Button } from 'antd';
import dayjs from 'dayjs';

function ApproveTimesheetTable({ 
  timesheets, 
  loading, 
  onView 
}) {
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
      title: 'Project Site',
      dataIndex: 'projectSite',
      key: 'projectSite',
      width: 160,
      sorter: (a, b) => a.projectSite.localeCompare(b.projectSite),
      ellipsis: true,
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      sorter: (a, b) => a.position.localeCompare(b.position),
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
      dataSource={timesheets}
      loading={loading}
      rowKey="id"
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} timesheets`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 20,
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