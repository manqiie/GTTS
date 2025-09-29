// Updated BulkSelectionModal.jsx - Draft Mode Compatible
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Row, 
  Col,
  message,
  Divider,
  List,
  Tag,
  Typography,
  Alert,
  Select
} from 'antd';
import dayjs from 'dayjs';
import SharedEntryTypeSelector from './EntryModal/SharedEntryTypeSelector';
import SharedWorkingHoursSection from './EntryModal/SharedWorkingHoursSection';
import SharedDocumentsSection from './EntryModal/SharedDocumentsSection';
import OffInLieuSelector from './OffInLieuSelector';
import { entryTypeConfig } from './EntryModal/entryTypeConfig';
import { dayEntryUtils } from './EntryModal/dayEntryUtils';

const { TextArea } = Input;
const { Text } = Typography;

function BulkSelectionModal({ 
  visible, 
  dates, 
  customHoursList, 
  defaultHours,
  onSave, 
  onCancel,
  onAddCustomHours,
  onRemoveCustomHours
}) {
  const [form] = Form.useForm();
  
  // Shared state that can use the same logic as DayEntryModal
  const [entryType, setEntryType] = useState(null);
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);
  const [selectedHoursId, setSelectedHoursId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [primaryDocumentDay, setPrimaryDocumentDay] = useState(null);
  
  // Bulk-specific state
  const [individualModifications, setIndividualModifications] = useState({});

  // Reset form when modal opens/closes - using shared logic
  useEffect(() => {
    if (visible && dates.length > 0) {
      form.resetFields();
      setEntryType(null);
      setShowOthersDropdown(false);
      setSelectedHoursId(null);
      setPrimaryDocumentDay(null);
      setFileList([]);
      setIndividualModifications({});
    }
  }, [visible, dates, form]);

  // Handle entry type change - reusing logic from DayEntryModal
  const handleEntryTypeChange = (value, setters) => {
    setEntryType(setters.entryType);
    setShowOthersDropdown(setters.showOthersDropdown);
    setSelectedHoursId(setters.selectedHoursId);
    
    // Bulk-specific logic
    if (entryTypeConfig.requiresDocuments(setters.entryType)) {
      setPrimaryDocumentDay(dates[0]);
    } else {
      setPrimaryDocumentDay(null);
    }

    setIndividualModifications({});
    setFileList([]);
    form.setFieldValue('halfDayPeriod', undefined);
  };

  // Handle individual day modification
  const handleIndividualModification = (date, field, value) => {
    setIndividualModifications(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value
      }
    }));
  };

  // Handle form submission - Updated for draft mode (no validation message)
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        const actualEntryType = showOthersDropdown ? values.othersEntryType : values.entryType;
        
        // Use shared validation
        const validation = dayEntryUtils.validateBulkEntryData(
          values, 
          actualEntryType, 
          fileList, 
          individualModifications, 
          dates
        );

        if (!validation.isValid) {
          validation.errors.forEach(error => message.warning(error));
          return;
        }

        // Prepare bulk data using shared utility
        const bulkData = dates.map(date => {
          return dayEntryUtils.prepareBulkEntryData(
            date,
            values,
            actualEntryType,
            individualModifications[date],
            primaryDocumentDay,
            fileList
          );
        });

        // Call onSave - this will now save to draft instead of API
        onSave(bulkData);
        resetForm();
      })
      .catch(error => {
        console.error('Form validation failed:', error);
      });
  };

  const resetForm = () => {
    form.resetFields();
    setEntryType(null);
    setShowOthersDropdown(false);
    setSelectedHoursId(null);
    setPrimaryDocumentDay(null);
    setFileList([]);
    setIndividualModifications({});
  };


  return (
    <Modal
      title={`Bulk Edit - ${dates.length} Selected Days`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={800}
      okText="Apply to All Selected Days"
    >
      {/* Selected Days Overview */}
      <SelectedDaysOverview 
        dates={dates} 
        primaryDocumentDay={primaryDocumentDay} 
      />

      <Form form={form} layout="vertical">
        {/* Shared Entry Type Selector */}
        <SharedEntryTypeSelector
          form={form}
          entryType={entryType}
          showOthersDropdown={showOthersDropdown}
          onEntryTypeChange={handleEntryTypeChange}
          allowBulkSpecificTypes={true}
        />

        {/* Shared Working Hours Section */}
        {entryType === 'working_hours' && (
          <SharedWorkingHoursSection
            customHoursList={customHoursList}
            selectedHoursId={selectedHoursId}
            setSelectedHoursId={setSelectedHoursId}
            onAddCustomHours={onAddCustomHours}
            onRemoveCustomHours={onRemoveCustomHours}
            form={form}
            defaultHours={defaultHours}
          />
        )}

        {/* Shared Documents Section */}
        {entryType && entryTypeConfig.requiresDocuments(entryType) && (
          <>
            {primaryDocumentDay && (
              <SharedDocumentsSection
                entryType={entryType}
                fileList={fileList}
                setFileList={setFileList}
                helpText="Documents will be linked to all selected days"
                isBulkMode={true}
              />
            )}
          </>
        )}

        {/* Individual Day Configuration */}
        <Divider>Individual Day Configuration</Divider>
        <IndividualDaysList
          dates={dates}
          entryType={entryType}
          individualModifications={individualModifications}
          onIndividualModification={handleIndividualModification}
          primaryDocumentDay={primaryDocumentDay}
        />

      </Form>
    </Modal>
  );
}

