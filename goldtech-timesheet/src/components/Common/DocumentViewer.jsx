// src/components/Common/DocumentViewer.jsx
import React from 'react';
import { Button, Space, Tooltip, Tag, Typography, message } from 'antd';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const DocumentViewer = ({ 
  documents, 
  documentReference, 
  onViewDocument,
  size = 'small' 
}) => {
  const handleViewDocument = async (document) => {
    try {
      console.log('Attempting to view document:', document);
      
      if (!document.id) {
        message.error('Invalid document ID');
        return;
      }

      // Call API to get document content
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/documents/${document.id}/download`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.content) {
        // Create a blob from base64 content
        const binaryString = atob(data.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType });
        
        // Create URL and open in new tab
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
      } else {
        throw new Error(data.message || 'Failed to load document content');
      }
      
    } catch (error) {
      console.error('Error viewing document:', error);
      message.error('Failed to view document: ' + error.message);
    }
  };

  const hasDocuments = documents && documents.length > 0;
  const hasReference = documentReference;
  
  if (hasDocuments) {
    return (
      <div>
        {documents.map((doc, index) => (
          <div key={index} style={{ marginBottom: 2 }}>
            <Space size="small">
              <Tooltip title="View Document">
                <Button 
                  type="link" 
                  size={size}
                  icon={<EyeOutlined />}
                  onClick={() => onViewDocument ? onViewDocument(doc) : handleViewDocument(doc)}
                />
              </Tooltip>
              <Text style={{ fontSize: size === 'small' ? '11px' : '13px' }}>
                {doc.name}
              </Text>
            </Space>
          </div>
        ))}
      </div>
    );
  } else if (hasReference) {
    return (
      <Tooltip title={`References documents from ${dayjs(hasReference).format('MMM DD')}`}>
        <Tag color="blue" size={size}>
          <FileTextOutlined /> Ref
        </Tag>
      </Tooltip>
    );
  }
  
  return <span style={{ color: '#999' }}>-</span>;
};

export default DocumentViewer;