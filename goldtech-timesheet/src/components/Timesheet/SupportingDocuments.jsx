import React from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

/**
 * SupportingDocuments Component
 * 
 * Reusable component for handling document uploads across different leave types.
 * Features:
 * - Drag and drop file upload
 * - File type validation (PDF, JPG, PNG, DOC)
 * - File size validation (max 5MB)
 * - Multiple file support
 * - Custom styling and messaging
 */
function SupportingDocuments({ 
  fileList = [], 
  onChange, 
  disabled = false,
  required = false,
  helpText = "Upload supporting documents (PDF, JPG, PNG, DOC - Max 5MB each)",
  uploadText = "Click or drag file to this area to upload",
  hintText = "Support for single or bulk upload. Maximum file size: 5MB per file"
}) {

  /**
   * Handle file upload change
   */
  const handleFileChange = ({ fileList: newFileList }) => {
    if (onChange) {
      onChange(newFileList);
    }
  };

  /**
   * File validation before upload
   */
  const beforeUpload = (file) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const isValidType = allowedTypes.includes(file.type);
    if (!isValidType) {
      message.error(`${file.name} is not a supported file type. Please upload PDF, JPG, PNG, or DOC files only.`);
      return false;
    }

    // Validate file size (5MB limit)
    const isValidSize = file.size / 1024 / 1024 < 5;
    if (!isValidSize) {
      message.error(`${file.name} is too large. File must be smaller than 5MB.`);
      return false;
    }

    // Prevent auto upload - we handle files in memory
    return false;
  };

  /**
   * Handle file removal
   */
  const handleRemove = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    if (onChange) {
      onChange(newFileList);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList: fileList,
    beforeUpload: beforeUpload,
    onChange: handleFileChange,
    onRemove: handleRemove,
    disabled: disabled,
    accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx'
  };

  return (
    <div className="supporting-documents-component">
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{uploadText}</p>
        <p className="ant-upload-hint">{hintText}</p>
      </Dragger>
      
      {helpText && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginTop: '8px',
          fontStyle: 'italic' 
        }}>
          {helpText}
        </div>
      )}
      
      
    </div>
  );
}

export default SupportingDocuments;