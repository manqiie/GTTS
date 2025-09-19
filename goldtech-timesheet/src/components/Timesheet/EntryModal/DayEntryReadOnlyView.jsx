// DayEntryReadOnlyView.jsx - Read-Only Display Component
import React from 'react';
import { Card, Row, Col, Tag, Space, Button, Alert, Typography } from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { entryTypeConfig } from './entryTypeConfig';

const { Text, Title } = Typography;

function DayEntryReadOnlyView({ date, existingEntry }) {
  // Show empty state if no entry
  if (!existingEntry) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <CalendarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
        <Title level={4} style={{ color: '#999' }}>No Entry Found</Title>
        <Text type="secondary">
          No timesheet entry exists for {dayjs(date).format('dddd, MMMM DD, YYYY')}
        </Text>
      </div>
    );
  }

  const entryTypeDisplay = entryTypeConfig.getEntryTypeDisplayName(existingEntry.type);
  const entryTypeColor = entryTypeConfig.getEntryTypeColor(existingEntry.type);
  const isWorkingHours = existingEntry.type === 'working_hours';
  const hasDocuments = existingEntry.supportingDocuments && existingEntry.supportingDocuments.length > 0;

  return (
    <div>
      {/* Entry Header */}
      <EntryHeader 
        entryTypeDisplay={entryTypeDisplay}
        entryTypeColor={entryTypeColor}
        existingEntry={existingEntry}
        date={date}
      />

      {/* Working Hours Details */}
      {isWorkingHours && existingEntry.startTime && existingEntry.endTime && (
        <WorkingHoursCard existingEntry={existingEntry} />
      )}

      {/* Off in Lieu Details */}
      {existingEntry.type === 'off_in_lieu' && existingEntry.dateEarned && (
        <OffInLieuCard existingEntry={existingEntry} />
      )}

      {/* Supporting Documents */}
      {hasDocuments && (
        <DocumentsCard documents={existingEntry.supportingDocuments} />
      )}

      {/* Document Reference */}
      {existingEntry.documentReference && (
        <DocumentReferenceAlert documentReference={existingEntry.documentReference} />
      )}

      {/* Notes */}
      {existingEntry.notes && (
        <NotesCard notes={existingEntry.notes} />
      )}

      {/* Entry Metadata */}
      <MetadataCard existingEntry={existingEntry} />
    </div>
  );
}

// Entry Header Component
const EntryHeader = ({ entryTypeDisplay, entryTypeColor, existingEntry, date }) => (
  <Card style={{ marginBottom: 20 }}>
    <Row justify="space-between" align="middle">
      <Col>
        <div>
          <Text type="secondary">Entry Type</Text>
          <div style={{ marginTop: 4 }}>
            <Tag color={entryTypeColor} style={{ fontSize: '14px', padding: '4px 12px' }}>
              {entryTypeDisplay}
            </Tag>
            {entryTypeConfig.isHalfDayType(existingEntry.type) && existingEntry.halfDayPeriod && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                {existingEntry.halfDayPeriod}
              </Tag>
            )}
          </div>
        </div>
      </Col>
      <Col>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {dayjs(date).format('dddd, MMMM DD, YYYY')}
        </Text>
      </Col>
    </Row>
  </Card>
);

// Working Hours Card Component
const WorkingHoursCard = ({ existingEntry }) => {
  // Calculate duration
  const start = dayjs(`2000-01-01 ${existingEntry.startTime}`);
  const end = dayjs(`2000-01-01 ${existingEntry.endTime}`);
  const hours = end.diff(start, 'hour');
  const minutes = end.diff(start, 'minute') % 60;
  const durationText = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;

  return (
    <Card title="Working Hours" style={{ marginBottom: 20 }}>
      <Row gutter={24}>
        <Col span={8}>
          <div>
            <Text type="secondary">Start Time</Text>
            <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
              {dayjs(existingEntry.startTime, 'HH:mm').format('h:mm A')}
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div>
            <Text type="secondary">End Time</Text>
            <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
              {dayjs(existingEntry.endTime, 'HH:mm').format('h:mm A')}
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div>
            <Text type="secondary">Duration</Text>
            <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
              {durationText}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

// Off in Lieu Card Component
const OffInLieuCard = ({ existingEntry }) => (
  <Card title="Off in Lieu Details" style={{ marginBottom: 20 }}>
    <div>
      <Text type="secondary">Date Earned</Text>
      <div style={{ fontSize: '16px', fontWeight: 500, marginTop: 4 }}>
        {dayjs(existingEntry.dateEarned).format('dddd, MMMM DD, YYYY')}
      </div>
    </div>
  </Card>
);

// Documents Card Component
const DocumentsCard = ({ documents }) => (
  <Card title="Supporting Documents" style={{ marginBottom: 20 }}>
    <div>
      {documents.map((doc, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px',
          border: '1px solid #f0f0f0',
          borderRadius: '6px',
          marginBottom: index < documents.length - 1 ? 8 : 0
        }}>
          <Space>
            <FileTextOutlined />
            <div>
              <div style={{ fontWeight: 500 }}>{doc.name}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {doc.type} • {(doc.size / 1024).toFixed(1)} KB
              </Text>
            </div>
          </Space>
          <Button size="small" type="link">
            Download
          </Button>
        </div>
      ))}
    </div>
  </Card>
);

// Document Reference Alert Component
const DocumentReferenceAlert = ({ documentReference }) => (
  <Alert
    message="Document Reference"
    description={`This entry references supporting documents from ${dayjs(documentReference).format('MMMM DD, YYYY')}`}
    type="info"
    style={{ marginBottom: 20 }}
  />
);

// Notes Card Component
const NotesCard = ({ notes }) => (
  <Card title="Notes" style={{ marginBottom: 20 }}>
    <Text style={{ whiteSpace: 'pre-wrap' }}>
      {notes}
    </Text>
  </Card>
);

// Metadata Card Component
const MetadataCard = ({ existingEntry }) => (
  <Card>
    <Row gutter={24}>
      <Col span={12}>
        <div>
          <Text type="secondary">Created</Text>
          <div style={{ fontSize: '14px', marginTop: 4 }}>
            {existingEntry.createdAt ? dayjs(existingEntry.createdAt).format('MMM DD, YYYY h:mm A') : 'N/A'}
          </div>
        </div>
      </Col>
      <Col span={12}>
        <div>
          <Text type="secondary">Last Updated</Text>
          <div style={{ fontSize: '14px', marginTop: 4 }}>
            {existingEntry.updatedAt ? dayjs(existingEntry.updatedAt).format('MMM DD, YYYY h:mm A') : 'N/A'}
          </div>
        </div>
      </Col>
    </Row>
  </Card>
);

export default DayEntryReadOnlyView;