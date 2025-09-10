// src/components/TimesheetManagement/TimesheetManagementTable.jsx
import React from 'react';
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

function TimesheetManagementTable({ 
  timesheets, 
  loading, 
  onView,
  onDownloadPDF 
}) {
  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      width: 200,
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.employeeName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.employeeId}</div>
        </div>
      ),
    },
    {
      title: 'Project Site',
      dataIndex: 'projectSite',
      key: 'projectSite',
      width: 180,
      sorter: (a, b) => a.projectSite.localeCompare(b.projectSite),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      sorter: (a, b) => a.position.localeCompare(b.position),
    },
    {
      title: 'Assigned Manager',
      dataIndex: 'managerName',
      key: 'managerName',
      width: 150,
      sorter: (a, b) => a.managerName.localeCompare(b.managerName),
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
          <div style={{ fontWeight: 500 }}>{record.monthName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.year}</div>
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
        { text: 'Not Submitted', value: 'na' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Pending' },
          approved: { color: 'green', text: 'Approved' },
          rejected: { color: 'red', text: 'Rejected' },
          na: { color: 'default', text: 'Not Submitted' }
        };
        
        const config = statusConfig[status] || statusConfig.na;
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
          <div>
            <div style={{ fontSize: '12px' }}>
              {dayjs(record.submittedAt).format('MMM DD')}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {dayjs(record.submittedAt).format('YYYY')}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details & Manage">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => onView(record)}
              size="small"
            />
          </Tooltip>
          
          {record.status !== 'na' && (
            <>
              <Tooltip title="View PDF">
                <Button 
                  type="text" 
                  icon={<FileTextOutlined />} 
                  onClick={() => onDownloadPDF(record, 'view')}
                  size="small"
                  style={{ color: '#1890ff' }}
                />
              </Tooltip>
              
              <Tooltip title="Download PDF">
                <Button 
                  type="text" 
                  icon={<DownloadOutlined />} 
                  onClick={() => onDownloadPDF(record, 'download')}
                  size="small"
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
            </>
          )}
        </Space>
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
      scroll={{ x: 1200 }}
    />
  );
}

export default TimesheetManagementTable;