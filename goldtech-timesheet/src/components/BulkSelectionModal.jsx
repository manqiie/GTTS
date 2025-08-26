import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  TimePicker, 
  Button, 
  Space, 
  Upload, 
  Row, 
  Col,
  message,
  Divider,
  List,
  Tag,
  Typography,
  Checkbox
} from 'antd';
import { PlusOutlined, InboxOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

/**
 * BulkSelectionModal Component
 * 
 * Modal for editing multiple days at once with:
 * - Entry type selection that applies to all selected days
 * - Primary document day selection for leave types
 * - Auto-reference functionality for subsequent days
 * - Visual linking of connected days
 * - Individual day modification capability
 */
function BulkSelectionModal({ 
  visible, 
  dates, 
  customHoursList, 
  defaultHours,
  onSave, 
  onCancel,
  onAddCustomHours 
}) {
  const [form] = Form.useForm();
  const [entryType, setEntryType] = useState(null);
  const [primaryDocumentDay, setPrimaryDocumentDay] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customStartTime, setCustomStartTime] = useState(dayjs('09:00', 'HH:mm'));
  const [customEndTime, setCustomEndTime] = useState(dayjs('18:00', 'HH:mm'));
  const [selectedHoursId, setSelectedHoursId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [individualModifications, setIndividualModifications] = useState({});

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
  const documentRequiredTypes = ['medical_leave', 'emergency_leave', 'annual_leave'];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible && dates.length > 0) {
      form.resetFields();
      setEntryType(null);
      setSelectedHoursId(null);
      setPrimaryDocumentDay(null);
      setFileList([]);
      setIndividualModifications({});
      setShowCustomInput(false);
    }
  }, [visible, dates, form]);

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

    // Set first date as primary document day for document-required types
    if (documentRequiredTypes.includes(value)) {
      setPrimaryDocumentDay(dates[0]);
    } else {
      setPrimaryDocumentDay(null);
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
    
    setSelectedHoursId(customId);
    form.setFieldsValue({
      startTime: customStartTime,
      endTime: customEndTime
    });
    
    setShowCustomInput(false);
    message.success('Custom working hours added successfully');
  };

  /**
   * Handle individual day modification
   */
  const handleIndividualModification = (date, field, value) => {
    setIndividualModifications(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value
      }
    }));
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

        const bulkData = dates.map(date => {
          const baseData = {
            date,
            type: values.entryType,
            notes: values.notes || '',
            ...(values.entryType === 'working_hours' && {
              startTime: values.startTime.format('HH:mm'),
              endTime: values.endTime.format('HH:mm')
            })
          };

          // Apply individual modifications
          const modifications = individualModifications[date];
          if (modifications) {
            Object.assign(baseData, modifications);
          }

          // Handle document references
          if (documentRequiredTypes.includes(values.entryType)) {
            if (date === primaryDocumentDay) {
              baseData.supportingDocuments = fileList.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
              }));
              baseData.isPrimaryDocument = true;
            } else {
              baseData.documentReference = primaryDocumentDay;
              baseData.notes = `${baseData.notes ? baseData.notes + ' ' : ''}(References documents from ${dayjs(primaryDocumentDay).format('MMM DD')})`;
            }
          }

          return baseData;
        });

        onSave(bulkData);
        form.resetFields();
        setEntryType(null);
        setSelectedHoursId(null);
        setPrimaryDocumentDay(null);
        setFileList([]);
        setIndividualModifications({});
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
      title={`Bulk Edit - ${dates.length} Selected Days`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={700}
      okText="Apply to All Selected Days"
    >
      {/* Selected Days Overview */}
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

      <Form form={form} layout="vertical">
        <Form.Item
          label="Entry Type"
          name="entryType"
          rules={[{ required: true, message: 'Please select entry type' }]}
        >
          <Select
            placeholder="Select entry type for all days"
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

        {/* Primary Document Day Selection */}
        {documentRequiredTypes.includes(entryType) && (
          <>
            <Divider>Document Management</Divider>
            <Form.Item label="Primary Document Day">
              <Select
                value={primaryDocumentDay}
                onChange={setPrimaryDocumentDay}
                placeholder="Select which day will hold the supporting documents"
              >
                {dates.map(date => (
                  <Select.Option key={date} value={date}>
                    {dayjs(date).format('dddd, MMM DD, YYYY')}
                  </Select.Option>
                ))}
              </Select>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                Other days will automatically reference this day's documents
              </Text>
            </Form.Item>

            {primaryDocumentDay && (
              <Form.Item 
                label="Supporting Documents" 
                extra="Upload documents for the primary day. Other selected days will reference these documents."
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">
                    Documents will be linked to all selected days
                  </p>
                </Dragger>
              </Form.Item>
            )}
          </>
        )}

        <Form.Item label="Notes (Optional)" name="notes">
          <TextArea rows={3} placeholder="Add notes that will apply to all selected days..." />
        </Form.Item>

        {/* Individual Day Modifications */}
        <Divider>Individual Day Adjustments (Optional)</Divider>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <List
            size="small"
            dataSource={dates}
            renderItem={date => (
              <List.Item>
                <Row style={{ width: '100%' }} gutter={16} align="middle">
                  <Col span={8}>
                    <Text>{dayjs(date).format('ddd, MMM DD')}</Text>
                    {date === primaryDocumentDay && (
                      <Tag color="gold" size="small" style={{ marginLeft: 8 }}>Primary</Tag>
                    )}
                  </Col>
                  <Col span={16}>
                    <Input
                      placeholder="Custom notes for this day"
                      size="small"
                      value={individualModifications[date]?.notes || ''}
                      onChange={(e) => handleIndividualModification(date, 'notes', e.target.value)}
                    />
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
}

export default BulkSelectionModal;