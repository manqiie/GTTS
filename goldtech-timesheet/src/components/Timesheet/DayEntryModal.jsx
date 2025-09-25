// Updated DayEntryModal.jsx - Fixed delete handling
import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DayEntryReadOnlyView from './EntryModal/DayEntryReadOnlyView';
import DayEntryEditForm from './EntryModal/DayEntryEditForm';
import { entryTypeConfig } from './EntryModal/entryTypeConfig';

function DayEntryModal({ 
  visible, 
  date, 
  existingEntry, 
  customHoursList, 
  defaultHours,
  onSave, 
  onCancel,
  onAddCustomHours,
  onRemoveCustomHours,
  readOnly = false
}) {
  const [entryType, setEntryType] = useState(null);
  const [selectedHoursId, setSelectedHoursId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [dateEarned, setDateEarned] = useState(null);
  const [showOthersDropdown, setShowOthersDropdown] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible && date) {
      if (existingEntry) {
        const isOthersType = entryTypeConfig.isOthersEntryType(existingEntry.type);
        setEntryType(existingEntry.type);
        setShowOthersDropdown(isOthersType);
        setDateEarned(existingEntry.dateEarned || null);
        
        // Load existing documents
        if (existingEntry.supportingDocuments) {
          const existingFiles = existingEntry.supportingDocuments.map((doc, index) => ({
            uid: `existing-${index}`,
            name: doc.name,
            status: 'done',
            size: doc.size,
            type: doc.type
          }));
          setFileList(existingFiles);
        }
      } else {
        // Reset for new entry
        setEntryType(null);
        setSelectedHoursId(null);
        setDateEarned(null);
        setShowOthersDropdown(false);
        setFileList([]);
      }
    }
  }, [visible, date, existingEntry]);

  // Handle form submission - Updated for draft mode
  const handleSubmit = (formData) => {
    if (readOnly) {
      onCancel();
      return;
    }

    // Validation
    if (!formData.entryType && !formData.othersEntryType) {
      message.warning('Please select a valid entry type');
      return;
    }

    const actualEntryType = showOthersDropdown ? formData.othersEntryType : formData.entryType;

    // Validate half day period
    if (entryTypeConfig.isHalfDayType(actualEntryType) && !formData.halfDayPeriod) {
      message.warning('Please select AM or PM for half day leave');
      return;
    }

    // Validate document requirement
    if (entryTypeConfig.requiresDocuments(actualEntryType) && fileList.length === 0) {
      message.warning('Supporting documents are required for this leave type');
      return;
    }

    // Validate Off in Lieu date earned
    if (actualEntryType === 'off_in_lieu' && !dateEarned) {
      message.warning('Date earned is required for Off in Lieu entries');
      return;
    }

    // Prepare final entry data
    const entryData = {
      date: formData.date.format('YYYY-MM-DD'),
      type: actualEntryType,
      notes: formData.notes || '',
      ...(actualEntryType === 'working_hours' && {
        startTime: formData.startTime.format('HH:mm'),
        endTime: formData.endTime.format('HH:mm')
      }),
      ...(actualEntryType === 'off_in_lieu' && {
        dateEarned: dateEarned
      }),
      ...(entryTypeConfig.isHalfDayType(actualEntryType) && {
        halfDayPeriod: formData.halfDayPeriod
      }),
      ...(fileList.length > 0 && {
        supportingDocuments: fileList.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          base64Data: file.base64Data
        }))
      })
    };

    // Call onSave - this will now save to draft instead of API
    onSave(entryData);
    resetState();
  };

  // Handle delete - FIXED for draft mode
  const handleDelete = () => {
    if (!readOnly && existingEntry && onSave) {
      // For draft mode, call onSave with deletion marker
      // The parent component will handle this by calling deleteEntry
      onSave({ 
        date: date, 
        type: 'DELETE',
        isDelete: true // Add a flag to distinguish deletion
      });
      resetState();
    }
  };

  const resetState = () => {
    setEntryType(null);
    setSelectedHoursId(null);
    setDateEarned(null);
    setFileList([]);
    setShowOthersDropdown(false);
  };

  // Modal configuration
  const modalTitle = readOnly 
    ? `View Entry - ${dayjs(date).format('MMM DD, YYYY')}`
    : existingEntry 
      ? 'Edit Day Entry'
      : 'Add Day Entry';

  const modalWidth = readOnly ? 800 : 700;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {readOnly ? <EyeOutlined style={{ marginRight: 8 }} /> : <EditOutlined style={{ marginRight: 8 }} />}
          {modalTitle}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={modalWidth}
      footer={null}
    >
      {readOnly ? (
        <DayEntryReadOnlyView
          date={date}
          existingEntry={existingEntry}
        />
      ) : (
        <DayEntryEditForm
          date={date}
          existingEntry={existingEntry}
          customHoursList={customHoursList}
          defaultHours={defaultHours}
          entryType={entryType}
          setEntryType={setEntryType}
          selectedHoursId={selectedHoursId}
          setSelectedHoursId={setSelectedHoursId}
          fileList={fileList}
          setFileList={setFileList}
          dateEarned={dateEarned}
          setDateEarned={setDateEarned}
          showOthersDropdown={showOthersDropdown}
          setShowOthersDropdown={setShowOthersDropdown}
          onAddCustomHours={onAddCustomHours}
          onRemoveCustomHours={onRemoveCustomHours}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          onDelete={existingEntry ? handleDelete : null} // Allow deletion for existing entries
        />
      )}
    </Modal>
  );
}

export default DayEntryModal;