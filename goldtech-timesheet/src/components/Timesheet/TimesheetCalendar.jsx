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
 * - Select All / Deselect All functionality
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
  
  // Get all working days (current month, excluding weekends) for select all functionality
  const getCurrentMonthWorkingDays = () => {
    return calendarDays
      .filter(day => day.isCurrentMonth && !day.isWeekend)
      .map(day => day.dateStr);
  };

  const currentMonthWorkingDays = getCurrentMonthWorkingDays();
  const allWorkingDaysSelected = currentMonthWorkingDays.length > 0 && 
    currentMonthWorkingDays.every(day => selectedDays.includes(day));

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
   * Handle select all / deselect all working days
   */
  const handleSelectAll = () => {
    if (allWorkingDaysSelected) {
      // Deselect all working days
      setSelectedDays(prev => prev.filter(day => !currentMonthWorkingDays.includes(day)));
    } else {
      // Select all working days
      setSelectedDays(prev => {
        const newSelection = [...new Set([...prev, ...currentMonthWorkingDays])];
        return newSelection.sort();
      });
    }
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
            
            {/* Select All button - only show when in selection mode */}
            {selectionMode && (
              <Button
                type="default"
                onClick={handleSelectAll}
              >
                {allWorkingDaysSelected ? 'Deselect All Working Days' : 'Select All Working Days'}
              </Button>
            )}
            
            {selectedDays.length > 0 && (
              <Button type="primary" onClick={applyBulkSelection}>
                Edit Selected ({selectedDays.length})
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Calendar Grid */}
      <div style={{ 
        border: '1px solid #f0f0f0', 
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {/* Week Header - using CSS Grid to match calendar days */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: '#fafafa'
        }}>
          {weekDays.map(day => (
            <div 
              key={day} 
              style={{ 
                textAlign: 'center', 
                padding: '12px 0',
                border: '1px solid #f0f0f0',
                borderTop: 'none'
              }}
            >
              <Text strong style={{ fontSize: '14px' }}>{day}</Text>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarDays.map((dayData, index) => {
            const entryDisplay = getEntryDisplay(dayData.entry);
            
            // Determine base background color
            let baseBackgroundColor;
            if (dayData.isSelected) {
              baseBackgroundColor = '#e6f7ff';
            } else if (dayData.isCurrentMonth) {
              if (dayData.isWeekend) {
                baseBackgroundColor = '#f9f9f9';
              } else {
                baseBackgroundColor = 'white';
              }
            } else {
              baseBackgroundColor = '#f5f5f5';
            }
            
            return (
              <div
                key={dayData.dateStr}
                onClick={() => handleDayClick(dayData)}
                className={`calendar-day ${dayData.isCurrentMonth ? 'current-month' : ''} ${dayData.isSelected ? 'selected' : ''}`}
                style={{
                  minHeight: '80px',
                  padding: '8px',
                  border: '1px solid #f0f0f0',
                  borderTop: 'none',
                  backgroundColor: baseBackgroundColor,
                  cursor: dayData.isCurrentMonth ? 'pointer' : 'default',
                  opacity: dayData.isCurrentMonth ? 1 : 0.5,
                  transition: 'background-color 0.15s ease',
                  position: 'relative',
                  ...(dayData.isSelected && {
                    boxShadow: 'inset 0 0 0 2px #4f63d2',
                  })
                }}
                onMouseEnter={(e) => {
                  if (dayData.isCurrentMonth && !dayData.isSelected) {
                    if (dayData.isWeekend) {
                      e.currentTarget.style.backgroundColor = '#e8e8e8'; // Darker hover for weekends
                    } else {
                      e.currentTarget.style.backgroundColor = '#f8f9fa'; // Light hover for working days
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (dayData.isCurrentMonth && !dayData.isSelected) {
                    e.currentTarget.style.backgroundColor = baseBackgroundColor;
                  }
                }}
              >
                {/* Day Number */}
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: dayData.isToday ? 'bold' : 'normal',
                  marginBottom: '4px',
                  color: dayData.isCurrentMonth ? '#262626' : '#999'
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
                    backgroundColor: dayData.isSelected ? '#4f63d2' : '#d9d9d9',
                    border: '1px solid #fff'
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
            
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default TimesheetCalendar;