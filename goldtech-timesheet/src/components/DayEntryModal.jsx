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
  Divider,
  Popconfirm
} from 'antd';
import { PlusOutlined, DeleteOutlined, InboxOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * DayEntryModal Component with Enhanced Custom Hours Management
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
  onRemoveCustomHours // New prop for removing custom hours
}) {
  const [form] = Form.useForm();
  const [entryType, setEntryType] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStartTime, setCustomStartTime] = useState(dayjs('09:00', 'HH:mm'));
  const [customEndTime, setCustomEndTime] = useState(dayjs('18:00', 'HH:mm'));
  const [selectedHoursId, setSelectedHoursId] = useState(null);
  const [fileList, setFileList] = useState([]);
  
  // For manual time input
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');

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
      setShowCustomInput(false);
      setFileList([]);
      setStartTimeInput('');
      setEndTimeInput('');
    }
  }, [visible, date, existingEntry, form]);

  /**
   * Parse time input like "9:30 AM" or "14:30" to dayjs object
   */
  const parseTimeInput = (timeStr) => {
    if (!timeStr) return null;
    
    const cleanInput = timeStr.trim().toLowerCase();
    
    // Check if it contains AM/PM
    if (cleanInput.includes('am') || cleanInput.includes('pm')) {
      try {
        return dayjs(cleanInput, ['h:mm A', 'hh:mm A', 'h A', 'hh A']);
      } catch {
        return null;
      }
    } else {
      // 24-hour format
      try {
        return dayjs(cleanInput, ['H:mm', 'HH:mm']);
      } catch {
        return null;
      }
    }
  };

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
   * Generate hours options with delete functionality for custom hours
   */
  const getHoursOptions = () => {
    const predefinedOptions = [
      { value: '9-18', label: '9:00 AM - 6:00 PM', startTime: '09:00', endTime: '18:00' },
  
    ];

    const customOptions = customHoursList.map(custom => ({
      value: custom.id,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {dayjs(custom.startTime, 'HH:mm').format('h:mm A')} - {dayjs(custom.endTime, 'HH:mm').format('h:mm A')} (Custom)
          </span>
          <Popconfirm
            title="Delete this custom time?"
            description="This action cannot be undone."
            onConfirm={(e) => {
              e.stopPropagation();
              handleDeleteCustomHours(custom.id);
            }}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined />} 
              onClick={(e) => e.stopPropagation()}
              style={{ color: '#ff4d4f', marginLeft: 8 }}
            />
          </Popconfirm>
        </div>
      ),
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
   * Handle deleting custom hours
   */
  const handleDeleteCustomHours = (customId) => {
    if (onRemoveCustomHours) {
      onRemoveCustomHours(customId);
      
      // If the deleted item was selected, clear selection
      if (selectedHoursId === customId) {
        setSelectedHoursId(null);
        form.setFieldsValue({
          startTime: null,
          endTime: null
        });
      }
      
      message.success('Custom hours deleted successfully');
    }
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
   * Handle hours selection
   */
  const handleHoursChange = (value) => {
    if (value === 'add-custom') {
      setShowCustomInput(true);
      setStartTimeInput('');
      setEndTimeInput('');
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
   * Handle manual time input changes
   */
  const handleTimeInputChange = (field, value) => {
    if (field === 'start') {
      setStartTimeInput(value);
      const parsedTime = parseTimeInput(value);
      if (parsedTime && parsedTime.isValid()) {
        setCustomStartTime(parsedTime);
      }
    } else {
      setEndTimeInput(value);
      const parsedTime = parseTimeInput(value);
      if (parsedTime && parsedTime.isValid()) {
        setCustomEndTime(parsedTime);
      }
    }
  };

  /**
   * Save custom working hours and add to dropdown immediately
   */
  const handleSaveCustomHours = () => {
    // Parse manual inputs if provided
    let finalStartTime = customStartTime;
    let finalEndTime = customEndTime;

    if (startTimeInput) {
      const parsedStart = parseTimeInput(startTimeInput);
      if (parsedStart && parsedStart.isValid()) {
        finalStartTime = parsedStart;
      } else {
        message.error('Invalid start time format. Use formats like "9:30 AM" or "14:30"');
        return;
      }
    }

    if (endTimeInput) {
      const parsedEnd = parseTimeInput(endTimeInput);
      if (parsedEnd && parsedEnd.isValid()) {
        finalEndTime = parsedEnd;
      } else {
        message.error('Invalid end time format. Use formats like "5:30 PM" or "17:30"');
        return;
      }
    }

    if (!finalStartTime || !finalEndTime) {
      message.warning('Please set both start and end times');
      return;
    }

    if (finalStartTime.isAfter(finalEndTime) || finalStartTime.isSame(finalEndTime)) {
      message.warning('End time must be after start time');
      return;
    }

    const startTime = finalStartTime.format('HH:mm');
    const endTime = finalEndTime.format('HH:mm');
    
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
    
    // Automatically select the new custom hours
    setSelectedHoursId(customId);
    form.setFieldsValue({
      startTime: finalStartTime,
      endTime: finalEndTime
    });
    
    setShowCustomInput(false);
    setStartTimeInput('');
    setEndTimeInput('');
    message.success('Custom working hours added and selected');
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

        {/* Working Hours Selection */}
        {entryType === 'working_hours' && (
          <>
            <Form.Item label="Working Hours Preset">
              <Select
                value={selectedHoursId}
                onChange={handleHoursChange}
                placeholder="Select working hours"
                options={getHoursOptions()}
                optionRender={(option) => option.data.label}
              />
            </Form.Item>

            {/* Enhanced Custom Hours Input */}
            {showCustomInput && (
              <>
                <Form.Item label="Add Custom Working Hours">
                  {/* Time Picker Row */}
                  <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                    <Col span={10}>
                      <TimePicker
                        value={customStartTime}
                        onChange={setCustomStartTime}
                        format="h:mm A"
                        use12Hours
                        placeholder="Start Time"
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col span={10}>
                      <TimePicker
                        value={customEndTime}
                        onChange={setCustomEndTime}
                        format="h:mm A"
                        use12Hours
                        placeholder="End Time"
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col span={4}>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<CloseOutlined />}
                        onClick={() => setShowCustomInput(false)}
                        style={{ color: '#999' }}
                      />
                    </Col>
                  </Row>

                  {/* Action Buttons */}
                  <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                    <Col span={24}>
                      <Space>
                        <Button type="primary" onClick={handleSaveCustomHours}>
                          Save & Select
                        </Button>
                        <Button onClick={() => setShowCustomInput(false)}>
                          Cancel
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Form.Item>

              </>
            )}
          </>
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