import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Tag, Space, App, Modal, message, 
  Tooltip, Badge, Descriptions
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../../components/Common/PageHeader';
import { standinApi } from '../../services/standinApi';

function StandinManagementPage() {
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const [messageApi, contextHolder] = message.useMessage();
  const [standins, setStandins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStandin, setSelectedStandin] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [approvalHistoryVisible, setApprovalHistoryVisible] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState([]);

  useEffect(() => {
    loadStandins();
  }, []);

  const loadStandins = async () => {
    setLoading(true);
    try {
      const response = await standinApi.getMyStandins();
      if (response.success && response.data) {
        setStandins(response.data);
      }
    } catch (error) {
      messageApi.error('Failed to load stand-in delegations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/standin-management/create');
  };

  const handleEdit = (record) => {
    navigate(`/standin-management/edit/${record.id}`);
  };

  const handleViewDetails = (record) => {
    setSelectedStandin(record);
    setDetailsModalVisible(true);
  };

  const handleViewApprovals = async (record) => {
    try {
      const response = await standinApi.getStandinApprovals(record.id);
      if (response.success && response.data) {
        setApprovalHistory(response.data);
        setSelectedStandin(record);
        setApprovalHistoryVisible(true);
      }
    } catch (error) {
      messageApi.error('Failed to load approval history');
    }
  };

  const handleDelete = (record) => {
    console.log('Delete clicked for record:', record);
    console.log('Approvals count:', record.approvalsCount);
    
    // If has approvals, show informational modal only
    if (record.approvalsCount > 0) {
      modal.warning({
        title: 'Cannot Delete Stand-in Delegation',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>This stand-in delegation cannot be deleted because it has been used for {record.approvalsCount} approval(s).</p>
            <p style={{ marginTop: 12, color: '#666' }}>
              Stand-in records with approval history must be kept for audit purposes.
            </p>
          </div>
        ),
        okText: 'OK',
      });
      return;
    }

    // If no approvals, show confirmation to delete
    modal.confirm({
      title: 'Delete Stand-in Delegation',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete this stand-in delegation?</p>
          <p style={{ color: '#666', fontSize: '12px', marginTop: 8 }}>
            Stand-in: {record.standinName} ({dayjs(record.startDate).format('MMM DD')} - {dayjs(record.endDate).format('MMM DD, YYYY')})
          </p>
        </div>
      ),
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        console.log('Deleting stand-in with ID:', record.id);
        try {
          const response = await standinApi.deleteStandin(record.id);
          console.log('Delete response:', response);
          if (response.success) {
            messageApi.success('Stand-in delegation deleted successfully');
            loadStandins();
          }
        } catch (error) {
          console.error('Delete error:', error);
          messageApi.error(error.message || 'Failed to delete stand-in delegation');
        }
      }
    });
  };

  const getStatusTag = (status, isActive, isExpired) => {
    if (isExpired) {
      return <Tag color="default">Expired</Tag>;
    }
    if (isActive) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>;
    }
    if (status === 'INACTIVE') {
      return <Tag color="warning">Inactive</Tag>;
    }
    return <Tag color="processing" icon={<ClockCircleOutlined />}>Scheduled</Tag>;
  };

  const columns = [
    {
      title: 'Stand-in Person',
      key: 'standinPerson',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.standinName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.standinEmail}</div>
        </div>
      ),
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.startDate).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            to {dayjs(record.endDate).format('MMM DD, YYYY')}
          </div>
          {record.daysRemaining > 0 && record.isActive && (
            <Tag color="blue" size="small" style={{ marginTop: 4 }}>
              {record.daysRemaining} days remaining
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusTag(record.status, record.isActive, record.isExpired),
    },
    {
      title: 'Approvals Made',
      dataIndex: 'approvalsCount',
      key: 'approvalsCount',
      width: 140,
      render: (count) => (
        <Badge 
          count={count} 
          showZero 
          style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
        />
      ),
    },
    {
      title: 'Created',
      key: 'created',
      width: 130,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>{dayjs(record.createdAt).format('MMM DD, YYYY')}</div>
          <div style={{ color: '#666' }}>by {record.createdByName}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          {record.approvalsCount > 0 && (
            <Tooltip title="View Approvals">
              <Button 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleViewApprovals(record)}
              >
                {record.approvalsCount}
              </Button>
            </Tooltip>
          )}
          
          {!record.isExpired && (
            <Tooltip title="Edit">
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          
          <Tooltip 
            title={
              record.approvalsCount > 0 
                ? "Cannot delete (has approval history)" 
                : "Delete"
            }
          >
            <Button 
              size="small" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Stand-in Management' }
  ];

  return (
    <div>
      {contextHolder}  
      <PageHeader
        title="Stand-in Management"
        breadcrumbs={breadcrumbs}
        description="Manage supervisor stand-in delegations for timesheet approvals"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Stand-in
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          dataSource={standins}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} stand-in delegation(s)`,
            defaultPageSize: 10,
          }}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title="Stand-in Delegation Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedStandin && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Stand-in Person">
              {selectedStandin.standinName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedStandin.standinEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Original Supervisor">
              {selectedStandin.supervisorName}
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {dayjs(selectedStandin.startDate).format('MMMM DD, YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {dayjs(selectedStandin.endDate).format('MMMM DD, YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedStandin.status, selectedStandin.isActive, selectedStandin.isExpired)}
            </Descriptions.Item>
            <Descriptions.Item label="Approvals Made">
              <Badge count={selectedStandin.approvalsCount} showZero />
            </Descriptions.Item>
            {selectedStandin.reason && (
              <Descriptions.Item label="Reason">
                {selectedStandin.reason}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created">
              {dayjs(selectedStandin.createdAt).format('MMMM DD, YYYY HH:mm')} by {selectedStandin.createdByName}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Approval History Modal */}
      <Modal
        title={`Approval History - ${selectedStandin?.standinName}`}
        open={approvalHistoryVisible}
        onCancel={() => setApprovalHistoryVisible(false)}
        footer={[
          <Button key="close" onClick={() => setApprovalHistoryVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <Table
          dataSource={approvalHistory}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Employee',
              key: 'employee',
              render: (_, record) => (
                <div>
                  <div>{record.employeeName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{record.employeeId}</div>
                </div>
              ),
            },
            {
              title: 'Period',
              key: 'period',
              render: (_, record) => `${record.monthName} ${record.year}`,
            },
            {
              title: 'Action',
              dataIndex: 'action',
              key: 'action',
              render: (action) => (
                <Tag color={action === 'APPROVED' ? 'green' : 'red'}>
                  {action}
                </Tag>
              ),
            },
            {
              title: 'Date',
              dataIndex: 'actionAt',
              key: 'actionAt',
              render: (date) => dayjs(date).format('MMM DD, YYYY HH:mm'),
            },
          ]}
        />
      </Modal>
    </div>
  );
}

export default StandinManagementPage;