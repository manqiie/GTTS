// src/components/TimesheetManagement/ViewTimesheetModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Table, Spin, Alert, Typography } from 'antd';
import dayjs from 'dayjs';
import DocumentViewer from '../Common/DocumentViewer';

const { Text } = Typography;

function ViewTimesheetModal({ 
  visible, 
  timesheet, 
  timesheetDetails,
  loading,
  onClose,
  onViewDocument
}) {
  if (!timesheet) return null;

  const statusConfig = {
    submitted: { color: 'orange', text: 'Pending' },
    pending: { color: 'orange', text: 'Pending' },
    approved: { color: 'green', text: 'Approved' },
    rejected: { color: 'red', text: 'Rejected' }
  };

  const currentStatusConfig = statusConfig[timesheet.status] || statusConfig.pending;

  const leaveTypeConfig = {
    'annual_leave': { text: 'Annual Leave', color: 'orange' },
    'annual_leave_halfday': { text: 'Annual Leave (Half Day)', color: 'orange' },
    'medical_leave': { text: 'Medical Leave', color: 'red' },
    'off_in_lieu': { text: 'Off in Lieu', color: 'purple' },
    'childcare_leave': { text: 'Childcare Leave', color: 'green' },
    'childcare_leave_halfday': { text: 'Childcare Leave (Half Day)', color: 'green' },
    'hospitalization_leave': { text: 'Hospitalization Leave', color: 'volcano' },
    'maternity_leave': { text: 'Maternity Leave', color: 'magenta' },
    'paternity_leave': { text: 'Paternity Leave', color: 'cyan' },
    'compassionate_leave': { text: 'Compassionate Leave', color: 'gold' },
    'day_off': { text: 'Public Holiday', color: 'geekblue' },
    'shared_parental_leave': { text: 'Shared Parental Leave', color: 'blue' },
    'nopay_leave': { text: 'No Pay Leave', color: 'default' },
    'nopay_leave_halfday': { text: 'No Pay Leave (Half Day)', color: 'default' },
    'reservist': { text: 'Reservist', color: 'purple' }
  };

  const generateDailyTimesheetData = () => {
    if (!timesheetDetails || !timesheetDetails.entries) return [];
    
    const daysInMonth = dayjs()
      .year(timesheet.year)
      .month(timesheet.month - 1)
      .daysInMonth();
    
    const entries = timesheetDetails.entries || {};
    
    const dailyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs()
        .year(timesheet.year)
        .month(timesheet.month - 1)
        .date(day);
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

  const columns = [
    {
      title: 'Date',
      key: 'date',
      width: 80,
      align: 'center',
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
      title: 'Type',
      key: 'type',
      width: 200,
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
            <div>
              <div style={{ color: '#1890ff', fontWeight: 500, fontSize: '13px' }}>
                Working Hours
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {startTime} - {endTime}
              </div>
            </div>
          );
        } else {
          const config = leaveTypeConfig[record.entry.type] || { text: record.entry.type, color: 'default' };
          return (
            <div>
              <Tag color={config.color}>{config.text}</Tag>
              {record.entry.halfDayPeriod && (
                <Tag color="blue" style={{ marginTop: 4 }}>
                  {record.entry.halfDayPeriod}
                </Tag>
              )}
            </div>
          );
        }
      },
    },
    {
      title: 'Additional Info',
      key: 'additionalInfo',
      width: 150,
      render: (_, record) => {
        if (!record.entry) return <span style={{ color: '#999' }}>-</span>;
        
        // Show date earned for off_in_lieu
        if (record.entry.type === 'off_in_lieu' && record.entry.dateEarned) {
          return (
            <div style={{ fontSize: '12px' }}>
              <Text type="secondary">Date Earned:</Text>
              <div style={{ fontWeight: 500 }}>
                {dayjs(record.entry.dateEarned).format('MMM DD, YYYY')}
              </div>
            </div>
          );
        }
        
        return <span style={{ color: '#999' }}>-</span>;
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
      width: 300,
      render: (_, record) => {
        if (!record.entry) return <span style={{ color: '#999' }}>-</span>;
        
        return (
          <DocumentViewer
            documents={record.entry.supportingDocuments}
            documentReference={record.entry.documentReference}
            onViewDocument={onViewDocument}
            size="small"
          />
        );
      },
    },
  ];

  const dailyData = generateDailyTimesheetData();

  return (
    <Modal
      title={`Timesheet Details - ${timesheet.employeeName}`}
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      style={{ top: 20 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Loading timesheet details..." />
        </div>
      ) : (
        <>
          {/* Employee and Timesheet Info */}
          <Descriptions 
            bordered 
            column={2} 
            size="small" 
            style={{ marginBottom: 20 }}
          >
            <Descriptions.Item label="Employee Name">
              {timesheet.employeeName}
            </Descriptions.Item>
            <Descriptions.Item label="Position">
              {timesheet.employeePosition || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {timesheet.employeeLocation || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Period">
              {timesheet.monthName} {timesheet.year}
              {timesheet.version > 1 && (
                <Tag color="purple" style={{ marginLeft: 8 }}>
                  Version {timesheet.version}
                </Tag>
              )}
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

           <Descriptions.Item label="Summary">
              {timesheetDetails.stats.workingDays  || 'N/A'}
              <Text type="secondary"> working days  </Text>
              {timesheetDetails.stats.leaveDays || 0}
              <Text type="secondary"> leave days   </Text>
              {timesheetDetails.stats.totalEntries || 0}
              <Text type="secondary"> total entries</Text>
            </Descriptions.Item>

          </Descriptions>

     

          {/* Approval Information (if processed) */}
          {(timesheet.status === 'approved' || timesheet.status === 'rejected') && (
            <Descriptions 
              bordered 
              column={1} 
              size="small" 
              style={{ marginBottom: 20 }}
              title="Approval Information"
            >
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
          )}

          {/* Daily Timesheet Table */}
          <div style={{ marginTop: 20 }}>
            <Text strong style={{ fontSize: '16px', marginBottom: 16, display: 'block' }}>
              Daily Timesheet Entries
            </Text>
            <Table
              columns={columns}
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
          </div>
        </>
      )}
    </Modal>
  );
}

export default ViewTimesheetModal;