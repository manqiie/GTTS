// src/pages/TimesheetReviewPage.jsx - CLEAN VERSION
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Table,
  Tag, 
  Button, 
  Input, 
  message,
  Row,
  Col,
  Typography,
  Space,
  Spin
} from 'antd';
import { 
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '../components/Common/PageHeader';
import { useApproveTimesheetStore } from '../hooks/useApproveTimesheetStore';

const { TextArea } = Input;
const { Title, Text } = Typography;

function TimesheetReviewPage() {
  const navigate = useNavigate();
  const { timesheetId } = useParams();
  const {
    timesheets,
    loading: storeLoading,
    updateTimesheetApproval,
    getTimesheetDetails
  } = useApproveTimesheetStore();

  const [timesheet, setTimesheet] = useState(null);
  const [timesheetDetails, setTimesheetDetails] = useState(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeLoading && timesheets.length > 0) {
      loadTimesheetData();
    }
  }, [timesheetId, storeLoading, timesheets.length]);

  const loadTimesheetData = async () => {
    setLoading(true);
    try {
      const decodedId = decodeURIComponent(timesheetId);
      const foundTimesheet = timesheets.find(ts => ts.id === decodedId);
      
      if (!foundTimesheet) {
        message.error('Timesheet not found');
        navigate('/approve');
        return;
      }

      setTimesheet(foundTimesheet);
      setComments(foundTimesheet.approvalComments || '');

      const details = await getTimesheetDetails(decodedId);
      setTimesheetDetails(details);
    } catch (error) {
      message.error('Failed to load timesheet data');
      navigate('/approve');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (decision) => {
    if (!comments.trim() && decision === 'rejected') {
      message.warning('Please provide comments for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const decodedId = decodeURIComponent(timesheetId);
      const success = await updateTimesheetApproval(decodedId, decision, comments);
      if (success) {
        message.success(`Timesheet ${decision} successfully`);
        navigate('/approve');
      }
    } catch (error) {
      message.error(`Error ${decision} timesheet`);
    } finally {
      setSubmitting(false);
    }
  };

  const generateDailyTimesheetData = () => {
    if (!timesheet || !timesheetDetails) return [];
    
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
        day: day,
        dayName: date.format('ddd'),
        isWeekend,
        entry: entry || null
      });
    }
    return dailyData;
  };

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
          <div style={{ fontSize: '12px', color: record.isWeekend ? '#ccc' : '#666' }}>
            {record.dayName}
          </div>
        </div>
      ),
    },
    {
      title: 'Working Hours / Leave Type',
      key: 'workingHours',
      render: (_, record) => {
        if (!record.entry) {
          return record.isWeekend ? 
            <span style={{ color: '#999' }}>Weekend</span> : 
            <span style={{ color: '#ff4d4f' }}>No Entry</span>;
        }
        
        if (record.entry.type === 'working_hours') {
          const startTime = dayjs(record.entry.startTime, 'HH:mm').format('h:mm A');
          const endTime = dayjs(record.entry.endTime, 'HH:mm').format('h:mm A');
          return (
            <span style={{ color: '#1890ff', fontWeight: 500, fontSize: '15px' }}>
              {startTime} - {endTime}
            </span>
          );
        } else {
          const typeConfig = {
            'annual_leave': { text: 'Annual Leave', color: 'orange' },
            'medical_leave': { text: 'Medical Leave', color: 'red' },
            'off_in_lieu': { text: 'Off in Lieu', color: 'purple' },
            'childcare_leave': { text: 'Childcare Leave', color: 'green' },
            'hospitalization_leave': { text: 'Hospitalization Leave', color: 'volcano' },
            'maternity_leave': { text: 'Maternity Leave', color: 'magenta' },
            'paternity_leave': { text: 'Paternity Leave', color: 'cyan' },
            'compassionate_leave': { text: 'Compassionate Leave', color: 'gold' },
            'day_off': { text: 'Public Holiday', color: 'geekblue' }
          };
          
          const config = typeConfig[record.entry.type] || { text: record.entry.type, color: 'default' };
          return <Tag color={config.color}>{config.text}</Tag>;
        }
      },
    },
    {
      title: 'Notes',
      key: 'notes',
      render: (_, record) => {
        if (!record.entry || !record.entry.notes) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return <Text style={{ fontSize: '12px' }}>{record.entry.notes}</Text>;
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
            <Tag color="green" size="small">
              <FileTextOutlined /> {record.entry.supportingDocuments.length}
            </Tag>
          );
        } else if (hasReference) {
          return (
            <Tag color="blue" size="small">
              <FileTextOutlined /> Ref
            </Tag>
          );
        }
        
        return <span style={{ color: '#999' }}>-</span>;
      },
    },
  ];

  if (storeLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading timesheet data..." />
      </div>
    );
  }

  if (!timesheet || !timesheetDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Timesheet not found</Text>
        <br />
        <Button onClick={() => navigate('/approve')} style={{ marginTop: 16 }}>
          Back to Approve Timesheets
        </Button>
      </div>
    );
  }

  const dailyData = generateDailyTimesheetData();
  const statusConfig = {
    pending: { color: 'orange', text: 'Pending Review' },
    approved: { color: 'green', text: 'Approved' },
    rejected: { color: 'red', text: 'Rejected' }
  };
  const currentStatusConfig = statusConfig[timesheet.status] || statusConfig.pending;

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Approve Timesheets', path: '/approve' },
    { title: `Review - ${timesheet.employeeName}` }
  ];

  return (
    <div>
      <PageHeader
        title={`Review Timesheet - ${timesheet.employeeName}`}
        breadcrumbs={breadcrumbs}
        description={`${timesheet.monthName} ${timesheet.year} • ${timesheet.projectSite}`}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/approve')}>
            Back to List
          </Button>
        }
      />

      {/* Employee Information */}
      <Card style={{ marginBottom: 20 }}>
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
                {timesheet.monthName} {timesheet.year}
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

      {/* Daily Timesheet Table */}
      <Card style={{ marginBottom: 20 }}>
        <Title level={4} style={{ marginBottom: 16 }}>Daily Timesheet Details</Title>
        <Table
          columns={dailyColumns}
          dataSource={dailyData}
          pagination={false}
          size="middle"
          rowClassName={(record) => {
            if (record.isWeekend) return 'weekend-row';
            if (!record.entry) return 'no-entry-row';
            return '';
          }}
        />
      </Card>

      {/* Approval Section */}
      {timesheet.status === 'pending' && (
        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>Approval Decision</Title>
          
          <div style={{ marginBottom: 20 }}>
            <Text strong>Comments:</Text>
            <TextArea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments about the approval/rejection (required for rejection)..."
              style={{ marginTop: 8 }}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <Space size="middle">
              <Button onClick={() => navigate('/approve')}>Cancel</Button>
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
        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>Approval History</Title>
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
        </Card>
      )}
    </div>
  );
}

export default TimesheetReviewPage;