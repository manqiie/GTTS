// src/components/Employee/EmployeeViewModal.jsx
import React from 'react';
import { Modal, Descriptions, Tag, Space } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BankOutlined,
  TeamOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

function EmployeeViewModal({ visible, employee, onClose }) {
  if (!employee) return null;

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          {employee.name} - Employee Details
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Employee ID" span={1}>
          {employee.employeeId}
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Tag color={employee.status === 'active' ? 'green' : 'red'}>
            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Full Name" span={2}>
          {employee.name}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><MailOutlined />Email</Space>} span={1}>
          {employee.email}
        </Descriptions.Item>
        <Descriptions.Item label={<Space><PhoneOutlined />Phone</Space>} span={1}>
          {employee.phone}
        </Descriptions.Item>

        <Descriptions.Item label="Position" span={1}>
          {employee.position}
        </Descriptions.Item>
        <Descriptions.Item label={<Space><BankOutlined />Department</Space>} span={1}>
          {employee.department}
        </Descriptions.Item>

        <Descriptions.Item label="Project Site" span={2}>
          {employee.projectSite}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><TeamOutlined />Manager</Space>} span={2}>
          {employee.managerName}
        </Descriptions.Item>

        <Descriptions.Item label={<Space><CalendarOutlined />Join Date</Space>} span={1}>
          {dayjs(employee.joinDate).format('MMMM DD, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated" span={1}>
          {dayjs(employee.updatedAt).format('MMMM DD, YYYY HH:mm')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}

export default EmployeeViewModal;