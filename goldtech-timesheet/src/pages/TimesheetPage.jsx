import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, message } from 'antd';
import { SaveOutlined, SendOutlined } from '@ant-design/icons';
import TimesheetHeader from '../components/Timesheet/TimesheetHeader';
import TimesheetCalendar from '../components/Timesheet/TimesheetCalendar';
import DayEntryModal from '../components/Timesheet/DayEntryModal';
import BulkSelectionModal from '../components/Timesheet/BulkSelectionModal';
import { useTimesheetStore } from '../hooks/useTimesheetStore';
import dayjs from 'dayjs';

const { Title } = Typography;

/**
 * TimesheetPage - Main container for the timesheet interface
 * 
 * This component orchestrates all timesheet-related functionality:
 * - Quick settings for default working hours
 * - Calendar view with day entries
 * - Modal dialogs for editing entries
 * - Bulk selection capabilities
 * - Save/submit functionality
 */
function TimesheetPage() {
  // State management
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(7); // July
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timesheetStatus, setTimesheetStatus] = useState('draft');
  
  // Custom hook for timesheet data management
  const {
    entries,
    customHours,
    defaultHours,
    saveEntry,
    saveBulkEntries,
    setDefaultHours: updateDefaultHours,
    addCustomHours,
    removeCustomHours,
    clearMonth
  } = useTimesheetStore(selectedYear, selectedMonth);

  // Current month key for data organization
  const currentMonthKey = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;

  /**
   * Handle single day selection for editing
   */
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedDates([]); // Clear bulk selection
    setModalVisible(true);
  };

  /**
   * Handle bulk day selection
   */
  const handleBulkSelection = (dates) => {
    if (dates.length > 1) {
      setSelectedDates(dates);
      setSelectedDate(null); // Clear single selection
      setBulkModalVisible(true);
    } else if (dates.length === 1) {
      handleDayClick(dates[0]);
    }
  };

  /**
   * Apply default hours to all working days
   */
  const applyToAllWorkingDays = () => {
    if (!defaultHours) {
      message.warning('Please set default working hours first');
      return;
    }

    const workingDays = getWorkingDaysInMonth(selectedYear, selectedMonth);
    const bulkData = workingDays.map(date => ({
      date,
      type: 'working_hours',
      startTime: defaultHours.startTime,
      endTime: defaultHours.endTime,
      notes: 'Applied via bulk action'
    }));

    saveBulkEntries(bulkData);
    message.success(`Applied default hours to ${workingDays.length} working days`);
  };

  /**
   * Clear all entries for current month
   */
  const handleClearAll = () => {
    clearMonth();
    setTimesheetStatus('draft');
    message.info('All entries cleared');
  };

  /**
   * Save timesheet as draft
   */
  const handleSaveDraft = () => {
    setTimesheetStatus('draft');
    message.success('Timesheet saved as draft');
  };

  /**
   * Submit timesheet for approval
   */
  const handleSubmitForApproval = () => {
    const workingDays = getWorkingDaysInMonth(selectedYear, selectedMonth);
    const enteredDays = Object.keys(entries).length;
    
    if (enteredDays < workingDays.length * 0.8) {
      message.warning('Please complete at least 80% of working days before submitting');
      return;
    }

    setTimesheetStatus('pending');
    message.success('Timesheet submitted for approval');
  };

  return (
    <div>
      {/* Page Header */}
      <TimesheetHeader 
        year={selectedYear}
        month={selectedMonth}
        status={timesheetStatus}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />



      {/* Main Calendar Card */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {dayjs().year(selectedYear).month(selectedMonth - 1).format('MMMM YYYY')} Timesheet
            </Title>
          </Col>
          <Col>
            <Space>
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
              >
                Submit for Approval
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Calendar Component */}
        <TimesheetCalendar
          year={selectedYear}
          month={selectedMonth}
          entries={entries}
          onDayClick={handleDayClick}
          onBulkSelection={handleBulkSelection}
        />
      </Card>

      {/* Single Day Entry Modal */}
      <DayEntryModal
        visible={modalVisible}
        date={selectedDate}
        existingEntry={selectedDate ? entries[selectedDate] : null}
        customHoursList={customHours}
        defaultHours={defaultHours}
        onSave={saveEntry}
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
        onSave={saveBulkEntries}
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