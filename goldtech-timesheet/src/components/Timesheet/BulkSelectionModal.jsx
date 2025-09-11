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
  Typography,
  Alert
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import WorkingHoursSelector from './WorkingHoursSelector';
import OffInLieuSelector from './OffInLieuSelector';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Text } = Typography;

/**
 * BulkSelectionModal Component with cascading Others dropdown
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
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);
  const [primaryDocumentDay, setPrimaryDocumentDay] = useState(null);
  const [selectedHoursId, setSelectedHoursId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [individualModifications, setIndividualModifications] = useState({});

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

  const documentRequiredTypes = ['medical_leave'];

  // Helper function to check if entry type is in others category
  const isOthersEntryType = (type) => {
    return othersEntryTypeOptions.some(option => option.value === type);
  };

  // Reset form when modal opens/closes
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

    // Set first date as primary document day for document-required types
    const actualType = value === 'others' ? null : value;
    if (documentRequiredTypes.includes(actualType)) {
      setPrimaryDocumentDay(dates[0]);
    } else {
      setPrimaryDocumentDay(null);
    }

    // Clear individual modifications when changing entry type
    setIndividualModifications({});
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

    // Check if this others type requires documents
    if (documentRequiredTypes.includes(value)) {
      setPrimaryDocumentDay(dates[0]);
    } else {
      setPrimaryDocumentDay(null);
    }

    // Clear individual modifications when changing entry type
    setIndividualModifications({});
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
   * Handle individual date earned modification for Off in Lieu
   */
  const handleIndividualDateEarnedChange = (date, earnedDate) => {
    handleIndividualModification(date, 'dateEarned', earnedDate);
  };

  /**
   * Get count of days with date earned set
   */
  const getOffInLieuCompletionStats = () => {
    const daysWithEarnedDate = dates.filter(date => 
      individualModifications[date]?.dateEarned
    ).length;
    
    return {
      completed: daysWithEarnedDate,
      total: dates.length,
      remaining: dates.length - daysWithEarnedDate
    };
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

        // Validate Off in Lieu requirements - all days must have earned dates
        if (actualEntryType === 'off_in_lieu') {
          const stats = getOffInLieuCompletionStats();
          if (stats.remaining > 0) {
            message.warning(`Please set date earned for all ${stats.total} days. ${stats.remaining} day(s) still need earned dates.`);
            return;
          }
        }

        const bulkData = dates.map(date => {
          const baseData = {
            date,
            type: actualEntryType, // Use the actual entry type here
            notes: values.notes || '',
            ...(actualEntryType === 'working_hours' && {
              startTime: values.startTime.format('HH:mm'),
              endTime: values.endTime.format('HH:mm')
            }),
            ...(actualEntryType === 'off_in_lieu' && {
              dateEarned: individualModifications[date]?.dateEarned
            })
          };

          // Apply other individual modifications
          const modifications = individualModifications[date];
          if (modifications) {
            const { dateEarned, ...otherModifications } = modifications;
            Object.assign(baseData, otherModifications);
          }

          // Handle document references
          if (documentRequiredTypes.includes(actualEntryType)) {
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
        setShowOthersDropdown(false);
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

  const offInLieuStats = entryType === 'off_in_lieu' ? getOffInLieuCompletionStats() : null;

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

        {/* Individual Day Configuration */}
        <Divider>
          Individual Day Configuration
          {entryType === 'off_in_lieu' && (
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
              (Set date earned for each day)
            </Text>
          )}
        </Divider>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <List
            size="small"
            dataSource={dates}
            renderItem={date => {
              const hasEarnedDate = Boolean(individualModifications[date]?.dateEarned);
              
              return (
                <List.Item style={{ 
                  backgroundColor: entryType === 'off_in_lieu' && hasEarnedDate ? '#f6ffed' : 'transparent',
                  borderLeft: entryType === 'off_in_lieu' && hasEarnedDate ? '3px solid #52c41a' : 'none',
                  paddingLeft: entryType === 'off_in_lieu' && hasEarnedDate ? '12px' : '0'
                }}>
                  <div style={{ width: '100%' }}>
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Text strong>{dayjs(date).format('ddd, MMM DD')}</Text>
                        {date === primaryDocumentDay && (
                          <Tag color="gold" size="small" style={{ marginLeft: 8 }}>Primary</Tag>
                        )}
                        {entryType === 'off_in_lieu' && hasEarnedDate && (
                          <Tag color="green" size="small" style={{ marginLeft: 4 }}>✓</Tag>
                        )}
                      </Col>
                      <Col span={18}>
                        <Input
                          placeholder="Remarks for this day (optional)"
                          size="small"
                          value={individualModifications[date]?.notes || ''}
                          onChange={(e) => handleIndividualModification(date, 'notes', e.target.value)}
                        />
                      </Col>
                    </Row>

                    {/* Off in Lieu Date Earned - Required for each day */}
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
                              onChange={(earnedDate) => handleIndividualDateEarnedChange(date, earnedDate)}
                              form={form}
                            />
                          </div>
                        </Col>
                      </Row>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      </Form>
    </Modal>
  );
}

export default BulkSelectionModal;