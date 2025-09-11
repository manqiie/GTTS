// src/components/ApproveTimesheet/TimesheetApprovalModal.jsx
import React, { useState } from 'react';
import { 
  Modal, 
  Descriptions, 
  Table,
  Tag, 
  Space, 
  Button, 
  Input, 
  message,
  Divider,
  Card,
  Row,
  Col,
  Typography,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;

function TimesheetApprovalModal({ 
  visible, 
  timesheet, 
  timesheetDetails,
  onClose, 
  onApproval
}) {
  const [decision, setDecision] = useState(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible && timesheet) {
      setDecision(null);
      setComments(timesheet.approvalComments || '');
    }
  }, [visible, timesheet]);

  if (!timesheet || !timesheetDetails) return null;

  const handleApproval = async (approvalDecision) => {
    if (!comments.trim() && approvalDecision === 'rejected') {
      message.warning('Please provide comments for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const success = await onApproval(timesheet.id, approvalDecision, comments);
      if (success) {
        onClose();
      }
    } catch (error) {
      message.error('Error processing approval');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate daily timesheet table data
  const generateDailyTimesheetData = () => {
    const year = timesheet.year;
    const month = timesheet.month;
    const daysInMonth = dayjs().year(year).month(month - 1).daysInMonth();
    const entries = timesheetDetails.entries || {};
    
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs().year(year).month(month - 1).date(day);
      const dateStr = date.format('YYYY-MM-DD');
      const entry = entries[dateStr];
      const isWeekend = date.day() === 0 || date.day() === 6;
      
      dailyData.push({
        key: dateStr,
        date: dateStr,
        day: day,
        dayName: date.format('ddd'),
        isWeekend,
        entry: entry || null
      });
    }
    
    return dailyData;
  };

  const dailyData = generateDailyTimesheetData();

  // Define columns for daily timesheet table
  const dailyColumns = [
    {
      title: 'Date',
      key: 'date',
      width: 80,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontWeight: record.isWeekend ? 'normal' : '500',
            color: record.isWeekend ? '#999' : '#262626'
          }}>
            {record.day}
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: record.isWeekend ? '#ccc' : '#666' 
          }}>
            {record.dayName}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      width: 120,
      render: (_, record) => {
        if (!record.entry) {
          return record.isWeekend ? 
            <Tag color="default" size="small">Weekend</Tag> : 
            <Tag color="red" size="small">No Entry</Tag>;
        }
        
        const typeConfig = {
          'working_hours': { text: 'Working', color: 'blue' },
          'annual_leave': { text: 'Annual Leave', color: 'orange' },
          'medical_leave': { text: 'Medical Leave', color: 'red' },
          'off_in_lieu': { text: 'Off in Lieu', color: 'purple' },
          'childcare_leave': { text: 'Childcare', color: 'green' },
          'hospitalization_leave': { text: 'Hospitalization', color: 'volcano' },
          'maternity_leave': { text: 'Maternity', color: 'magenta' },
          'paternity_leave': { text: 'Paternity', color: 'cyan' },
          'compassionate_leave': { text: 'Compassionate', color: 'gold' },
          'day_off': { text: 'Public Holiday', color: 'geekblue' }
        };
        
        const config = typeConfig[record.entry.type] || { text: record.entry.type, color: 'default' };
        
        return <Tag color={config.color} size="small">{config.text}</Tag>;
      },
    },
    {
      title: 'Working Hours',
      key: 'workingHours',
      width: 140,
      render: (_, record) => {
        if (!record.entry || record.entry.type !== 'working_hours') {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        const startTime = dayjs(record.entry.startTime, 'HH:mm').format('h:mm A');
        const endTime = dayjs(record.entry.endTime, 'HH:mm').format('h:mm A');
        
        return (
          <div style={{ fontSize: '12px' }}>
            <div><ClockCircleOutlined style={{ marginRight: 4 }} />{startTime}</div>
            <div style={{ color: '#666' }}>to {endTime}</div>
          </div>
        );
      },
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, record) => {
        if (!record.entry || !record.entry.notes) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        return (
          <Tooltip title={record.entry.notes}>
            <Text ellipsis style={{ maxWidth: 200 }}>
              {record.entry.notes}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Documents',
      key: 'documents',
      width: 100,
      render: (_, record) => {
        if (!record.entry) return <span style={{ color: '#999' }}>-</span>;
        
        const hasDocuments = record.entry.supportingDocuments && record.entry.supportingDocuments.length > 0;
        const hasReference = record.entry.documentReference;
        
        if (hasDocuments) {
          return (
            <Tooltip title={`${record.entry.supportingDocuments.length} document(s)`}>
              <Tag color="green" size="small">
                <FileTextOutlined /> {record.entry.supportingDocuments.length}
              </Tag>
            </Tooltip>
          );
        } else if (hasReference) {
          return (
            <Tooltip title={`References documents from ${dayjs(hasReference).format('MMM DD')}`}>
              <Tag color="blue" size="small">
                <FileTextOutlined /> Ref
              </Tag>
            </Tooltip>
          );
        }
        
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'orange', text: 'Pending Review' },
      approved: { color: 'green', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' }
    };
    return configs[status] || configs.pending;
  };

  const currentStatusConfig = getStatusConfig(timesheet.status);

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          Timesheet Approval - {timesheet.employeeName}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      style={{ top: 20 }}
    >
      {/* Employee and Period Information */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Employee">{timesheet.employeeName}</Descriptions.Item>
              <Descriptions.Item label="Employee ID">{timesheet.employeeId}</Descriptions.Item>
              <Descriptions.Item label="Position">{timesheet.position}</Descriptions.Item>
              <Descriptions.Item label="Project Site">{timesheet.projectSite}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Period">
                <Space>
                  <CalendarOutlined />
                  {timesheet.monthName} {timesheet.year}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={currentStatusConfig.color}>
                  {currentStatusConfig.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {timesheet.submittedAt ? 
                  dayjs(timesheet.submittedAt).format('MMMM DD, YYYY HH:mm') : 
                  'Not submitted'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Manager">{timesheet.managerName}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>Monthly Summary</Title>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {timesheetDetails.totalDays}
              </div>
              <div style={{ color: '#666' }}>Total Entries</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {timesheetDetails.workingDays}
              </div>
              <div style={{ color: '#666' }}>Working Days</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {timesheetDetails.leaveDays}
              </div>
              <div style={{ color: '#666' }}>Leave Days</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {timesheetDetails.totalHours || 0}h
              </div>
              <div style={{ color: '#666' }}>Total Hours</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Daily Timesheet Table */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5}>Daily Timesheet Details</Title>
        <Table
          columns={dailyColumns}
          dataSource={dailyData}
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
          rowClassName={(record) => {
            if (record.isWeekend) return 'weekend-row';
            if (!record.entry) return 'no-entry-row';
            return '';
          }}
        />
      </Card>

      {/* Approval Section */}
      {timesheet.status === 'pending' && (
        <Card size="small">
          <Title level={5}>Approval Decision</Title>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Comments:</Text>
            <TextArea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments about the approval/rejection (required for rejection)..."
              style={{ marginTop: 8 }}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button 
                danger
                icon={<CloseOutlined />}
                loading={submitting}
                onClick={() => handleApproval('rejected')}
              >
                Reject
              </Button>
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                loading={submitting}
                onClick={() => handleApproval('approved')}
              >
                Approve
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Already Processed Section */}
      {timesheet.status !== 'pending' && (
        <Card size="small">
          <Title level={5}>Approval History</Title>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Decision">
              <Tag color={currentStatusConfig.color}>
                {currentStatusConfig.text}
              </Tag>
            </Descriptions.Item>
            {timesheet.approvedBy && (
              <Descriptions.Item label="Processed By">
                {timesheet.approvedBy}
              </Descriptions.Item>
            )}
            {timesheet.approvedAt && (
              <Descriptions.Item label="Processed At">
                {dayjs(timesheet.approvedAt).format('MMMM DD, YYYY HH:mm')}
              </Descriptions.Item>
            )}
            {timesheet.approvalComments && (
              <Descriptions.Item label="Comments">
                {timesheet.approvalComments}
              </Descriptions.Item>
            )}
          </Descriptions>
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </Card>
      )}
    </Modal>
  );
}

export default TimesheetApprovalModal;