// src/components/Employee/EmployeeTable.jsx
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
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
      sorter: (a, b) => a.employeeId.localeCompare(b.employeeId),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
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
      dataIndex: 'projectSite',
      key: 'projectSite',
      sorter: (a, b) => a.projectSite.localeCompare(b.projectSite),
    },
    {
      title: 'Manager',
      dataIndex: 'managerName',
      key: 'managerName',
      sorter: (a, b) => a.managerName.localeCompare(b.managerName),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
      sorter: (a, b) => dayjs(a.joinDate).unix() - dayjs(b.joinDate).unix(),
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
          
          <Tooltip title="Edit Employee">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/employee-management/edit/${record.id}`)}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title={`${record.status === 'active' ? 'Deactivate' : 'Activate'} Employee`}
            description={`Are you sure you want to ${record.status === 'active' ? 'deactivate' : 'activate'} ${record.name}?`}
            onConfirm={() => onToggleStatus(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title={record.status === 'active' ? 'Deactivate' : 'Activate'}>
              <Button 
                type="text" 
                icon={record.status === 'active' ? <UserDeleteOutlined /> : <UserAddOutlined />}
                danger={record.status === 'active'}
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
          `${range[0]}-${range[1]} of ${total} employees`,
        pageSizeOptions: ['10', '20', '50', '100'],
        defaultPageSize: 20,
      }}
      scroll={{ x: 1200 }}
    />
  );
}

export default EmployeeTable;