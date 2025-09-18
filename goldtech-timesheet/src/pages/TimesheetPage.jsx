// src/pages/TimesheetPage.jsx - Updated to work with API integration
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, message, Spin } from 'antd';
import { SaveOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';
import TimesheetHeader from '../components/Timesheet/TimesheetHeader';
import TimesheetCalendar from '../components/Timesheet/TimesheetCalendar';
import DayEntryModal from '../components/Timesheet/DayEntryModal';
import BulkSelectionModal from '../components/Timesheet/BulkSelectionModal';
import { useTimesheetStore } from '../hooks/useTimesheetStore';
import dayjs from 'dayjs';

const { Title } = Typography;

/**
 * TimesheetPage - Updated for API integration
 * 
 * This component now works with the backend API through the updated hook
 */
function TimesheetPage() {
  // State management
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(7); // July
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  
  // Updated hook for API integration
  const {
    entries,
    customHours,
    defaultHours,
    loading,
    timesheetStatus,
    saveEntry,
    saveBulkEntries,
    submitTimesheet,
    setDefaultHours: updateDefaultHours,
    addCustomHours,
    removeCustomHours,
    clearMonth,
    deleteEntry,
    getMonthStats,
    loadTimesheetData
  } = useTimesheetStore(selectedYear, selectedMonth);

  // Current month key for data organization
  const currentMonthKey = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;

  /**
   * Handle single day selection for editing
   */
  const handleDayClick = (date) => {
    // Don't allow editing if timesheet is submitted/approved
    if (timesheetStatus === 'submitted' || timesheetStatus === 'approved') {
      message.warning('Cannot edit submitted or approved timesheet');
      return;
    }

    setSelectedDate(date);
    setSelectedDates([]); // Clear bulk selection
    setModalVisible(true);
  };

  /**
   * Handle bulk day selection
   */
  const handleBulkSelection = (dates) => {
    // Don't allow bulk editing if timesheet is submitted/approved
    if (timesheetStatus === 'submitted' || timesheetStatus === 'approved') {
      message.warning('Cannot edit submitted or approved timesheet');
      return;
    }

    if (dates.length > 1) {
      setSelectedDates(dates);
      setSelectedDate(null); // Clear single selection
      setBulkModalVisible(true);
    } else if (dates.length === 1) {
      handleDayClick(dates[0]);
    }
  };

  /**
   * Handle save entry from modal
   */
  const handleSaveEntry = async (entryData) => {
    try {
      await saveEntry(entryData);
      setModalVisible(false);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Error saving entry:', error);
    }
  };

  /**
   * Handle save bulk entries from modal
   */
  const handleSaveBulkEntries = async (entriesArray) => {
    try {
      await saveBulkEntries(entriesArray);
      setBulkModalVisible(false);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Error saving bulk entries:', error);
    }
  };

  /**
   * Apply default hours to all working days
   */
  const applyToAllWorkingDays = async () => {
    if (!defaultHours) {
      message.warning('Please set default working hours first');
      return;
    }

    if (timesheetStatus === 'submitted' || timesheetStatus === 'approved') {
      message.warning('Cannot edit submitted or approved timesheet');
      return;
    }

    try {
      const workingDays = getWorkingDaysInMonth(selectedYear, selectedMonth);
      const bulkData = workingDays.map(date => ({
        date,
        type: 'working_hours',
        startTime: defaultHours.startTime,
        endTime: defaultHours.endTime,
        notes: 'Applied via bulk action'
      }));

      await saveBulkEntries(bulkData);
      message.success(`Applied default hours to ${workingDays.length} working days`);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Error applying default hours:', error);
    }
  };

  /**
   * Clear all entries for current month
   */
  const handleClearAll = async () => {
    if (timesheetStatus === 'submitted' || timesheetStatus === 'approved') {
      message.warning('Cannot clear submitted or approved timesheet');
      return;
    }

    try {
      await clearMonth();
    } catch (error) {
      console.error('Error clearing month:', error);
    }
  };

  /**
   * Save timesheet as draft (automatic with any changes)
   */
  const handleSaveDraft = () => {
    message.success('Timesheet automatically saved as draft');
  };

  /**
   * Submit timesheet for approval
   */
  const handleSubmitForApproval = async () => {
    if (timesheetStatus === 'submitted' || timesheetStatus === 'approved') {
      message.warning('Timesheet is already submitted or approved');
      return;
    }

    try {
      // Get current stats to validate
      const stats = await getMonthStats();
      const workingDays = getWorkingDaysInMonth(selectedYear, selectedMonth);
      
      if (stats.totalEntries < workingDays.length * 0.8) {
        message.warning('Please complete at least 80% of working days before submitting');
        return;
      }

      await submitTimesheet();
    } catch (error) {
      // Error is already handled in the hook
      console.error('Error submitting timesheet:', error);
    }
  };

  /**
   * Refresh timesheet data
   */
  const handleRefresh = async () => {
    try {
      await loadTimesheetData();
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

  // Show loading spinner while data is loading
  if (loading && Object.keys(entries).length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading timesheet..." />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <TimesheetHeader 
        year={selectedYear}
        month={selectedMonth}
        status={timesheetStatus}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />

      {/* Main Calendar Card */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {dayjs().year(selectedYear).month(selectedMonth - 1).format('MMMM YYYY')} Timesheet
            </Title>
            <div style={{ fontSize: '14px', color: '#666', marginTop: 4 }}>
              Status: <span style={{ 
                color: timesheetStatus === 'approved' ? '#52c41a' : 
                      timesheetStatus === 'submitted' ? '#1890ff' : 
                      timesheetStatus === 'rejected' ? '#ff4d4f' : '#faad14',
                fontWeight: 500 
              }}>
                {timesheetStatus.charAt(0).toUpperCase() + timesheetStatus.slice(1)}
              </span>
            </div>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={loading}
                disabled={loading}
              >
                Refresh
              </Button>
              {timesheetStatus === 'draft' && (
                <>
                  <Button 
                    icon={<SaveOutlined />} 
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />} 
                    onClick={handleSubmitForApproval}
                    loading={loading}
                  >
                    Submit for Approval
                  </Button>
                </>
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
      </Card>

      {/* Single Day Entry Modal */}
      <DayEntryModal
        visible={modalVisible}
        date={selectedDate}
        existingEntry={selectedDate ? entries[selectedDate] : null}
        customHoursList={customHours}
        defaultHours={defaultHours}
        onSave={handleSaveEntry}
        onCancel={() => setModalVisible(false)}
        onAddCustomHours={addCustomHours}
        onRemoveCustomHours={removeCustomHours}
      />

      {/* Bulk Selection Modal */}
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