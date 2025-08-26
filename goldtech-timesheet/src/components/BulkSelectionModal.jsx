import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  Input, 
  Button, 
  Upload, 
  Row, 
  Col,
  message,
  Divider,
  List,
  Tag,
  Typography
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import WorkingHoursSelector from './WorkingHoursSelector';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

/**
 * BulkSelectionModal Component using WorkingHoursSelector
 */
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
  const [entryType, setEntryType] = useState(null);
  const [primaryDocumentDay, setPrimaryDocumentDay] = useState(null);
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
    }
  }, [visible, dates, form]);

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
   * Handle working hours selection change
   */
  const handleHoursChange = (hoursId) => {
    setSelectedHoursId(hoursId);
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