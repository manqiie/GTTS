// SharedWorkingHoursSection.jsx - Reusable Working Hours Section
import React, { useEffect } from 'react';
import { Form } from 'antd';
import dayjs from 'dayjs';
import WorkingHoursSelector from '../WorkingHoursSelector';

function SharedWorkingHoursSection({
  customHoursList,
  selectedHoursId,
  setSelectedHoursId,
  onAddCustomHours,
  onRemoveCustomHours,
  form,
  defaultHours,
  disabled = false
}) {

  // Auto-select default hours when component mounts or defaultHours changes
  useEffect(() => {
    if (defaultHours && !selectedHoursId) {
      setSelectedHoursId(defaultHours.id);
      form.setFieldsValue({
        startTime: dayjs(defaultHours.startTime, 'HH:mm'),
        endTime: dayjs(defaultHours.endTime, 'HH:mm')
      });
    }
  }, [defaultHours, selectedHoursId, setSelectedHoursId, form]);

  // Handle hours selection change
  const handleHoursChange = (hoursId) => {
    setSelectedHoursId(hoursId);
    
    if (hoursId && hoursId !== 'add-custom') {
      // Find the selected hours preset
      const selectedPreset = customHoursList.find(preset => preset.id === hoursId) || defaultHours;
      
      if (selectedPreset) {
        form.setFieldsValue({
          startTime: dayjs(selectedPreset.startTime, 'HH:mm'),
          endTime: dayjs(selectedPreset.endTime, 'HH:mm')
        });
      }
    }
  };

  return (
    <>
      <Form.Item label="Working Hours Preset">
        <WorkingHoursSelector
          customHoursList={customHoursList}
          selectedHoursId={selectedHoursId}
          onHoursChange={handleHoursChange}
          onAddCustomHours={onAddCustomHours}
          onRemoveCustomHours={onRemoveCustomHours}
          form={form}
          disabled={disabled}
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
  );
}

export default SharedWorkingHoursSection;