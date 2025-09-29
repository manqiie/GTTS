// src/pages/TimesheetReviewPage.jsx - Refactored Version
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  message,
  Spin,
  Typography
} from 'antd';
import { 
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import EmployeeInfoCard from '../../components/TimesheetReview/EmployeeInfoCard';
import DailyTimesheetTable from '../../components/TimesheetReview/DailyTimesheetTable';
import ApprovalSection from '../../components/TimesheetReview/ApprovalSection';
import ApprovalHistory from '../../components/TimesheetReview/ApprovalHistory';
import { useApproveTimesheetStore } from '../../hooks/useApproveTimesheetStore';

const { Text } = Typography;

function TimesheetReviewPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
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
      messageApi.error('Invalid approval decision');
      return;
    }

    if (decision === 'rejected' && (!comments || !comments.trim())) {
      console.warn('Comments required for rejection');
      messageApi.warning('Please provide comments for rejection');
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
        messageApi.success(`Timesheet ${decision} successfully`);
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
      messageApi.error(`Failed to ${decision} timesheet: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Document viewing functionality
  const handleViewDocument = async (document) => {
    try {
      console.log('Attempting to view document:', document);
      
      if (!document.id) {
        messageApi.error('Invalid document ID');
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
      messageApi.error('Failed to view document: ' + error.message);
    }
  };

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

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Approve Timesheets', path: '/approve' },
    { title: `Review - ${timesheet.employeeName}` }
  ];

  return (
    <div>
      {/* show antd message */}
      {contextHolder}  
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
      <EmployeeInfoCard timesheet={timesheet} />

      {/* Daily Timesheet Table */}
      <DailyTimesheetTable
        year={timesheet.year}
        month={timesheet.month}
        timesheetDetails={timesheetDetails}
        onViewDocument={handleViewDocument}
      />

      {/* Approval Section or History */}
      {timesheet.status === 'pending' ? (
        <ApprovalSection
          comments={comments}
          onCommentsChange={setComments}
          onApprove={() => handleApproval('approved')}
          onReject={() => handleApproval('rejected')}
          submitting={submitting}
        />
      ) : (
        <ApprovalHistory timesheet={timesheet} />
      )}
    </div>
  );
}

export default TimesheetReviewPage;