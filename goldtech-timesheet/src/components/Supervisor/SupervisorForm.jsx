// SupervisorTable.jsx
import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Tooltip } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  UserDeleteOutlined,
  UserAddOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function SupervisorTable({ 
  supervisors, 
  loading, 
  onView, 
  onToggleStatus 
}) {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Supervisor', value: 'supervisor' },
        { text: 'Employee', value: 'employee' },
      ],
      onFilter: (value, record) => {
        return record.roles && record.roles.some(role => role.name === value);
      },
      render: (roles) => (
        <div>
          {roles && roles.map(role => (
            <Tag 
              key={role.id} 
              color={
                role.name === 'admin' ? 'red' : 
                role.name === 'supervisor' ? 'orange' : 
                'blue'
              }
              style={{ marginBottom: 2 }}
            >
              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      sorter: (a, b) => {
        const aClient = a.client || '';
        const bClient = b.client || '';
        return aClient.localeCompare(bClient);
      },
      render: (text) => text || <span style={{ color: '#999' }}>N/A</span>
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: (a, b) => {
        const aDept = a.department || '';
        const bDept = b.department || '';
        return aDept.localeCompare(bDept);
      },
      render: (text) => text || <span style={{ color: '#999' }}>N/A</span>
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => {
        const aLocation = a.location || '';
        const bLocation = b.location || '';
        return aLocation.localeCompare(bLocation);
      },
      render: (text) => text || <span style={{ color: '#999' }}>N/A</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Active', value: 'ACTIVE' },
        { text: 'Inactive', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => onView(record)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Edit Supervisor">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/supervisor-management/edit/${record.id}`)}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title={`${record.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Supervisor`}
            description={`Are you sure you want to ${record.status === 'ACTIVE' ? 'deactivate' : 'activate'} ${record.full_name}?`}
            onConfirm={() => onToggleStatus(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title={record.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
              <Button 
                type="text" 
                icon={record.status === 'ACTIVE' ? <UserDeleteOutlined /> : <UserAddOutlined />}
                danger={record.status === 'ACTIVE'}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={supervisors}
      loading={loading}
      rowKey="id"
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} supervisors`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 10,
      }}
      scroll={{ x: 1200 }}
    />
  );
}

export default SupervisorTable;