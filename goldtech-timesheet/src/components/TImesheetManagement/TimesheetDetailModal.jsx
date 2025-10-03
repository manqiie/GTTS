// src/components/TimesheetManagement/TimesheetDetailModal.jsx
import React, { useState } from 'react';
import { 
  Modal, 
  Descriptions, 
  Tag, 
  Space, 
  Button, 
  Select, 
  Input, 
  message,
  Divider,
  Card,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  FileTextOutlined,
  DownloadOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;

function TimesheetDetailModal({ 
  visible, 
  timesheet, 
  timesheetDetails,
  onClose, 
  onStatusUpdate,
  onDownloadPDF 
}) {
  const [newStatus, setNewStatus] = useState(null);
  const [comments, setComments] = useState('');
  const [updating, setUpdating] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible && timesheet) {
      setNewStatus(timesheet.status);
      setComments(timesheet.approvalComments || '');
    }
  }, [visible, timesheet]);

  if (!timesheet) return null;

  const handleStatusUpdate = async () => {
    if (newStatus === timesheet.status && comments === (timesheet.approvalComments || '')) {
      message.info('No changes to save');
      return;
    }

    setUpdating(true);
    try {
      const success = await onStatusUpdate(timesheet.id, newStatus, comments);
      if (success) {
        message.success('Timesheet status updated successfully');
        onClose();
      } else {
        message.error('Failed to update timesheet status');
      }
    } catch (error) {
      message.error('Error updating timesheet status');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    { label: 'Pending Review', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'orange', text: 'Pending Review' },
      approved: { color: 'green', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' },
      na: { color: 'default', text: 'Not Submitted' }
    };
    return configs[status] || configs.na;
  };

  const currentStatusConfig = getStatusConfig(timesheet.status);

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          Timesheet Details - {timesheet.employeeName}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        timesheet.status !== 'na' && (
          <Button 
            key="download" 
            icon={<DownloadOutlined />}
            onClick={() => onDownloadPDF(timesheet, 'download')}
          >
            Download PDF
          </Button>
        ),
        <Button 
          key="save" 
          type="primary" 
          icon={<SaveOutlined />}
          loading={updating}
          onClick={handleStatusUpdate}
          disabled={timesheet.status === 'na'}
        >
          Update Status
        </Button>
      ].filter(Boolean)}
    >
      {/* Employee Information */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Employee ID" span={1}>
            {timesheet.employeeId}
          </Descriptions.Item>
          <Descriptions.Item label="Employee Name" span={1}>
            {timesheet.employeeName}
          </Descriptions.Item>
          <Descriptions.Item label="Position" span={1}>
            {timesheet.position}
          </Descriptions.Item>
          <Descriptions.Item label="Location" span={1}>
            {timesheet.locationSite}
          </Descriptions.Item>
          <Descriptions.Item label="Manager" span={2}>
            {timesheet.managerName}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Timesheet Period & Status */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <Text strong>Period:</Text>
              <div style={{ marginTop: 4 }}>
                <Space>
                  <CalendarOutlined />
                  <span>{timesheet.monthName} {timesheet.year}</span>
                </Space>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong>Current Status:</Text>
              <div style={{ marginTop: 4 }}>
                <Tag color={currentStatusConfig.color}>
                  {currentStatusConfig.text}
                </Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Timesheet Summary */}
      {timesheetDetails && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>Timesheet Summary</Title>
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {timesheetDetails.totalDays}
                </div>
                <div style={{ color: '#666' }}>Total Days</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {timesheetDetails.workingDays}
                </div>
                <div style={{ color: '#666' }}>Working Days</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {timesheetDetails.leaveDays}
                </div>
                <div style={{ color: '#666' }}>Leave Days</div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Status Management */}
      {timesheet.status !== 'na' && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>Status Management</Title>
          
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Change Status:</Text>
              </div>
              <Select
                style={{ width: '100%' }}
                value={newStatus}
                onChange={setNewStatus}
                options={statusOptions}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Comments:</Text>
              </div>
              <TextArea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add comments about the approval/rejection..."
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Submission History */}
      <Card size="small">
        <Title level={5}>Submission History</Title>
        <Descriptions column={1} size="small">
          {timesheet.submittedAt && (
            <Descriptions.Item label="Submitted At">
              {dayjs(timesheet.submittedAt).format('MMMM DD, YYYY HH:mm')}
            </Descriptions.Item>
          )}
          {timesheet.approvedAt && (
            <Descriptions.Item label="Approved At">
              {dayjs(timesheet.approvedAt).format('MMMM DD, YYYY HH:mm')}
            </Descriptions.Item>
          )}
          {timesheet.approvedBy && (
            <Descriptions.Item label="Approved By">
              {timesheet.approvedBy}
            </Descriptions.Item>
          )}
          {timesheet.lastUpdated && (
            <Descriptions.Item label="Last Updated">
              {dayjs(timesheet.lastUpdated).format('MMMM DD, YYYY HH:mm')}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* PDF Actions */}
        {timesheet.status !== 'na' && (
          <div style={{ marginTop: 16 }}>
            <Divider />
            <div style={{ marginBottom: 8 }}>
              <Text strong>Timesheet Document:</Text>
            </div>
            <Space>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => onDownloadPDF(timesheet, 'view')}
              >
                View Detail
              </Button>
              <Button 
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => onDownloadPDF(timesheet, 'download')}
              >
                Download PDF
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </Modal>
  );
}

export default TimesheetDetailModal;