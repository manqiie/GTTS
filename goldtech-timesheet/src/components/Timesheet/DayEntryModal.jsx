import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  Button, 
  Upload, 
  message
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import WorkingHoursSelector from './WorkingHoursSelector';
import OffInLieuSelector from './OffInLieuSelector';

const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * DayEntryModal Component with Off in Lieu support and cascading Others dropdown
 */
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

  // Main entry type options (with Others option)
  const mainEntryTypeOptions = [
    { value: 'working_hours', label: 'Working Hours' },
    { value: 'annual_leave', label: 'Annual Leave' },
    { value: 'medical_leave', label: 'Medical Leave' },
    { value: 'off_in_lieu', label: 'Off in Lieu' },
    { value: 'day_off', label: 'Public Holiday' },
    { value: 'others', label: 'Others' }
  ];

  // Others dropdown options
  const othersEntryTypeOptions = [
    { value: 'childcare_leave', label: 'Childcare Leave' },
    { value: 'childcare_leave_halfday', label: 'Childcare Leave (Half Day)' },
    { value: 'shared_parental_leave', label: 'Shared Parental Leave' },
    { value: 'nopay_leave', label: 'No Pay Leave' },
    { value: 'hospitalization_leave', label: 'Hospitalization Leave' },
    { value: 'reservist', label: 'Reservist' },
    { value: 'paternity_leave', label: 'Paternity Leave' },
    { value: 'compassionate_leave', label: 'Compassionate Leave' },
    { value: 'maternity_leave', label: 'Maternity Leave' }
  ];

  const documentRequiredTypes = ['medical_leave', 'annual_leave'];

  // Helper function to check if entry type is in others category
  const isOthersEntryType = (type) => {
    return othersEntryTypeOptions.some(option => option.value === type);
  };

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
          dateEarned: existingEntry.dateEarned || null
        });
        
        setEntryType(existingEntry.type);
        setShowOthersDropdown(isOthersType);
        setDateEarned(existingEntry.dateEarned || null);
        
        if (existingEntry.type === 'working_hours') {
          const matchingHours = findMatchingHours(existingEntry.startTime, existingEntry.endTime);
          setSelectedHoursId(matchingHours ? matchingHours.id : 'custom');
        }
      } else {
        form.resetFields();
        form.setFieldsValue({
          date: dayjs(date)
        });
        setEntryType(null);
        setSelectedHoursId(null);
        setDateEarned(null);
        setShowOthersDropdown(false);
      }
      setFileList([]);
    }
  }, [visible, date, existingEntry, form]);

  /**
   * Find matching hours preset
   */
  const findMatchingHours = (startTime, endTime) => {
    const allHours = [
      { id: '9-18', startTime: '09:00', endTime: '18:00' },
      ...customHoursList
    ];
    
    return allHours.find(h => h.startTime === startTime && h.endTime === endTime);
  };

  /**
   * Handle main entry type change
   */
  const handleEntryTypeChange = (value) => {
    if (value === 'others') {
      setShowOthersDropdown(true);
      setEntryType(null); // Reset until others selection is made
      form.setFieldValue('othersEntryType', undefined);
    } else {
      setShowOthersDropdown(false);
      setEntryType(value);
      form.setFieldValue('othersEntryType', undefined);
      
      if (value === 'working_hours') {
        if (defaultHours) {
          setSelectedHoursId(defaultHours.id);
          form.setFieldsValue({
            startTime: dayjs(defaultHours.startTime, 'HH:mm'),
            endTime: dayjs(defaultHours.endTime, 'HH:mm')
          });
        }
      } else {
        setSelectedHoursId(null);
        form.setFieldsValue({
          startTime: null,
          endTime: null
        });
      }
    }

    // Reset date earned when changing entry type
    if (value !== 'off_in_lieu') {
      setDateEarned(null);
      form.setFieldValue('dateEarned', null);
    }
  };

  /**
   * Handle others entry type change
   */
  const handleOthersEntryTypeChange = (value) => {
    setEntryType(value);
    
    // Reset working hours related fields for others types
    setSelectedHoursId(null);
    form.setFieldsValue({
      startTime: null,
      endTime: null
    });

    // Reset date earned for others types (none of them are off_in_lieu)
    setDateEarned(null);
    form.setFieldValue('dateEarned', null);
  };

  /**
   * Handle working hours selection change
   */
  const handleHoursChange = (hoursId) => {
    setSelectedHoursId(hoursId);
  };

  /**
   * Handle date earned change for Off in Lieu
   */
  const handleDateEarnedChange = (date) => {
    setDateEarned(date);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        // Get the actual entry type (either direct selection or from others dropdown)
        const actualEntryType = showOthersDropdown ? values.othersEntryType : values.entryType;
        
        if (!actualEntryType) {
          message.warning('Please select a valid entry type');
          return;
        }

        // Validate document requirement
        if (documentRequiredTypes.includes(actualEntryType) && fileList.length === 0) {
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
          ...(fileList.length > 0 && {
            supportingDocuments: fileList.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type
            }))
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

  /**
   * Handle file upload
   */
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList: fileList,
    beforeUpload: (file) => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword'].includes(file.type);
      if (!isValidType) {
        message.error('You can only upload PDF, JPG, PNG, or DOC files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
        return false;
      }
      return false;
    },
    onChange: handleFileChange,
    onRemove: (file) => {
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(newFileList);
    }
  };

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
            onChange={handleEntryTypeChange}
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
              onChange={handleOthersEntryTypeChange}
              options={othersEntryTypeOptions}
            />
          </Form.Item>
        )}

        {/* Working Hours Selection */}
        {entryType === 'working_hours' && (
          <>
            <Form.Item label="Working Hours Preset">
              <WorkingHoursSelector
                customHoursList={customHoursList}
                selectedHoursId={selectedHoursId}
                onHoursChange={handleHoursChange}
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
                onChange={handleDateEarnedChange}
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
        {documentRequiredTypes.includes(entryType) && (
          <Form.Item 
            label="Supporting Documents" 
            name="supportingDocs"
            rules={[{ required: true, message: 'Please select entry type' }]}
            extra="Upload supporting documents (PDF, JPG, PNG, DOC - Max 5MB each)"
            
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for single or bulk upload. Maximum file size: 5MB
              </p>
            </Dragger>
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