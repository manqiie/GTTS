// EmployeeTable.jsx 
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

function EmployeeTable({ 
  employees, 
  loading, 
  onView, 
  onToggleStatus 
}) {
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 120,
      sorter: (a, b) => {
        // Handle null/undefined employee_id for managers
        const aId = a.employee_id || '';
        const bId = b.employee_id || '';
        return aId.localeCompare(bId);
      },
      render: (text) => text || <span style={{ color: '#999' }}>N/A</span>
    },
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
        { text: 'Manager', value: 'manager' },
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
                role.name === 'manager' ? 'orange' : 
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
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      sorter: (a, b) => a.position.localeCompare(b.position),
    },
    {
      title: 'Project Site',
      dataIndex: 'project_site',
      key: 'project_site',
      sorter: (a, b) => {
        const aProject = a.project_site || '';
        const bProject = b.project_site || '';
        return aProject.localeCompare(bProject);
      },
      render: (text) => text || <span style={{ color: '#999' }}>N/A</span>
    },
    {
      title: 'Manager',
      dataIndex: 'manager_name',
      key: 'manager_name',
      sorter: (a, b) => {
        const aManager = a.manager_name || '';
        const bManager = b.manager_name || '';
        return aManager.localeCompare(bManager);
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
      title: 'Join Date',
      dataIndex: 'join_date',
      key: 'join_date',
      width: 120,
      sorter: (a, b) => dayjs(a.join_date).unix() - dayjs(b.join_date).unix(),
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
          
          <Tooltip title="Edit User">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/employee-management/edit/${record.id}`)}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title={`${record.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} User`}
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
      dataSource={employees}
      loading={loading}
      rowKey="id"
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} of ${total} users`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 20,
      }}
      scroll={{ x: 1400 }}
    />
  );
}

export default EmployeeTable;