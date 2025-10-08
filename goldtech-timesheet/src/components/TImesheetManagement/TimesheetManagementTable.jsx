// src/components/TimesheetManagement/TimesheetManagementTable.jsx
import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DownloadOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';

function TimesheetManagementTable({ 
  timesheets, 
  loading, 
  onView,
  onEdit,
  onDownload
}) {
  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      width: 160,
      fixed: 'left',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.employeeName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
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
          {record.version && record.version > 1 && (
            <Tooltip title={`This is version ${record.version} - Resubmitted after rejection`}>
              <Tag 
                color="purple" 
                size="small" 
                style={{ marginTop: 4, cursor: 'help' }}
              >
                v{record.version}
              </Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Client',
      key: 'client',
      width: 130,
      sorter: (a, b) => {
        const aClient = a.employeeClient || '';
        const bClient = b.employeeClient || '';
        return aClient.localeCompare(bClient);
      },
      render: (_, record) => (
        <div style={{ fontSize: '13px' }}>
          {record.employeeClient || <span style={{ color: '#999' }}>Not Set</span>}
        </div>
      ),
    },
    
    {
      title: 'Supervisor',
      key: 'supervisor',
      width: 140,
      sorter: (a, b) => {
        const aName = a.approvedBy || '';
        const bName = b.approvedBy || '';
        return aName.localeCompare(bName);
      },
      render: (_, record) => (
        <div style={{ fontSize: '13px' }}>
          {record.approvedBy || <span style={{ color: '#999' }}>Not Assigned</span>}
        </div>
      ),
    },
    {
      title: 'Summary',
      key: 'summary',
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            <span style={{ fontWeight: 500 }}>{record.stats?.workingDays || 0}</span>
            <span style={{ color: '#666' }}> work</span>
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>{record.stats?.leaveDays || 0}</span>
            <span style={{ color: '#666' }}> leave</span>
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
        { text: 'Pending', value: 'submitted' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          submitted: { color: 'orange', text: 'Pending' },
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
      width: 120,
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Timesheet">
            <Button 
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button 
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => onDownload(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={timesheets}
      loading={loading}
      rowKey={(record) => `${record.timesheetId}-${record.version || 1}`}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} timesheets`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 10,
      }}
      scroll={{ x: 1600 }}
      rowClassName={(record) => {
        if (record.status === 'submitted' || record.status === 'pending') {
          return 'pending-approval-row';
        }
        return '';
      }}
    />
  );
}

export default TimesheetManagementTable;