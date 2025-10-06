// SupervisorViewModal.jsx
import React from 'react';
import { Modal, Descriptions, Tag, Space } from 'antd';
import { 
  UserOutlined, 
  MailOutlined,
  BankOutlined,
  CalendarOutlined,
  CrownOutlined,
  ShopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

function SupervisorViewModal({ visible, supervisor, onClose }) {
  if (!supervisor) return null;

  const getRoleColor = (roleName) => {
    const colors = {
      admin: 'red',
      supervisor: 'orange',
      employee: 'blue'
    };
    return colors[roleName] || 'default';
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {supervisor.full_name} - Supervisor Details
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Status" span={2}>
          <Tag color={supervisor.status === 'ACTIVE' ? 'green' : 'red'}>
            {supervisor.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Full Name" span={2}>
          {supervisor.full_name}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><MailOutlined />Email</Space>} span={2}>
          {supervisor.email}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><CrownOutlined />Roles</Space>} span={2}>
          <Space wrap>
            {supervisor.roles && supervisor.roles.map(role => (
              <Tag key={role.id} color={getRoleColor(role.name)}>
                {role.description}
              </Tag>
            ))}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label={<Space><ShopOutlined />Client</Space>} span={1}>
          {supervisor.client || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><BankOutlined />Department</Space>} span={1}>
          {supervisor.department || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>

        <Descriptions.Item label="Location" span={2}>
          {supervisor.location || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>

        <Descriptions.Item label="Last Login" span={1}>
          {supervisor.last_login_at ? 
            dayjs(supervisor.last_login_at).format('MMMM DD, YYYY HH:mm') : 
            <span style={{ color: '#999' }}>Never</span>
          }
        </Descriptions.Item>

        <Descriptions.Item label={<Space><CalendarOutlined />Created</Space>} span={1}>
          {dayjs(supervisor.created_at).format('MMMM DD, YYYY HH:mm')}
        </Descriptions.Item>

        <Descriptions.Item label="Last Updated" span={2}>
          {dayjs(supervisor.updated_at).format('MMMM DD, YYYY HH:mm')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}

export default SupervisorViewModal;