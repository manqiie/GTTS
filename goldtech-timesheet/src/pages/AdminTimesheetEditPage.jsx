// src/pages/AdminTimesheetEditPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button, message, Spin, Modal, Input } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TimesheetCalendar from '../components/Timesheet/TimesheetCalendar';
import DayEntryModal from '../components/Timesheet/DayEntryModal';
import BulkSelectionModal from '../components/Timesheet/BulkSelectionModal';
import { useAdminTimesheetEditStore } from '../hooks/useAdminTimesheetEditStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

function AdminTimesheetEditPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  
  const selectedYear = parseInt(searchParams.get('year')) || dayjs().year();
  const selectedMonth = parseInt(searchParams.get('month')) || dayjs().month() + 1;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [editReasonModalVisible, setEditReasonModalVisible] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [pendingSaveAction, setPendingSaveAction] = useState(null);

  const {
    entries,
    timesheetData,
    customHours,
    defaultHours,
    loading,
    hasUnsavedChanges,
    saveEntry,
    saveBulkEntries,
    deleteEntry,
    saveDraft,
    addCustomHours,
    removeCustomHours,
    loadTimesheetData
  } = useAdminTimesheetEditStore(userId, selectedYear, selectedMonth);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedDates([]);
    setModalVisible(true);
  };

  const handleBulkSelection = (dates) => {
    if (dates.length > 1) {
      setSelectedDates(dates);
      setSelectedDate(null);
      setBulkModalVisible(true);
    } else if (dates.length === 1) {
      handleDayClick(dates[0]);
    }
  };

  const handleSaveEntry = (entryData) => {
    try {
      if (entryData.type === 'DELETE' || entryData.isDelete) {
        deleteEntry(entryData.date);
      } else {
        saveEntry(entryData);
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error handling entry:', error);
    }
  };

  const handleSaveBulkEntries = (entriesArray) => {
    try {
      saveBulkEntries(entriesArray);
      setBulkModalVisible(false);
    } catch (error) {
      console.error('Error saving bulk entries:', error);
    }
  };

  const handleSaveWithReason = () => {
    if (!editReason.trim()) {
      message.warning('Please provide a reason for editing this timesheet');
      return;
    }

    setEditReasonModalVisible(false);
    
    if (pendingSaveAction === 'save') {
      performSave(editReason);
    }
    
    setEditReason('');
    setPendingSaveAction(null);
  };

  const handleSaveDraft = async () => {
    setEditReasonModalVisible(true);
    setPendingSaveAction('save');
  };

  const performSave = async (reason) => {
    try {
      await saveDraft(reason);
      message.success('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleBackToManagement = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to leave?',
        okText: 'Leave',
        cancelText: 'Stay',
        onOk: () => {
          navigate('/timesheet-management');
        }
      });
    } else {
      navigate('/timesheet-management');
    }
  };

  if (loading && Object.keys(entries).length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading timesheet..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBackToManagement}
                style={{ padding: 0 }}
                type="link"
              >
                Back to Timesheet Management
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                Admin Edit Mode
              </Title>
              <Text type="secondary">
                Editing timesheet for {timesheetData?.employeeName || 'Loading...'} - {dayjs().year(selectedYear).month(selectedMonth - 1).format('MMMM YYYY')}
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Employee Info Card */}
      {timesheetData && (
        <Card style={{ marginBottom: 20 }}>
          <Row gutter={[24, 16]}>
            <Col span={6}>
              <Text strong>Employee:</Text>
              <div>{timesheetData.employeeName}</div>
            </Col>
            <Col span={6}>
              <Text strong>Position:</Text>
              <div>{timesheetData.employeePosition || 'N/A'}</div>
            </Col>
            <Col span={6}>
              <Text strong>Location:</Text>
              <div>{timesheetData.employeeLocation || 'N/A'}</div>
            </Col>
            <Col span={6}>
              <Text strong>Status:</Text>
              <div style={{ 
                color: timesheetData.status === 'approved' ? '#52c41a' : 
                      timesheetData.status === 'submitted' ? '#1890ff' : 
                      timesheetData.status === 'rejected' ? '#ff4d4f' : '#faad14',
                fontWeight: 500 
              }}>
                {timesheetData.status?.toUpperCase()}
              </div>
            </Col>
          </Row>
          {timesheetData.editedBy && (
            <Row style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ffd591' }}>
              <Col span={24}>
                <Text strong style={{ color: '#fa8c16' }}>Last edited by: </Text>
                <Text>{timesheetData.editedBy} on {dayjs(timesheetData.editedAt).format('MMM DD, YYYY HH:mm')}</Text>
                {timesheetData.editReason && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ color: '#fa8c16' }}>Reason: </Text>
                    <Text>{timesheetData.editReason}</Text>
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Card>
      )}

      {/* Main Calendar Card */}
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {dayjs().year(selectedYear).month(selectedMonth - 1).format('MMMM YYYY')} Timesheet
            </Title>
            {hasUnsavedChanges && (
              <div style={{ fontSize: '14px', color: '#faad14', marginTop: 4 }}>
                • Unsaved Changes
              </div>
            )}
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSaveDraft}
                loading={loading}
                disabled={!hasUnsavedChanges}
                type={hasUnsavedChanges ? 'primary' : 'default'}
                title={hasUnsavedChanges ? 'Save changes' : 'No unsaved changes'}
              >
                Save Changes
              </Button>
            </Space>
          </Col>
        </Row>

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

        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          backgroundColor: '#fff7e6', 
          borderRadius: '6px',
          border: '1px solid #ffd591',
          textAlign: 'center' 
        }}>
          <span style={{ color: '#fa8c16', fontSize: '14px', fontWeight: 500 }}>
            Admin Edit Mode: Changes will be tracked and visible in management view.
          </span>
        </div>
      </Card>

      {/* Edit Reason Modal */}
      <Modal
        title="Provide Edit Reason"
        open={editReasonModalVisible}
        onOk={handleSaveWithReason}
        onCancel={() => {
          setEditReasonModalVisible(false);
          setEditReason('');
          setPendingSaveAction(null);
        }}
        okText="Save Changes"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Please provide a reason for editing this timesheet:</Text>
        </div>
        <TextArea
          rows={4}
          value={editReason}
          onChange={(e) => setEditReason(e.target.value)}
          placeholder="e.g., Correcting overtime calculation error, Updating leave type based on submitted documents, etc."
          maxLength={500}
        />
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {editReason.length}/500 characters
          </Text>
        </div>
      </Modal>

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
        readOnly={false}
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

export default AdminTimesheetEditPage;