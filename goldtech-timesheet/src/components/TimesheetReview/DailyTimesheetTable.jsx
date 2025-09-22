// src/components/TimesheetReview/DailyTimesheetTable.jsx
import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import DocumentViewer from '../Common/DocumentViewer';

const { Title, Text } = Typography;

const DailyTimesheetTable = ({ 
  year, 
  month, 
  timesheetDetails, 
  onViewDocument 
}) => {
  const generateDailyTimesheetData = () => {
    if (!timesheetDetails) return [];
    
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

  const leaveTypeConfig = {
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

  const columns = [
    {
      title: 'Date',
      key: 'date',
      width: 80,
      align:'center',
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
      width: 250,
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
            <span style={{ color: '#1890ff', fontWeight: 500, fontSize: '13px' }}>
              {startTime} - {endTime}
            </span>
          );
        } else {
          const config = leaveTypeConfig[record.entry.type] || { text: record.entry.type, color: 'default' };
          return <Tag color={config.color}>{config.text}</Tag>;
        }
      },
    },
    {
      title: 'Notes',
      key: 'notes',
      align: 'left',
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
    <Card style={{ marginBottom: 20 }}>
      <Title level={4} style={{ marginBottom: 16 }}>Daily Timesheet Details</Title>
      <Table
        columns={columns}
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
  );
};

export default DailyTimesheetTable;