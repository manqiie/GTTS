// src/components/TimesheetManagement/SupportingDocumentsViewer.jsx
import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Modal, 
  Image, 
  message,
  Tooltip,
  Divider
} from 'antd';
import { 
  FileTextOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

/**
 * Supporting Documents Viewer Component
 * Displays and manages supporting documents for leave entries
 */
function SupportingDocumentsViewer({ 
  entries, 
  employeeName,
  onDownloadDocument,
  onViewDocument 
}) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Extract entries that have supporting documents
  const entriesWithDocuments = Object.entries(entries || {})
    .filter(([date, entry]) => 
      entry.supportingDocuments && entry.supportingDocuments.length > 0
    )
    .map(([date, entry]) => ({ date, ...entry }))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  // Extract entries that reference documents from other days
  const entriesWithReferences = Object.entries(entries || {})
    .filter(([date, entry]) => entry.documentReference)
    .map(([date, entry]) => ({ date, ...entry }))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  if (entriesWithDocuments.length === 0) {
    return (
      <Card size="small">
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <FileTextOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
          <div>No supporting documents found for this timesheet</div>
        </div>
      </Card>
    );
  }

  /**
   * Get file icon based on file type
   */
  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (fileType?.includes('image')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
    if (fileType?.includes('word') || fileType?.includes('doc')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
    return <FileUnknownOutlined style={{ color: '#999' }} />;
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Get leave type display name
   */
  const getLeaveTypeDisplay = (type) => {
    const leaveTypes = {
      'medical_leave': { text: 'Medical Leave', color: 'red' },
      'annual_leave': { text: 'Annual Leave', color: 'blue' },
      'childcare_leave': { text: 'Childcare Leave', color: 'green' },
      'maternity_leave': { text: 'Maternity Leave', color: 'purple' },
      'paternity_leave': { text: 'Paternity Leave', color: 'orange' },
      'hospitalization_leave': { text: 'Hospitalization Leave', color: 'red' },
      'compassionate_leave': { text: 'Compassionate Leave', color: 'gray' }
    };
    return leaveTypes[type] || { text: type, color: 'default' };
  };

  /**
   * Handle document preview
   */
  const handlePreview = (document, entry) => {
    setPreviewDocument({ ...document, entry });
    setPreviewVisible(true);
    
    // Call parent handler if provided
    if (onViewDocument) {
      onViewDocument(document, entry);
    }
  };

  /**
   * Handle document download
   */
  const handleDownload = (document, entry) => {
    message.loading('Downloading document...');
    
    // Call parent handler if provided
    if (onDownloadDocument) {
      onDownloadDocument(document, entry);
    } else {
      // Simulate download
      setTimeout(() => {
        message.success(`Downloaded: ${document.name}`);
      }, 1000);
    }
  };

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <FileTextOutlined /> Supporting Documents
        </Title>

        {/* Primary Documents */}
        <List
          itemLayout="vertical"
          dataSource={entriesWithDocuments}
          renderItem={(entry) => {
            const leaveType = getLeaveTypeDisplay(entry.type);
            
            return (
              <List.Item key={entry.date}>
                <div style={{ width: '100%' }}>
                  {/* Entry Header */}
                  <div style={{ marginBottom: 12 }}>
                    <Space>
                      <Text strong>{dayjs(entry.date).format('dddd, MMMM DD, YYYY')}</Text>
                      <Tag color={leaveType.color}>{leaveType.text}</Tag>
                      {entry.isPrimaryDocument && (
                        <Tag color="gold">Primary Document</Tag>
                      )}
                    </Space>
                    {entry.notes && (
                      <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                        Notes: {entry.notes}
                      </div>
                    )}
                  </div>

                  {/* Documents List */}
                  <div style={{ marginLeft: 16 }}>
                    {entry.supportingDocuments.map((doc, index) => (
                      <Card 
                        key={index} 
                        size="small" 
                        style={{ marginBottom: 8 }}
                        bodyStyle={{ padding: '12px 16px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <Space>
                              {getFileIcon(doc.type)}
                              <div>
                                <div style={{ fontWeight: 500 }}>{doc.name}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  {formatFileSize(doc.size)} • {doc.type}
                                </div>
                              </div>
                            </Space>
                          </div>
                          
                          <Space>
                            <Tooltip title="Preview Document">
                              <Button 
                                type="text" 
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => handlePreview(doc, entry)}
                              />
                            </Tooltip>
                            <Tooltip title="Download Document">
                              <Button 
                                type="text" 
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownload(doc, entry)}
                              />
                            </Tooltip>
                          </Space>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />

        {/* Referenced Documents */}
        {entriesWithReferences.length > 0 && (
          <>
            <Divider />
            <Title level={5} style={{ marginBottom: 16 }}>
              Document References
            </Title>
            <div style={{ marginLeft: 16 }}>
              {entriesWithReferences.map((entry) => {
                const leaveType = getLeaveTypeDisplay(entry.type);
                return (
                  <div key={entry.date} style={{ marginBottom: 8, padding: '8px 12px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                    <Space>
                      <Text>{dayjs(entry.date).format('MMM DD, YYYY')}</Text>
                      <Tag color={leaveType.color} size="small">{leaveType.text}</Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        → References documents from {dayjs(entry.documentReference).format('MMM DD, YYYY')}
                      </Text>
                    </Space>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Document Preview Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Document Preview
          </Space>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              handleDownload(previewDocument, previewDocument?.entry);
              setPreviewVisible(false);
            }}
          >
            Download
          </Button>
        ]}
      >
        {previewDocument && (
          <div>
            {/* Document Info */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Document: </Text>
                  <Text>{previewDocument.name}</Text>
                </div>
                <div>
                  <Text strong>Leave Date: </Text>
                  <Text>{dayjs(previewDocument.entry.date).format('MMMM DD, YYYY')}</Text>
                </div>
                <div>
                  <Text strong>Leave Type: </Text>
                  <Tag color={getLeaveTypeDisplay(previewDocument.entry.type).color}>
                    {getLeaveTypeDisplay(previewDocument.entry.type).text}
                  </Tag>
                </div>
                <div>
                  <Text strong>File Size: </Text>
                  <Text>{formatFileSize(previewDocument.size)}</Text>
                </div>
              </Space>
            </Card>

            {/* Document Preview */}
            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '6px', 
              padding: '20px', 
              textAlign: 'center',
              backgroundColor: '#fafafa'
            }}>
              {previewDocument.type?.includes('image') ? (
                <Image
                  width="100%"
                  src={`/api/documents/${previewDocument.entry.date}/${previewDocument.name}`}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxYBRuLs+EGPBBPwC24Qm6QG2APBiJOBNoBahsMdoTbLTgSCQIaxX"
                  style={{ maxHeight: '400px' }}
                />
              ) : (
                <div>
                  {getFileIcon(previewDocument.type)}
                  <div style={{ marginTop: 16, fontSize: '16px', color: '#666' }}>
                    {previewDocument.type?.includes('pdf') ? (
                      <div>
                        <Text>PDF Preview</Text>
                        <div style={{ marginTop: 8 }}>
                          <Button 
                            type="primary"
                            href={`/api/documents/${previewDocument.entry.date}/${previewDocument.name}`}
                            target="_blank"
                          >
                            Open PDF in New Tab
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Text>Preview not available for this file type</Text>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SupportingDocumentsViewer;