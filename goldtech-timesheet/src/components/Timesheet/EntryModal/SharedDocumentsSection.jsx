// SharedDocumentsSection.jsx - Reusable Documents Section
import React from 'react';
import { Form } from 'antd';
import SupportingDocuments from '../SupportingDocuments';
import { entryTypeConfig } from './entryTypeConfig';

function SharedDocumentsSection({
  entryType,
  fileList,
  setFileList,
  helpText,
  isBulkMode = false,
  disabled = false
}) {

  // Handle documents change
  const handleDocumentsChange = (newFileList) => {
    setFileList(newFileList);
  };

  // Generate help text based on entry type and mode
  const getHelpText = () => {
    if (helpText) return helpText;
    
    const entryTypeName = entryTypeConfig.getEntryTypeDisplayName(entryType);
    const baseText = `Upload supporting documents for ${entryTypeName.toLowerCase()} (PDF, JPG, PNG, DOC - Max 5MB each)`;
    
    if (isBulkMode) {
      return `${baseText} - Documents will be applied to all selected days`;
    }
    
    return baseText;
  };

  // Generate upload text based on mode
  const getUploadText = () => {
    if (isBulkMode) {
      return "Click or drag files to upload for all selected days";
    }
    return "Click or drag file to this area to upload";
  };

  // Generate hint text based on mode
  const getHintText = () => {
    const baseHint = "Support for single or bulk upload. Maximum file size: 5MB per file";
    
    if (isBulkMode) {
      return `${baseHint}. These documents will be linked to all selected days.`;
    }
    
    return baseHint;
  };

  return (
    <Form.Item 
      label="Supporting Documents"
      name="supportingDocuments"   // <-- Required for validation to work
      rules={[{ required: true, message: 'Please upload supporting documents' }]}
      extra={isBulkMode ? "All selected days will reference these documents." : undefined}
    >
      <SupportingDocuments
        fileList={fileList}
        onChange={handleDocumentsChange}
        required={true}
        helpText={getHelpText()}
        uploadText={getUploadText()}
        hintText={getHintText()}
        disabled={disabled}
      />
    </Form.Item>
  );
}

export default SharedDocumentsSection;