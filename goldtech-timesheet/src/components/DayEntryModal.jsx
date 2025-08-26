import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  TimePicker, 
  Button, 
  Space, 
  Upload, 
  Row, 
  Col,
  message,
  Divider
} from 'antd';
import { PlusOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * DayEntryModal Component
 * 
 * Modal for editing individual day entries with:
 * - Entry type selection (working hours, leaves, etc.)
 * - Dynamic working hours input when "working_hours" is selected
 * - Custom hours creation and management
 * - File upload for leave types
 * - Notes field
 */
function DayEntryModal({ 
  visible, 
  date, 
  existingEntry, 
  customHoursList, 
  defaultHours,
  onSave, 
  onCancel,
  onAddCustomHours 
}) {
  const [form] = Form.useForm();
  const [entryType, setEntryType] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStartTime, setCustomStartTime] = useState(dayjs('09:00', 'HH:mm'));
  const [customEndTime, setCustomEndTime] = useState(dayjs('18:00', 'HH:mm'));
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

  // Leave types that require documents
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
          // Find matching hours preset
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
      setShowCustomInput(false);
      setFileList([]);
    }
  }, [visible, date, existingEntry, form]);

  /**
   * Find matching hours preset
   */
  const findMatchingHours = (startTime, endTime) => {
    const allHours = [
      { id: '9-18', startTime: '09:00', endTime: '18:00' },
      { id: '9-17', startTime: '09:00', endTime: '17:00' },
      { id: '10-18', startTime: '10:00', endTime: '18:00' },
      { id: '8-17', startTime: '08:00', endTime: '17:00' },
      { id: '8:30-17:30', startTime: '08:30', endTime: '17:30' },
      ...customHoursList
    ];
    
    return allHours.find(h => h.startTime === startTime && h.endTime === endTime);
  };

  /**
   * Generate hours options for working hours selection
   */
  const getHoursOptions = () => {
    const predefinedOptions = [
      { value: '9-18', label: '9:00 AM - 6:00 PM', startTime: '09:00', endTime: '18:00' },
      { value: '9-17', label: '9:00 AM - 5:00 PM', startTime: '09:00', endTime: '17:00' },
      { value: '10-18', label: '10:00 AM - 6:00 PM', startTime: '10:00', endTime: '18:00' },
      { value: '8-17', label: '8:00 AM - 5:00 PM', startTime: '08:00', endTime: '17:00' },
      { value: '8:30-17:30', label: '8:30 AM - 5:30 PM', startTime: '08:30', endTime: '17:30' },
    ];

    const customOptions = customHoursList.map(custom => ({
      value: custom.id,
      label: `${dayjs(custom.startTime, 'HH:mm').format('h:mm A')} - ${dayjs(custom.endTime, 'HH:mm').format('h:mm A')} (Custom)`,
      startTime: custom.startTime,
      endTime: custom.endTime,
      isCustom: true
    }));

    return [
      ...predefinedOptions,
      ...customOptions,
      { value: 'add-custom', label: '+ Add Custom Hours' }
    ];
  };

  /**
   * Handle entry type change
   */
  const handleEntryTypeChange = (value) => {
    setEntryType(value);
    
    if (value === 'working_hours') {
      // Pre-select default hours if available
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
   * Handle hours selection
   */
  const handleHoursChange = (value) => {
    if (value === 'add-custom') {
      setShowCustomInput(true);
      return;
    }

    setSelectedHoursId(value);
    const selectedOption = getHoursOptions().find(opt => opt.value === value);
    
    if (selectedOption) {
      form.setFieldsValue({
        startTime: dayjs(selectedOption.startTime, 'HH:mm'),
        endTime: dayjs(selectedOption.endTime, 'HH:mm')
      });
    }
  };

  /**
   * Save custom working hours
   */
  const handleSaveCustomHours = () => {
    if (!customStartTime || !customEndTime) {
      message.warning('Please set both start and end times');
      return;
    }

    if (customStartTime.isAfter(customEndTime)) {
      message.warning('End time must be after start time');
      return;
    }

    const startTime = customStartTime.format('HH:mm');
    const endTime = customEndTime.format('HH:mm');
    
    // Check for duplicates
    const allOptions = getHoursOptions();
    const isDuplicate = allOptions.some(
      option => option.startTime === startTime && option.endTime === endTime
    );

    if (isDuplicate) {
      message.warning('This time combination already exists');
      return;
    }

    const customId = `custom-${Date.now()}`;
    const newCustomHours = { id: customId, startTime, endTime };
    
    onAddCustomHours(newCustomHours);
    
    // Select the new custom hours
    setSelectedHoursId(customId);
    form.setFieldsValue({
      startTime: customStartTime,
      endTime: customEndTime
    });
    
    setShowCustomInput(false);
    message.success('Custom working hours added successfully');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        // Validate document requirement
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
      return false; // Prevent auto upload
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
      width={600}
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

        {/* Working Hours Selection - Only show when entry type is working_hours */}
        {entryType === 'working_hours' && (
          <>
            <Form.Item label="Working Hours Preset">
              <Select
                value={selectedHoursId}
                onChange={handleHoursChange}
                placeholder="Select working hours"
                options={getHoursOptions()}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Start Time"
                  name="startTime"
                  rules={[{ required: true, message: 'Please select start time' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="End Time"
                  name="endTime"
                  rules={[{ required: true, message: 'Please select end time' }]}
                >
                  <TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
            </Row>

            {/* Custom Hours Input */}
            {showCustomInput && (
              <>
                <Divider>Add Custom Working Hours</Divider>
                <Row gutter={16} align="middle">
                  <Col span={8}>
                    <TimePicker
                      value={customStartTime}
                      onChange={setCustomStartTime}
                      format="HH:mm"
                      placeholder="Start Time"
                    />
                  </Col>
                  <Col span={8}>
                    <TimePicker
                      value={customEndTime}
                      onChange={setCustomEndTime}
                      format="HH:mm"
                      placeholder="End Time"
                    />
                  </Col>
                  <Col span={8}>
                    <Space>
                      <Button type="primary" size="small" onClick={handleSaveCustomHours}>
                        Save
                      </Button>
                      <Button size="small" onClick={() => setShowCustomInput(false)}>
                        Cancel
                      </Button>
                    </Space>
                  </Col>
                </Row>
                {customStartTime && customEndTime && (
                  <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    Preview: {customStartTime.format('h:mm A')} - {customEndTime.format('h:mm A')}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Supporting Documents - Show for leave types */}
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