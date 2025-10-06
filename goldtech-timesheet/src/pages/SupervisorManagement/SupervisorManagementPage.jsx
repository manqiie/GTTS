// SupervisorManagementPage.jsx - Supervisor Management Page
import React, { useState, useEffect } from 'react';
import { Card, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';
import SupervisorTable from '../../components/Supervisor/SupervisorTable';
import SupervisorViewModal from '../../components/Supervisor/SupervisorViewModal';
import SupervisorFilterPanel from '../../components/Supervisor/SupervisorFilterPanel';
import { useSupervisorStore } from '../../hooks/useSupervisorStore';

function SupervisorManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const {
    supervisors,
    loading,
    toggleSupervisorStatus,
    searchSupervisors
  } = useSupervisorStore();

  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    department: 'all',
    location: 'all'
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    const results = searchSupervisors(searchTerm, filters);
    setFilteredSupervisors(results);
  }, [supervisors, searchTerm, filters]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      client: 'all',
      department: 'all',
      location: 'all'
    });
  };

  const handleView = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setViewModalVisible(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const updatedSupervisor = await toggleSupervisorStatus(id);
      if (updatedSupervisor) {
        messageApi.success(
          `Supervisor ${updatedSupervisor.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`
        );
      }
    } catch (error) {
      messageApi.error('Failed to update supervisor status');
    }
  };

  const handleCreateNew = () => {
    navigate('/supervisor-management/create');
  };

  const breadcrumbs = [
    { title: 'Management' },
    { title: 'Supervisor Management' }
  ];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Supervisor Management"
        breadcrumbs={breadcrumbs}
        description="Manage supervisors and their work assignments"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Add New Supervisor
          </Button>
        }
      />

      <SupervisorFilterPanel
        searchTerm={searchTerm}
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <Card>
        <SupervisorTable
          supervisors={filteredSupervisors}
          loading={loading}
          onView={handleView}
          onToggleStatus={handleToggleStatus}
        />
      </Card>

      <SupervisorViewModal
        visible={viewModalVisible}
        supervisor={selectedSupervisor}
        onClose={() => {
          setViewModalVisible(false);
          setSelectedSupervisor(null);
        }}
      />
    </div>
  );
}

export default SupervisorManagementPage;