import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Tag, Button, Space } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

function TimesheetCalendar({ year, month, entries, onDayClick, onBulkSelection }) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset selection when month/year changes
  useEffect(() => {
    setSelectionMode(false);
    setSelectedDays([]);
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

  const getEntryDisplay = (entry) => {
    if (!entry) return null;

    const getLeaveTypeDisplay = (type, halfDayPeriod = null) => {
      const baseTypes = {
        'annual_leave': { text: 'AL', color: 'orange' },
        'annual_leave_halfday': { text: halfDayPeriod ? `AL-${halfDayPeriod}` : 'AL-HD', color: 'orange' },
        'medical_leave': { text: 'ML', color: 'red' },
        'childcare_leave': { text: 'CL', color: 'purple' },
        'childcare_leave_halfday': { text: halfDayPeriod ? `CL-${halfDayPeriod}` : 'CL-HD', color: 'purple' },
        'shared_parental_leave': { text: 'SPL', color: 'cyan' },
        'nopay_leave': { text: 'NPL', color: 'gray' },
        'nopay_leave_halfday': { text: halfDayPeriod ? `NPL-${halfDayPeriod}` : 'NPL-HD', color: 'gray' },
        'hospitalization_leave': { text: 'HL', color: 'red' },
        'reservist': { text: 'RSV', color: 'green' },
        'paternity_leave': { text: 'PL', color: 'blue' },
        'compassionate_leave': { text: 'CPL', color: 'magenta' },
        'maternity_leave': { text: 'ML', color: 'pink' },
        'off_in_lieu': { text: 'OIL', color: 'purple' },
        'day_off': { text: 'PH', color: 'gold' }
      };

      return baseTypes[type] || { text: 'N/A', color: 'default' };
    };

    switch (entry.type) {
      case 'working_hours':
        if (entry.startTime && entry.endTime) {
          // Format to 12-hour format with AM/PM
          const start = dayjs(entry.startTime, 'HH:mm').format(isMobile ? 'h:mmA' : 'h:mmA');
          const end = dayjs(entry.endTime, 'HH:mm').format(isMobile ? 'h:mmA' : 'h:mmA');
          
           // Check if it's an overnight shift (end time is before or equal to start time)
          const startTime = dayjs(entry.startTime, 'HH:mm');
          const endTime = dayjs(entry.endTime, 'HH:mm');
          const isOvernight = endTime.isBefore(startTime) || endTime.isSame(startTime);
          
          // For mobile, show shorter format
          const timeDisplay = isMobile 
            ? `${start.replace(':00', '')}-${end.replace(':00', '')}${isOvernight ? '+' : ''}`
            : `${start}-${end}${isOvernight ? '+' : ''}`;
          
          return { 
            text: timeDisplay, 
            color: 'blue',
            title: isOvernight ? 'Overnight shift (extends to next day)' : 'Regular shift'
          };
        }
        return { text: 'Working', color: 'blue' };
      
      default:
        return getLeaveTypeDisplay(entry.type, entry.halfDayPeriod);
    }
  };

  const weekDays = isMobile 
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] 
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Calendar Controls */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16, flexWrap: 'wrap', gap: '8px' }}>
        <Col xs={24} sm="auto">
          <Space wrap size={isMobile ? 4 : 8}>
            <Button
              type={selectionMode ? 'primary' : 'default'}
              icon={<SelectOutlined />}
              onClick={toggleSelectionMode}
              size={isMobile ? 'small' : 'middle'}
            >
              {selectionMode ? 'Exit' : 'Bulk Select'}
            </Button>
            
            {/* Select All button - only show when in selection mode */}
            {selectionMode && (
              <Button
                type="default"
                onClick={handleSelectAll}
                size={isMobile ? 'small' : 'middle'}
              >
                {allWorkingDaysSelected ? 'Deselect All' : 'Select All'}
              </Button>
            )}
            
            {selectedDays.length > 0 && (
              <Button 
                type="primary" 
                onClick={applyBulkSelection}
                size={isMobile ? 'small' : 'middle'}
              >
                Edit ({selectedDays.length})
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
        {/* Week Header */}
        <div 
          className="calendar-week-header"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)',
            backgroundColor: '#fafafa'
          }}
        >
          {weekDays.map(day => (
            <div 
              key={day} 
              style={{ 
                textAlign: 'center', 
                padding: isMobile ? '8px 2px' : '12px 0',
                border: '1px solid #f0f0f0',
                borderTop: 'none',
                fontSize: isMobile ? '11px' : '14px'
              }}
            >
              <Text strong>{day}</Text>
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
                className="calendar-day"
                style={{
                  minHeight: isMobile ? '50px' : '80px',
                  padding: isMobile ? '4px' : '8px',
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
                      e.currentTarget.style.backgroundColor = '#e8e8e8';
                    } else {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
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
                  fontSize: isMobile ? '11px' : '14px', 
                  fontWeight: dayData.isToday ? 'bold' : 'normal',
                  marginBottom: isMobile ? '2px' : '4px',
                  color: dayData.isCurrentMonth ? '#262626' : '#999'
                }}>
                  {dayData.dayNumber}
                </div>

                {/* Entry Display - Responsive Tag */}
                {entryDisplay && (
                  <Tag 
                    color={entryDisplay.color} 
                    title={entryDisplay.title || entryDisplay.text}
                    style={{ 
                      fontSize: isMobile ? '8px' : '11px',
                      margin: 0,
                      padding: isMobile ? '0px 3px' : '2px 6px',
                      cursor: 'help',
                      lineHeight: isMobile ? '14px' : 'normal',
                      display: 'inline-block',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {entryDisplay.text}
                  </Tag>
                )}

                {/* Selection Indicator */}
                {selectionMode && dayData.isCurrentMonth && (
                  <div style={{
                    position: 'absolute',
                    top: isMobile ? '2px' : '4px',
                    right: isMobile ? '2px' : '4px',
                    width: isMobile ? '10px' : '12px',
                    height: isMobile ? '10px' : '12px',
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
    </div>
  );
}

export default TimesheetCalendar;