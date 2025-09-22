// Fixed TimesheetReviewPage.jsx - Fix reject button and document viewing
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
  Spin,
  Alert,
  Modal,
  Tooltip
} from 'antd';
import { 
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined
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
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTimesheetData();
  }, [timesheetId, timesheets.length]);

  const loadTimesheetData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading timesheet data for ID:', timesheetId);
      
      let foundTimesheet = null;
      try {
        const storedTimesheet = sessionStorage.getItem('currentTimesheet');
        if (storedTimesheet) {
          const parsedTimesheet = JSON.parse(storedTimesheet);
          if (parsedTimesheet.id && parsedTimesheet.id.toString() === timesheetId) {
            foundTimesheet = parsedTimesheet;
          }
        }
      } catch (e) {
        console.warn('Failed to parse timesheet from sessionStorage:', e);
      }

      if (!foundTimesheet && timesheets.length > 0) {
        foundTimesheet = timesheets.find(ts => 
          ts.id.toString() === timesheetId || ts.id === parseInt(timesheetId)
        );
      }

      if (!foundTimesheet) {
        setError(`Timesheet not found with ID: ${timesheetId}`);
        return;
      }

      setTimesheet(foundTimesheet);
      setComments(foundTimesheet.approvalComments || '');

      const details = await getTimesheetDetails(foundTimesheet.id);
      
      if (details) {
        setTimesheetDetails(details);
      } else {
        setTimesheetDetails({
          ...foundTimesheet,
          entries: {},
          totalDays: 0,
          workingDays: 0,
          leaveDays: 0,
          totalHours: 0
        });
      }

    } catch (error) {
      console.error('Error loading timesheet data:', error);
      setError('Failed to load timesheet data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (decision) => {
    console.log('HandleApproval called with decision:', decision);
    console.log('Comments:', comments);
    
    // Validate inputs
    if (!decision || (decision !== 'approved' && decision !== 'rejected')) {
      console.error('Invalid decision:', decision);
      message.error('Invalid approval decision');
      return;
    }

    if (decision === 'rejected' && (!comments || !comments.trim())) {
      console.warn('Comments required for rejection');
      message.warning('Please provide comments for rejection');
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('Processing approval with:', { 
        timesheetId, 
        decision, 
        comments: comments.trim() 
      });
      
      const success = await updateTimesheetApproval(timesheetId, decision, comments.trim());
      
      if (success) {
        message.success(`Timesheet ${decision} successfully`);
        sessionStorage.removeItem('currentTimesheet');
        
        // Add a small delay to ensure the message is visible
        setTimeout(() => {
          navigate('/approve');
        }, 1000);
      } else {
        throw new Error('Approval update returned false');
      }
    } catch (error) {
      console.error(`Error ${decision} timesheet:`, error);
      message.error(`Failed to ${decision} timesheet: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Document viewing functionality
  const handleViewDocument = async (document) => {
    try {
      console.log('Attempting to view document:', document);
      
      if (!document.id) {
        message.error('Invalid document ID');
        return;
      }

      // Call API to get document content
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/documents/${document.id}/download`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.content) {
        // Create a blob from base64 content
        const binaryString = atob(data.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType });
        
        // Create URL and open in new tab
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
      } else {
        throw new Error(data.message || 'Failed to load document content');
      }
      
    } catch (error) {
      console.error('Error viewing document:', error);
      message.error('Failed to view document: ' + error.message);
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
      width: 120,
      render: (_, record) => {
        if (!record.entry) return <span style={{ color: '#999' }}>-</span>;
        
        const hasDocuments = record.entry.supportingDocuments && record.entry.supportingDocuments.length > 0;
        const hasReference = record.entry.documentReference;
        
        if (hasDocuments) {
          return (
            <div>
              
              <div>
                {record.entry.supportingDocuments.map((doc, index) => (
                  <div key={index} style={{ marginBottom: 2 }}>
                    <Space size="small">
                      <Tooltip title="View Document">
                        <Button 
                          type="link" 
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDocument(doc)}
                        />
                      </Tooltip>
                   
                      <Text style={{ fontSize: '11px' }}>{doc.name}</Text>
                    </Space>
                  </div>
                ))}
              </div>
            </div>
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

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading timesheet data..." />
      </div>
    );
  }


  // Not found state
  if (!timesheet || !timesheetDetails) {
    return (
      <div>
        <PageHeader
          title="Timesheet Review - Not Found"
          breadcrumbs={[
            { title: 'Management' },
            { title: 'Approve Timesheets', path: '/approve' },
            { title: 'Not Found' }
          ]}
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/approve')}>
              Back to List
            </Button>
          }
        />
        
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Text>Timesheet not found</Text>
            <br />
            <Button onClick={() => navigate('/approve')} style={{ marginTop: 16 }}>
              Back to Approve Timesheets
            </Button>
          </div>
        </Card>
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
        description={`${timesheet.monthName} ${timesheet.year} • ${timesheet.projectSite || 'No Project Site'}`}
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
              <Descriptions.Item label="Employee ID">{timesheet.employeeId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Position">{timesheet.position || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Project Site">{timesheet.projectSite || 'N/A'}</Descriptions.Item>
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
              <Descriptions.Item label="Manager">{timesheet.managerName || 'N/A'}</Descriptions.Item>
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
              <Button onClick={() => navigate('/approve')}>
                Cancel
              </Button>
              <Button 
                danger
                icon={<CloseOutlined />}
                loading={submitting}
                onClick={() => {
                  console.log('Reject button clicked');
                  handleApproval('rejected');
                }}
                disabled={submitting}
              >
                Reject
              </Button>
              <Button 
                type="primary"
                icon={<CheckOutlined />}
                loading={submitting}
                onClick={() => {
                  console.log('Approve button clicked');
                  handleApproval('approved');
                }}
                disabled={submitting}
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