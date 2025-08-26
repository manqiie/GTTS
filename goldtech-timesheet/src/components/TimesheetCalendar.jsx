import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Tag, Button, Space } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * TimesheetCalendar Component
 * 
 * Interactive calendar with features:
 * - Single day clicking
 * - Multi-day selection for bulk operations
 * - Visual indicators for different entry types
 * - Weekend/working day distinction
 * - Entry status display
 */
function TimesheetCalendar({ year, month, entries, onDayClick, onBulkSelection }) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [dragStart, setDragStart] = useState(null);

  // Reset selection when month/year changes
  useEffect(() => {
    setSelectionMode(false);
    setSelectedDays([]);
    setDragStart(null);
  }, [year, month]);

  /**
   * Generate calendar data for the month
   */
  const generateCalendarData = () => {
    const startOfMonth = dayjs().year(year).month(month - 1).startOf('month');
    const endOfMonth = startOfMonth.endOf('month');
    const startOfCalendar = startOfMonth.startOf('week'); // Start from Sunday
    const endOfCalendar = endOfMonth.endOf('week');

    const days = [];
    let current = startOfCalendar;

    while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      const isCurrentMonth = current.month() === month - 1;
      const isWeekend = current.day() === 0 || current.day() === 6;
      const entry = entries[dateStr];

      days.push({
        date: current,
        dateStr,
        dayNumber: current.date(),
        isCurrentMonth,
        isWeekend,
        isToday: current.isSame(dayjs(), 'day'),
        entry,
        isSelected: selectedDays.includes(dateStr)
      });

      current = current.add(1, 'day');
    }

    return days;
  };

  const calendarDays = generateCalendarData();

  /**
   * Handle day click based on current mode
   */
  const handleDayClick = (dayData) => {
    if (!dayData.isCurrentMonth) return;

    if (selectionMode) {
      handleBulkDaySelection(dayData.dateStr);
    } else {
      onDayClick(dayData.dateStr);
    }
  };

  /**
   * Handle bulk day selection
   */
  const handleBulkDaySelection = (dateStr) => {
    if (selectedDays.includes(dateStr)) {
      setSelectedDays(prev => prev.filter(d => d !== dateStr));
    } else {
      setSelectedDays(prev => [...prev, dateStr].sort());
    }
  };

  /**
   * Toggle selection mode
   */
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedDays([]);
  };

  /**
   * Apply bulk selection
   */
  const applyBulkSelection = () => {
    if (selectedDays.length === 0) return;
    onBulkSelection(selectedDays);
    setSelectedDays([]);
    setSelectionMode(false);
  };

  /**
   * Get entry display info
   */
  const getEntryDisplay = (entry) => {
    if (!entry) return null;

    switch (entry.type) {
      case 'working_hours':
        const start = dayjs(entry.startTime, 'HH:mm').format('h:mmA');
        const end = dayjs(entry.endTime, 'HH:mm').format('h:mmA');
        return { text: `${start}-${end}`, color: 'blue' };
      case 'annual_leave':
        return { text: 'AL', color: 'orange' };
      case 'medical_leave':
        return { text: 'ML', color: 'red' };
      case 'off_in_lieu':
        return { text: 'OIL', color: 'purple' };
      case 'rotating_shift':
        return { text: 'RS', color: 'cyan' };
      default:
        return { text: 'N/A', color: 'default' };
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Calendar Controls */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Button
              type={selectionMode ? 'primary' : 'default'}
              icon={<SelectOutlined />}
              onClick={toggleSelectionMode}
            >
              {selectionMode ? 'Exit Selection' : 'Bulk Select'}
            </Button>
            {selectedDays.length > 0 && (
              <Button type="primary" onClick={applyBulkSelection}>
                Edit Selected ({selectedDays.length})
              </Button>
            )}
          </Space>
        </Col>
        {selectionMode && (
          <Col>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Click days to select multiple for bulk editing
            </Text>
          </Col>
        )}
      </Row>

      {/* Calendar Grid */}
      <div style={{ 
        border: '1px solid #f0f0f0', 
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {/* Week Header */}
        <Row style={{ backgroundColor: '#fafafa' }}>
          {weekDays.map(day => (
            <Col key={day} span={24/7} style={{ textAlign: 'center', padding: '12px 0' }}>
              <Text strong style={{ fontSize: '14px' }}>{day}</Text>
            </Col>
          ))}
        </Row>

        {/* Calendar Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarDays.map((dayData, index) => {
            const entryDisplay = getEntryDisplay(dayData.entry);
            
            return (
              <div
                key={dayData.dateStr}
                onClick={() => handleDayClick(dayData)}
                style={{
                  minHeight: '80px',
                  padding: '8px',
                  border: '1px solid #f0f0f0',
                  backgroundColor: dayData.isSelected 
                    ? '#e6f7ff' 
                    : dayData.isCurrentMonth 
                      ? dayData.isWeekend ? '#f9f9f9' : 'white'
                      : '#f5f5f5',
                  cursor: dayData.isCurrentMonth ? 'pointer' : 'default',
                  opacity: dayData.isCurrentMonth ? 1 : 0.5,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  ...(dayData.isToday && { 
                    boxShadow: 'inset 0 0 0 2px #1890ff',
                    backgroundColor: '#f0f8ff'
                  }),
                  ...(dayData.isSelected && {
                    boxShadow: 'inset 0 0 0 2px #52c41a',
                  })
                }}
                onMouseEnter={(e) => {
                  if (dayData.isCurrentMonth) {
                    e.target.style.backgroundColor = dayData.isSelected 
                      ? '#e6f7ff' 
                      : '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (dayData.isCurrentMonth) {
                    e.target.style.backgroundColor = dayData.isSelected 
                      ? '#e6f7ff' 
                      : dayData.isWeekend ? '#f9f9f9' : 'white';
                  }
                }}
              >
                {/* Day Number */}
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: dayData.isToday ? 'bold' : 'normal',
                  marginBottom: '4px',
                  color: dayData.isCurrentMonth ? '#000' : '#999'
                }}>
                  {dayData.dayNumber}
                </div>

                {/* Entry Display */}
                {entryDisplay && (
                  <Tag 
                    color={entryDisplay.color} 
                    style={{ 
                      fontSize: '11px', 
                      margin: 0,
                      padding: '2px 6px'
                    }}
                  >
                    {entryDisplay.text}
                  </Tag>
                )}

                {/* Selection Indicator */}
                {selectionMode && dayData.isCurrentMonth && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: dayData.isSelected ? '#52c41a' : '#d9d9d9',
                    border: '1px solid #fff'
                  }} />
                )}

                {/* Working Day Indicator */}
                {!dayData.isWeekend && dayData.isCurrentMonth && !dayData.entry && (
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#faad14'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <Row style={{ marginTop: 16 }} gutter={16}>
        <Col>
          <Space size="large">
            <Space size="small">
              <div style={{ width: '12px', height: '12px', backgroundColor: '#faad14', borderRadius: '50%' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>Working Day (No Entry)</Text>
            </Space>
            <Space size="small">
              <Tag color="blue" style={{ margin: 0, fontSize: '11px' }}>9AM-6PM</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>Working Hours</Text>
            </Space>
            <Space size="small">
              <Tag color="orange" style={{ margin: 0, fontSize: '11px' }}>AL</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>Annual Leave</Text>
            </Space>
            <Space size="small">
              <Tag color="red" style={{ margin: 0, fontSize: '11px' }}>ML</Tag>
              <Text type="secondary" style={{ fontSize: '12px' }}>Medical Leave</Text>
            </Space>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default TimesheetCalendar;  