// Reusable sub-components for bulk operations

const SelectedDaysOverview = ({ dates, primaryDocumentDay }) => (
  <div style={{ marginBottom: 20, padding: 12, backgroundColor: '#fffaedff', borderRadius: 6 }}>
    <Text strong>Selected Days: </Text>
    <div style={{ marginTop: 8 }}>
      {dates.map(date => (
        <Tag 
          key={date} 
          color={date === primaryDocumentDay ? 'gold' : 'blue'}
          style={{ margin: '2px 4px 2px 0' }}
        >
          {dayjs(date).format('MMM DD')}
          {date === primaryDocumentDay && ' (Primary)'}
        </Tag>
      ))}
    </div>
  </div>
);

const IndividualDaysList = ({ 
  dates, 
  entryType, 
  individualModifications, 
  onIndividualModification,
  primaryDocumentDay 
}) => (
  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
    <List
      size="small"
      dataSource={dates}
      renderItem={date => {
        const hasEarnedDate = Boolean(individualModifications[date]?.dateEarned);
        
        return (
          <List.Item style={{ 
            paddingLeft: entryType === 'off_in_lieu' && hasEarnedDate ? '12px' : '0'
          }}>
            <IndividualDayItem
              date={date}
              entryType={entryType}
              individualModifications={individualModifications}
              onIndividualModification={onIndividualModification}
              primaryDocumentDay={primaryDocumentDay}
              hasEarnedDate={hasEarnedDate}
            />
          </List.Item>
        );
      }}
    />
  </div>
);

const IndividualDayItem = ({ 
  date, 
  entryType, 
  individualModifications, 
  onIndividualModification,
  primaryDocumentDay,
  hasEarnedDate 
}) => (
  <div style={{ width: '100%' }}>
    <Row gutter={16} align="middle">
      <Col span={6}>
        <Text strong>{dayjs(date).format('ddd, MMM DD')}</Text>
        {date === primaryDocumentDay && (
          <Tag color="gold" size="small" style={{ marginLeft: 8 }}>Primary</Tag>
        )}
      </Col>
      <Col span={18}>
        <Input
          placeholder="Additional remarks for this specific day"
          size="small"
          value={individualModifications[date]?.notes || ''}
          onChange={(e) => onIndividualModification(date, 'notes', e.target.value)}
        />
      </Col>
    </Row>

    {/* Off in Lieu Date Earned */}
    {entryType === 'off_in_lieu' && (
      <Row style={{ marginTop: 12 }}>
        <Col span={24}>
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#fafafa', 
            borderRadius: '6px',
            border: hasEarnedDate ? '1px solid #d9f7be' : '1px solid #ffccc7'
          }}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: 8 }}>
              Date Earned for {dayjs(date).format('MMM DD')}:
            </Text>
            <OffInLieuSelector
              value={individualModifications[date]?.dateEarned}
              onChange={(earnedDate) => onIndividualModification(date, 'dateEarned', earnedDate)}
            />
          </div>
        </Col>
      </Row>
    )}
  </div>
);

export default BulkSelectionModal;