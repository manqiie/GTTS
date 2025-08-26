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

const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * DayEntryModal Component using WorkingHoursSelector
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

  // Entry type options
  const entryTypeOptions = [
    { value: 'working_hours', label: 'Working Hours' },
    { value: 'rotating_shift', label: 'Rotating Shift' },
    { value: 'annual_leave', label: 'Annual Leave' },
    { value: 'medical_leave', label: 'Medical Leave' },
    { value: 'off_in_lieu', label: 'Off in Lieu' },
    { value: 'emergency_leave', label: 'Emergency Leave' },
    { value: 'day_off', label: 'Day Off' }
  ];

  const documentRequiredTypes = ['medical_leave', 'emergency_leave'];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible && date) {
      if (existingEntry) {
        form.setFieldsValue({
          date: dayjs(date),
          entryType: existingEntry.type,
          notes: existingEntry.notes || '',
          startTime: existingEntry.startTime ? dayjs(existingEntry.startTime, 'HH:mm') : null,
          endTime: existingEntry.endTime ? dayjs(existingEntry.endTime, 'HH:mm') : null
        });
        setEntryType(existingEntry.type);
        
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
   * Handle entry type change
   */
  const handleEntryTypeChange = (value) => {
    setEntryType(value);
    
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
  };

  /**
   * Handle working hours selection change
   */
  const handleHoursChange = (hoursId) => {
    setSelectedHoursId(hoursId);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        if (documentRequiredTypes.includes(values.entryType) && fileList.length === 0) {
          message.warning('Supporting documents are required for this leave type');
          return;
        }

        const entryData = {
          date: values.date.format('YYYY-MM-DD'),
          type: values.entryType,
          notes: values.notes || '',
          ...(values.entryType === 'working_hours' && {
            startTime: values.startTime.format('HH:mm'),
            endTime: values.endTime.format('HH:mm')
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
        setFileList([]);
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
            options={entryTypeOptions}
          />
        </Form.Item>

        {/* Working Hours Selection using reusable component */}
        {entryType === 'working_hours' && (
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
        )}

        {/* Supporting Documents */}
        {documentRequiredTypes.includes(entryType) && (
          <Form.Item 
            label="Supporting Documents" 
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

        <Form.Item label="Notes (Optional)" name="notes">
          <TextArea rows={3} placeholder="Add any additional notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default DayEntryModal;