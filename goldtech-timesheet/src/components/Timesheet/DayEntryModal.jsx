// Updated DayEntryModal.jsx - Send documents to backend
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  Button, 
  message,
  Radio
} from 'antd';
import dayjs from 'dayjs';
import WorkingHoursSelector from './WorkingHoursSelector';
import OffInLieuSelector from './OffInLieuSelector';
import SupportingDocuments from './SupportingDocuments';

const { TextArea } = Input;

function DayEntryModal({ 
  visible, 
  date, 
  existingEntry, 
  customHoursList, 
  defaultHours,
  onSave, 
  onCancel,
  onAddCustomHours,
  onRemoveCustomHours
}) {
  const [form] = Form.useForm();
  const [entryType, setEntryType] = useState(null);
  const [selectedHoursId, setSelectedHoursId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [dateEarned, setDateEarned] = useState(null);
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);

  // Entry type options
  const mainEntryTypeOptions = [
    { value: 'working_hours', label: 'Working Hours' },
    { value: 'annual_leave', label: 'Annual Leave' },
    { value: 'annual_leave_halfday', label: 'Annual Leave (Half Day)' },
    { value: 'medical_leave', label: 'Medical Leave' },
    { value: 'off_in_lieu', label: 'Off in Lieu' },
    { value: 'day_off', label: 'Public Holiday' },
    { value: 'others', label: 'Others' }
  ];

  const othersEntryTypeOptions = [
    { value: 'childcare_leave', label: 'Childcare Leave' },
    { value: 'childcare_leave_halfday', label: 'Childcare Leave (Half Day)' },
    { value: 'shared_parental_leave', label: 'Shared Parental Leave' },
    { value: 'nopay_leave', label: 'No Pay Leave' },
    { value: 'nopay_leave_halfday', label: 'No Pay Leave (Half Day)' },
    { value: 'hospitalization_leave', label: 'Hospitalization Leave' },
    { value: 'reservist', label: 'Reservist' },
    { value: 'paternity_leave', label: 'Paternity Leave' },
    { value: 'compassionate_leave', label: 'Compassionate Leave' },
    { value: 'maternity_leave', label: 'Maternity Leave' }
  ];

  // Define which entry types require documents
  const documentRequiredTypes = [
    'annual_leave', 'annual_leave_halfday', 'medical_leave',
    'childcare_leave', 'childcare_leave_halfday', 'shared_parental_leave',
    'nopay_leave', 'nopay_leave_halfday', 'hospitalization_leave',
    'reservist', 'paternity_leave', 'compassionate_leave', 'maternity_leave'
  ];

  // Half day types that need AM/PM selection
  const halfDayTypes = [
    'annual_leave_halfday', 'childcare_leave_halfday', 'nopay_leave_halfday'
  ];

  // Helper functions
  const isOthersEntryType = (type) => {
    return othersEntryTypeOptions.some(option => option.value === type);
  };

  const requiresDocuments = (type) => {
    return documentRequiredTypes.includes(type);
  };

  const isHalfDayType = (type) => {
    return halfDayTypes.includes(type);
  };

  // Handle supporting documents change
  const handleDocumentsChange = (newFileList) => {
    setFileList(newFileList);
  };

  // Convert fileList to format expected by backend
  const prepareDocumentsForBackend = () => {
    return fileList.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      base64Data: file.base64Data
    }));
  };

  // Handle form submission with document support
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        const actualEntryType = showOthersDropdown ? values.othersEntryType : values.entryType;
        
        if (!actualEntryType) {
          message.warning('Please select a valid entry type');
          return;
        }

        // Validate half day period
        if (isHalfDayType(actualEntryType) && !values.halfDayPeriod) {
          message.warning('Please select AM or PM for half day leave');
          return;
        }

        // Validate document requirement
        if (requiresDocuments(actualEntryType) && fileList.length === 0) {
          message.warning('Supporting documents are required for this leave type');
          return;
        }

        // Validate Off in Lieu date earned
        if (actualEntryType === 'off_in_lieu' && !dateEarned) {
          message.warning('Date earned is required for Off in Lieu entries');
          return;
        }

        const entryData = {
          date: values.date.format('YYYY-MM-DD'),
          type: actualEntryType,
          notes: values.notes || '',
          ...(actualEntryType === 'working_hours' && {
            startTime: values.startTime.format('HH:mm'),
            endTime: values.endTime.format('HH:mm')
          }),
          ...(actualEntryType === 'off_in_lieu' && {
            dateEarned: dateEarned
          }),
          ...(isHalfDayType(actualEntryType) && {
            halfDayPeriod: values.halfDayPeriod
          }),
          // Add supporting documents
          ...(fileList.length > 0 && {
            supportingDocuments: prepareDocumentsForBackend()
          })
        };

        onSave(entryData);
        form.resetFields();
        setEntryType(null);
        setSelectedHoursId(null);
        setDateEarned(null);
        setFileList([]);
        setShowOthersDropdown(false);
      })
      .catch(error => {
        console.error('Form validation failed:', error);
      });
  };

  // [Include all other existing handler methods like handleEntryTypeChange, etc.]
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible && date) {
      if (existingEntry) {
        const isOthersType = isOthersEntryType(existingEntry.type);
        
        form.setFieldsValue({
          date: dayjs(date),
          entryType: isOthersType ? 'others' : existingEntry.type,
          othersEntryType: isOthersType ? existingEntry.type : undefined,
          notes: existingEntry.notes || '',
          startTime: existingEntry.startTime ? dayjs(existingEntry.startTime, 'HH:mm') : null,
          endTime: existingEntry.endTime ? dayjs(existingEntry.endTime, 'HH:mm') : null,
          dateEarned: existingEntry.dateEarned || null,
          halfDayPeriod: existingEntry.halfDayPeriod || undefined
        });
        
        setEntryType(existingEntry.type);
        setShowOthersDropdown(isOthersType);
        setDateEarned(existingEntry.dateEarned || null);
        
        // Load existing documents if any
        if (existingEntry.supportingDocuments) {
          const existingFiles = existingEntry.supportingDocuments.map((doc, index) => ({
            uid: `existing-${index}`,
            name: doc.name,
            status: 'done',
            size: doc.size,
            type: doc.type
          }));
          setFileList(existingFiles);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({ date: dayjs(date) });
        setEntryType(null);
        setSelectedHoursId(null);
        setDateEarned(null);
        setShowOthersDropdown(false);
        setFileList([]);
      }
    }
  }, [visible, date, existingEntry, form]);

  return (
    <Modal
      title="Edit Day Entry"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={700}
      okText="Save Entry"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker style={{ width: '100%' }} disabled />
        </Form.Item>

        <Form.Item
          label="Entry Type"
          name="entryType"
          rules={[{ required: true, message: 'Please select entry type' }]}
        >
          <Select
            placeholder="Select entry type"
            onChange={(value) => {
              // Handle entry type change logic here
              setEntryType(value === 'others' ? null : value);
              setShowOthersDropdown(value === 'others');
              if (value !== 'others') {
                form.setFieldValue('othersEntryType', undefined);
              }
              setFileList([]);
            }}
            options={mainEntryTypeOptions}
          />
        </Form.Item>

        {/* Others Entry Type Dropdown */}
        {showOthersDropdown && (
          <Form.Item
            label="Select Leave Type"
            name="othersEntryType"
            rules={[{ required: true, message: 'Please select a leave type' }]}
          >
            <Select
              placeholder="Select specific leave type"
              onChange={(value) => {
                setEntryType(value);
                setFileList([]);
              }}
              options={othersEntryTypeOptions}
            />
          </Form.Item>
        )}

        {/* Half Day Period Selection */}
        {entryType && isHalfDayType(entryType) && (
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
        )}

        {/* Working Hours Selection */}
        {entryType === 'working_hours' && (
          <>
            <Form.Item label="Working Hours Preset">
              <WorkingHoursSelector
                customHoursList={customHoursList}
                selectedHoursId={selectedHoursId}
                onHoursChange={setSelectedHoursId}
                onAddCustomHours={onAddCustomHours}
                onRemoveCustomHours={onRemoveCustomHours}
                form={form}
              />
            </Form.Item>

            {/* Hidden form fields for start/end time */}
            <Form.Item name="startTime" hidden>
              <input type="hidden" />
            </Form.Item>
            <Form.Item name="endTime" hidden>
              <input type="hidden" />
            </Form.Item>
          </>
        )}

        {/* Off in Lieu Date Earned Selection */}
        {entryType === 'off_in_lieu' && (
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
        )}

        {/* Supporting Documents */}
        {entryType && requiresDocuments(entryType) && (
          <Form.Item label="Supporting Documents">
            <SupportingDocuments
              fileList={fileList}
              onChange={handleDocumentsChange}
              required={true}
              helpText={`Upload supporting documents for ${entryType.replace(/_/g, ' ')} (PDF, JPG, PNG, DOC - Max 5MB each)`}
            />
          </Form.Item>
        )}

        <Form.Item label="Notes" name="notes">
          <TextArea rows={3} placeholder="Add any additional remarks..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default DayEntryModal;