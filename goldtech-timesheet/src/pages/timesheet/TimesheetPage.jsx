// Updated TimesheetPage.jsx - Handle delete operations properly
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, message, Spin, Alert } from 'antd';
import { SaveOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TimesheetHeader from '../../components/Timesheet/TimesheetHeader';
import TimesheetCalendar from '../../components/Timesheet/TimesheetCalendar';
import DayEntryModal from '../../components/Timesheet/DayEntryModal';
import BulkSelectionModal from '../../components/Timesheet/BulkSelectionModal';
import { useTimesheetStore } from '../../hooks/useTimesheetStore';
import dayjs from 'dayjs';

const { Title } = Typography;

/**
 * Complete TimesheetPage with Draft Mode and Fixed Delete Functionality
 */
function TimesheetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get year/month from URL params or default to current
  const [selectedYear, setSelectedYear] = useState(
    parseInt(searchParams.get('year')) || dayjs().year()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    parseInt(searchParams.get('month')) || dayjs().month() + 1
  );
  
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  
  // Updated hook with draft functionality and full timesheet data
  const {
    entries,
    timesheetData, // Full timesheet data including rejection comments
    customHours,
    defaultHours,
    loading,
    timesheetStatus,
    availableMonths,
    canSubmit,
    canResubmit,
    canEdit,
    showSubmitButton,
    submitButtonText,
    hasUnsavedChanges,
    saveEntry,
    saveBulkEntries,
    deleteEntry, // Fixed delete method
    saveDraft, // New method
    submitTimesheet,
    setDefaultHours: updateDefaultHours,
    addCustomHours,
    removeCustomHours,
    clearMonth,
    getMonthStats,
    loadTimesheetData,
    loadAvailableMonths,
    checkSubmissionEligibility
  } = useTimesheetStore(selectedYear, selectedMonth);

  // Check if this is a current/available month (for editing) vs historical month (view-only)
  const isCurrentOrAvailableMonth = () => {
    return availableMonths.some(am => am.year === selectedYear && am.month === selectedMonth);
  };

  // Check if this is a historical timesheet that can be viewed
  const isHistoricalTimesheet = () => {
    const currentDate = dayjs();
    const timesheetDate = dayjs().year(selectedYear).month(selectedMonth - 1);
    
    return timesheetDate.isBefore(currentDate) && 
           timesheetDate.isAfter(currentDate.subtract(2, 'year'));
  };

  // Determine the viewing mode
  const getViewingMode = () => {
    if (isCurrentOrAvailableMonth()) {
      return 'editable';
    } else if (isHistoricalTimesheet()) {
      return 'historical';
    } else {
      return 'unavailable';
    }
  };

  const viewingMode = getViewingMode();

  // Update URL when year/month changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('year', selectedYear.toString());
    newSearchParams.set('month', selectedMonth.toString());
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  }, [selectedYear, selectedMonth, navigate]);

  /**
   * Handle single day selection for editing/viewing
   */
  const handleDayClick = (date) => {
    if (viewingMode !== 'editable' || !canEdit) {
      // For historical or non-editable timesheets, show read-only modal
      setSelectedDate(date);
      setSelectedDates([]);
      setModalVisible(true);
      return;
    }

    // For editable timesheets
    setSelectedDate(date);
    setSelectedDates([]);
    setModalVisible(true);
  };

  /**
   * Handle bulk day selection (only for editable timesheets)
   */
  const handleBulkSelection = (dates) => {
    if (viewingMode !== 'editable' || !canEdit) {
      message.info('This timesheet is in view-only mode');
      return;
    }

    if (dates.length > 1) {
      setSelectedDates(dates);
      setSelectedDate(null);
      setBulkModalVisible(true);
    } else if (dates.length === 1) {
      handleDayClick(dates[0]);
    }
  };

  /**
   * Handle save entry to draft (no API call) - UPDATED to handle deletions
   */
  const handleSaveEntry = (entryData) => {
    if (viewingMode !== 'editable') {
      message.warning('This timesheet cannot be edited');
      return;
    }

    try {
      // Check if this is a delete operation
      if (entryData.type === 'DELETE' || entryData.isDelete) {
        // Call delete function instead of save
        deleteEntry(entryData.date);
        setModalVisible(false);
        message.success('Entry deleted from draft');
      } else {
        // Normal save operation
        saveEntry(entryData);
        setModalVisible(false);
        message.success('Entry saved to draft');
      }
    } catch (error) {
      console.error('Error handling entry:', error);
    }
  };

  /**
   * Handle save bulk entries to draft (no API call)
   */
  const handleSaveBulkEntries = (entriesArray) => {
    if (viewingMode !== 'editable') {
      message.warning('This timesheet cannot be edited');
      return;
    }

    try {
      saveBulkEntries(entriesArray);
      setBulkModalVisible(false);
      message.success(`${entriesArray.length} entries saved to draft`);
    } catch (error) {
      console.error('Error saving bulk entries:', error);
    }
  };

  /**
   * Handle save draft to database
   */
  const handleSaveDraft = async () => {
    try {
      await saveDraft();
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  /**
   * Handle timesheet submission (save + submit)
   */
  const handleSubmitForApproval = async () => {
    try {
      await submitTimesheet();
      message.success('Timesheet submitted successfully!');
      
      // Refresh available months after submission
      await loadAvailableMonths();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
    }
  };

  /**
   * Handle refresh timesheet data
   */
  const handleRefresh = async () => {
    try {
      await loadTimesheetData();
      if (viewingMode === 'editable') {
        await loadAvailableMonths();
        await checkSubmissionEligibility(selectedYear, selectedMonth);
      }
      message.success('Timesheet data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  /**
   * Handle year/month changes
   */
  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  /**
   * Get appropriate header props based on viewing mode
   */
  const getHeaderProps = () => {
    if (viewingMode === 'editable') {
      return {
        year: selectedYear,
        month: selectedMonth,
        status: timesheetStatus,
        availableMonths: availableMonths,
        onYearChange: handleYearChange,
        onMonthChange: handleMonthChange,
        canSubmit: canSubmit,
        canResubmit: canResubmit,
        showSubmitButton: showSubmitButton
      };
    } else {
      // For historical timesheets, create a simple month selector
      return {
        year: selectedYear,
        month: selectedMonth,
        status: timesheetStatus,
        availableMonths: [],
        onYearChange: handleYearChange,
        onMonthChange: handleMonthChange,
        canSubmit: false,
        canResubmit: false,
        showSubmitButton: false
      };
    }
  };

  /**
   * Get status-based alert message with rejection comments
   */
  const getStatusAlert = () => {
    if (timesheetStatus === 'rejected') {
      // Get rejection comments from timesheet data
      const rejectionComments = timesheetData?.approvalComments || 
                               timesheetData?.rejectionComments ||
                               timesheetData?.comments;
      
      return (
        <Alert
          message="Timesheet Rejected"
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                This timesheet was rejected. Please review the comments below and resubmit.
                <div style={{ 
                    fontWeight: 'bold', 
                    color: '#cf1322', 
                    fontSize: '13px', 
                    marginTop:'10px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    Supervisor Comments:
                  </div>
                {rejectionComments}
              </div>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          closable={false}
        />
      );
    }

    return null;
  };

  // Show loading spinner while data is loading
  if (loading && Object.keys(entries).length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading timesheet..." />
      </div>
    );
  }

  // Show error only if timesheet is completely unavailable
  if (viewingMode === 'unavailable') {
    const currentAvailable = availableMonths.find(am => am.isCurrentMonth);
    return (
      <div>
        <TimesheetHeader {...getHeaderProps()} />
        
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Title level={3} style={{ color: '#999' }}>
              Timesheet Not Available
            </Title>
            <p style={{ color: '#666', marginBottom: 24, fontSize: '16px' }}>
              The timesheet for {dayjs().year(selectedYear).month(selectedMonth - 1).format('MMMM YYYY')} is not available.
            </p>
            <Space>
              <Button 
                type="primary" 
                onClick={() => {
                  if (currentAvailable) {
                    handleYearChange(currentAvailable.year);
                    handleMonthChange(currentAvailable.month);
                  }
                }}
              >
                Go to Current Month
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <TimesheetHeader {...getHeaderProps()} />

      {/* Status Alert with Rejection Comments */}
      {getStatusAlert()}

      {/* Main Calendar Card */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {dayjs().year(selectedYear).month(selectedMonth - 1).format('MMMM YYYY')} Timesheet
            </Title>
            <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
              <span>Status: </span>
              <span style={{ 
                color: timesheetStatus === 'approved' ? '#52c41a' : 
                      timesheetStatus === 'submitted' ? '#1890ff' : 
                      timesheetStatus === 'rejected' ? '#ff4d4f' : '#faad14',
                fontWeight: 500 
              }}>
                {timesheetStatus === 'submitted' ? 'Pending Approval' : 
                 timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}
              </span>
              {viewingMode === 'historical' && (
                <span style={{ marginLeft: 8, color: '#999' }}>• Historical View</span>
              )}
              {viewingMode === 'editable' && !canEdit && (
                <span style={{ marginLeft: 8, color: '#999' }}>• Read Only</span>
              )}
              {hasUnsavedChanges && (
                <span style={{ marginLeft: 8, color: '#faad14' }}>• Unsaved Changes</span>
              )}
            </div>
          </Col>
          <Col>
            <Space>            
              {/* Save Draft Button - Only show for editable timesheets */}
              {viewingMode === 'editable' && canEdit && (
                <Button 
                  icon={<SaveOutlined />} 
                  onClick={handleSaveDraft}
                  loading={loading}
                  disabled={!hasUnsavedChanges}
                  type={hasUnsavedChanges ? 'primary' : 'default'}
                  title={hasUnsavedChanges ? 'Save draft changes to database' : 'No unsaved changes'}
                >
                  Save Draft
                </Button>
              )}
              
              {/* Submit Button */}
              {viewingMode === 'editable' && showSubmitButton && (
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleSubmitForApproval}
                  loading={loading}
                  title="Submit timesheet for supervisor approval"
                >
                  {submitButtonText}
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Calendar Component with loading overlay */}
        <div style={{ position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}>
              <Spin size="large" />
            </div>
          )}
          
          <TimesheetCalendar
            year={selectedYear}
            month={selectedMonth}
            entries={entries}
            onDayClick={handleDayClick}
            onBulkSelection={handleBulkSelection}
          />
        </div>

        {/* Mode-specific messages */}
        {viewingMode === 'historical' && (
          <div style={{ 
            marginTop: 16, 
            padding: '12px 16px', 
            backgroundColor: '#e6f7ff', 
            borderRadius: '6px',
            border: '1px solid #91d5ff',
            textAlign: 'center' 
          }}>
            <span style={{ color: '#1890ff', fontSize: '14px' }}>
              This is a historical view of your timesheet for reference.
            </span>
          </div>
        )}

        {viewingMode === 'editable' && !canEdit && (
          <div style={{ 
            marginTop: 16, 
            padding: '12px 16px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '6px',
            textAlign: 'center' 
          }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              This timesheet is in read-only mode. 
              {timesheetStatus === 'submitted' && ' It is currently awaiting approval.'}
              {timesheetStatus === 'approved' && ' It has been approved and finalized.'}
            </span>
          </div>
        )}
      </Card>

      {/* Single Day Entry Modal - Modified for read-only mode and delete handling */}
      <DayEntryModal
        visible={modalVisible}
        date={selectedDate}
        existingEntry={selectedDate ? entries[selectedDate] : null}
        customHoursList={customHours}
        defaultHours={defaultHours}
        onSave={viewingMode === 'editable' ? handleSaveEntry : null} // This now handles both save and delete
        onCancel={() => setModalVisible(false)}
        onAddCustomHours={viewingMode === 'editable' ? addCustomHours : null}
        onRemoveCustomHours={viewingMode === 'editable' ? removeCustomHours : null}
        readOnly={viewingMode !== 'editable' || !canEdit}
      />

      {/* Bulk Selection Modal - Only for editable mode */}
      {viewingMode === 'editable' && canEdit && (
        <BulkSelectionModal
          visible={bulkModalVisible}
          dates={selectedDates}
          customHoursList={customHours}
          defaultHours={defaultHours}
          onSave={handleSaveBulkEntries}
          onCancel={() => setBulkModalVisible(false)}
          onAddCustomHours={addCustomHours}
          onRemoveCustomHours={removeCustomHours}
        />
      )}
    </div>
  );
}

/**
 * Utility function to get all working days in a month (excluding weekends)
 */
function getWorkingDaysInMonth(year, month) {
  const startDate = dayjs().year(year).month(month - 1).startOf('month');
  const endDate = startDate.endOf('month');
  const workingDays = [];

  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    if (current.day() !== 0 && current.day() !== 6) { // Not Sunday or Saturday
      workingDays.push(current.format('YYYY-MM-DD'));
    }
    current = current.add(1, 'day');
  }

  return workingDays;
}

export default TimesheetPage;