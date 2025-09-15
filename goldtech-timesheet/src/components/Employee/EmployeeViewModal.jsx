// EmployeeViewModal.jsx (keeping filename but updating for user management)
import React from 'react';
import { Modal, Descriptions, Tag, Space } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BankOutlined,
  TeamOutlined,
  CalendarOutlined,
  CrownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

function EmployeeViewModal({ visible, employee, onClose }) {
  if (!employee) return null;

  const getRoleColor = (roleName) => {
    const colors = {
      admin: 'red',
      manager: 'orange',
      employee: 'blue'
    };
    return colors[roleName] || 'default';
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {employee.full_name} - User Details
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Employee ID" span={1}>
          {employee.employee_id || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Tag color={employee.status === 'ACTIVE' ? 'green' : 'red'}>
            {employee.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Full Name" span={2}>
          {employee.full_name}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><MailOutlined />Email</Space>} span={1}>
          {employee.email}
        </Descriptions.Item>
        <Descriptions.Item label={<Space><PhoneOutlined />Phone</Space>} span={1}>
          {employee.phone || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><CrownOutlined />Roles</Space>} span={2}>
          <Space wrap>
            {employee.roles && employee.roles.map(role => (
              <Tag key={role.id} color={getRoleColor(role.name)}>
                {role.description}
              </Tag>
            ))}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Position" span={1}>
          {employee.position}
        </Descriptions.Item>
        <Descriptions.Item label={<Space><BankOutlined />Department</Space>} span={1}>
          {employee.department}
        </Descriptions.Item>

        <Descriptions.Item label="Project Site" span={1}>
          {employee.project_site || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>
        <Descriptions.Item label="Company" span={1}>
          {employee.company || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><TeamOutlined />Manager</Space>} span={2}>
          {employee.manager_name || <span style={{ color: '#999' }}>N/A</span>}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><CalendarOutlined />Join Date</Space>} span={1}>
          {dayjs(employee.join_date).format('MMMM DD, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Login" span={1}>
          {employee.last_login_at ? 
            dayjs(employee.last_login_at).format('MMMM DD, YYYY HH:mm') : 
            <span style={{ color: '#999' }}>Never</span>
          }
        </Descriptions.Item>

        <Descriptions.Item label="Created" span={1}>
          {dayjs(employee.created_at).format('MMMM DD, YYYY HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated" span={1}>
          {dayjs(employee.updated_at).format('MMMM DD, YYYY HH:mm')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}

export default EmployeeViewModal;