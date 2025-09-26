// DayEntryEditForm.jsx - Updated with Delete Option for Draft Mode
import React, { useEffect } from 'react';
import { Form, Select, Input, DatePicker, Radio, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import OffInLieuSelector from '../OffInLieuSelector';
import { entryTypeConfig } from './entryTypeConfig';
import SharedDocumentsSection from './SharedDocumentsSection';
import SharedWorkingHoursSection from './SharedWorkingHoursSection';

const { TextArea } = Input;

function DayEntryEditForm({
  date,    
  existingEntry,
  customHoursList,
  defaultHours,
  entryType,
  setEntryType,
  selectedHoursId,
  setSelectedHoursId,
  fileList,
  setFileList,
  dateEarned,
  setDateEarned,
  showOthersDropdown,
  setShowOthersDropdown,
  onAddCustomHours,
  onRemoveCustomHours,
  onSubmit,
  onCancel,
  onDelete = null // New prop for delete functionality
}) {
  const [form] = Form.useForm();

  // Initialize form when entry data changes
  useEffect(() => {
    if (date) {
      if (existingEntry) {
        const isOthersType = entryTypeConfig.isOthersEntryType(existingEntry.type);
        
        form.setFieldsValue({
          date: dayjs(date),
          entryType: isOthersType ? 'others' : existingEntry.type,
          othersEntryType: isOthersType ? existingEntry.type : undefined,
          notes: existingEntry.notes || '',
          startTime: existingEntry.startTime ? dayjs(existingEntry.startTime, 'HH:mm') : null,
          endTime: existingEntry.endTime ? dayjs(existingEntry.endTime, 'HH:mm') : null,
          halfDayPeriod: existingEntry.halfDayPeriod || undefined
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ date: dayjs(date) });
      }
    }
  }, [date, existingEntry, form]);

  // Handle entry type change
  const handleEntryTypeChange = (value) => {
    if (value === 'others') {
      setShowOthersDropdown(true);
      setEntryType(null);
      form.setFieldValue('othersEntryType', undefined);
    } else {
      setShowOthersDropdown(false);
      setEntryType(value);
      form.setFieldValue('othersEntryType', undefined);
      
      // Auto-select default hours for working hours
      if (value === 'working_hours' && defaultHours) {
        setSelectedHoursId(defaultHours.id);
        form.setFieldsValue({
          startTime: dayjs(defaultHours.startTime, 'HH:mm'),
          endTime: dayjs(defaultHours.endTime, 'HH:mm')
        });
      } else {
        setSelectedHoursId(null);
        form.setFieldsValue({
          startTime: null,
          endTime: null
        });
      }
    }
    
    // Reset file list and half day period when changing entry type
    setFileList([]);
    form.setFieldValue('halfDayPeriod', undefined);
  };

  // Handle others entry type change
  const handleOthersEntryTypeChange = (value) => {
    setEntryType(value);
    setSelectedHoursId(null);
    form.setFieldsValue({
      startTime: null,
      endTime: null
    });
    setFileList([]);
    form.setFieldValue('halfDayPeriod', undefined);
  };


  // Handle form submission
  const handleFormSubmit = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
      })
      .catch(error => {
        console.error('Form validation failed:', error);
      });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled />
        </Form.Item>

        <EntryTypeSelector
          form={form}
          onEntryTypeChange={handleEntryTypeChange}
          showOthersDropdown={showOthersDropdown}
          onOthersEntryTypeChange={handleOthersEntryTypeChange}
        />

        {/* Half Day Period Selection */}
        {entryType && entryTypeConfig.isHalfDayType(entryType) && (
          <HalfDayPeriodSelector />
        )}

        {/* Working Hours Selection */}
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

        {/* Off in Lieu Date Earned Selection */}
        {entryType === 'off_in_lieu' && (
          <OffInLieuSection
            dateEarned={dateEarned}
            setDateEarned={setDateEarned}
            form={form}
          />
        )}

        {/* Supporting Documents */}
        {entryType && entryTypeConfig.requiresDocuments(entryType) && (
          <SharedDocumentsSection
            entryType={entryType}
            fileList={fileList}
            setFileList={setFileList}
            isBulkMode={false}
          />
        )}

        <Form.Item label="Notes" name="notes">
          <TextArea rows={3} placeholder="Add any additional remarks..." />
        </Form.Item>
      </Form>

      {/* Form Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid #f0f0f0'
      }}>
        {/* Delete Button - Only show for existing entries */}
        <div>
          {existingEntry && onDelete && (
            <Popconfirm
              title="Delete this entry?"
              description="This will remove the entry from your timesheet."
              onConfirm={handleDeleteConfirm}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button 
                icon={<DeleteOutlined />} 
                danger 
                type="text"
              >
                Delete Entry
              </Button>
            </Popconfirm>
          )}
        </div>

        {/* Save/Cancel Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleFormSubmit}>
            {existingEntry ? 'Update Entry' : 'Add Entry'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Entry Type Selector Component
const EntryTypeSelector = ({ 
  form, 
  onEntryTypeChange, 
  showOthersDropdown, 
  onOthersEntryTypeChange 
}) => (
  <>
    <Form.Item
      label="Entry Type"
      name="entryType"
      rules={[{ required: true, message: 'Please select entry type' }]}
    >
      <Select
        placeholder="Select entry type"
        onChange={onEntryTypeChange}
        options={entryTypeConfig.mainEntryTypeOptions}
      />
    </Form.Item>

    {showOthersDropdown && (
      <Form.Item
        label="Select Leave Type"
        name="othersEntryType"
        rules={[{ required: true, message: 'Please select a leave type' }]}
      >
        <Select
          placeholder="Select specific leave type"
          onChange={onOthersEntryTypeChange}
          options={entryTypeConfig.othersEntryTypeOptions}
        />
      </Form.Item>
    )}
  </>
);

// Half Day Period Selector Component
const HalfDayPeriodSelector = () => (
  <Form.Item
    label="Half Day Period"
    name="halfDayPeriod"
    rules={[{ required: true, message: 'Please select AM or PM' }]}
  >
    <Radio.Group>
      <Radio value="AM">AM (Morning)</Radio>
      <Radio value="PM">PM (Afternoon)</Radio>
    </Radio.Group>
  </Form.Item>
);

// Off in Lieu Section Component
const OffInLieuSection = ({ dateEarned, setDateEarned, form }) => (
  <>
    <Form.Item 
      label="Date Earned"
      help="When was this overtime/extra work performed?"
    >
      <OffInLieuSelector
        value={dateEarned}
        onChange={setDateEarned}
        form={form}
      />
    </Form.Item>

    {/* Hidden form field for date earned */}
    <Form.Item name="dateEarned" hidden>
      <input type="hidden" />
    </Form.Item>
  </>
);

export default DayEntryEditForm;