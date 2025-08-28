import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Input, Select } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  UserDeleteOutlined, 
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined  // NEW: Added for the "Add Employee" button
} from '@ant-design/icons';
import EmployeeManagementHeader from '../components/Employee Management/EmployeeManagementHeader';
import EmployeeDetailModal from '../components/Employee Management/EmployeeDetailModal';
import { mockEmployeeData } from '../data/mockEmployeeData';

const { Search } = Input;
const { Option } = Select;

/**
 * EmployeeManagementPage - Main container for employee Employee management
 * 
 * Features:
 * - Employee list table with filtering and search
 * - View employee details modal
 * - Edit employee details modal
 * - Add new employee modal (NEW)
 * - Toggle employee active/inactive status
 * - Responsive design with proper UX flow
 */
function EmployeeManagementPage() {
  // State management
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // UPDATED: Now supports 'view', 'edit', or 'add'
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  // Load mock data on component mount
  useEffect(() => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setEmployees(mockEmployeeData);
      setFilteredEmployees(mockEmployeeData);
      setLoading(false);
    }, 500);
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = employees;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    // Position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter(emp => emp.position === positionFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(emp => emp.projectSide === projectFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchText, statusFilter, positionFilter, projectFilter]);

  /**
   * Handle view employee details
   */
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('view');
    setModalVisible(true);
  };

  /**
   * Handle edit employee details
   */
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setModalVisible(true);
  };

  /**
   * NEW: Handle add new employee
   */
  const handleAddEmployee = () => {
    setSelectedEmployee(null); // Clear selected employee for new entry
    setModalMode('add');
    setModalVisible(true);
    onNavigate('add-employee');
  };

  /**
   * Handle toggle employee status (active/inactive)
   */
  const handleToggleStatus = (employeeId) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => {
        if (emp.id === employeeId) {
          const newStatus = emp.status === 'active' ? 'inactive' : 'active';
          message.success(`Employee ${emp.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
          return { ...emp, status: newStatus };
        }
        return emp;
      })
    );
  };

  /**
   * UPDATED: Handle employee update/create from modal
   * Now handles both creating new employees and updating existing ones
   */
  const handleUpdateEmployee = (employeeData) => {
    if (modalMode === 'add') {
      // Generate new ID for new employee
      const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
      const newEmployee = {
        ...employeeData,
        id: newId,
      };
      
      setEmployees(prevEmployees => [...prevEmployees, newEmployee]);
      message.success('New employee added successfully');
    } else {
      // Existing update logic
      setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.id === employeeData.id ? employeeData : emp
        )
      );
      message.success('Employee details updated successfully');
    }
    setModalVisible(false);
  };

  /**
   * Get unique values for filter options
   */
  const getUniquePositions = () => {
    return [...new Set(employees.map(emp => emp.position))];
  };

  const getUniqueProjects = () => {
    return [...new Set(employees.map(emp => emp.projectSide))];
  };

  /**
   * Table columns configuration
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      sorter: (a, b) => a.position.localeCompare(b.position),
    },
    {
      title: 'Project Side',
      dataIndex: 'projectSide',
      key: 'projectSide',
      sorter: (a, b) => a.projectSide.localeCompare(b.projectSide),
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Assigned Manager',
      dataIndex: 'managerName',
      key: 'managerName',
      sorter: (a, b) => a.managerName.localeCompare(b.managerName),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewEmployee(record)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditEmployee(record)}
            title="Edit Details"
          />
          <Button
            type="text"
            icon={<UserDeleteOutlined />}
            onClick={() => handleToggleStatus(record.id)}
            title={record.status === 'active' ? 'Deactivate' : 'Activate'}
            style={{ 
              color: record.status === 'active' ? '#ff4d4f' : '#52c41a' 
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <EmployeeManagementHeader />

      {/* Main Content Card */}
      <Card>
        {/* NEW: Header with Add Employee Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16 
        }}>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>
            Employee Management ({filteredEmployees.length} employees)
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddEmployee}
            size="middle"
          >
            New Employee
          </Button>
        </div>

        {/* Filters and Search */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap size="middle">
            <Search
              placeholder="Search by name, ID, or email"
              allowClear
              style={{ width: 300 }}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>

            <Select
              placeholder="Filter by position"
              style={{ width: 180 }}
              value={positionFilter}
              onChange={setPositionFilter}
            >
              <Option value="all">All Positions</Option>
              {getUniquePositions().map(position => (
                <Option key={position} value={position}>{position}</Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by project"
              style={{ width: 150 }}
              value={projectFilter}
              onChange={setProjectFilter}
            >
              <Option value="all">All Projects</Option>
              {getUniqueProjects().map(project => (
                <Option key={project} value={project}>{project}</Option>
              ))}
            </Select>
          </Space>
        </div>

        {/* Employee Table */}
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} employees`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        visible={modalVisible}
        employee={selectedEmployee}
        mode={modalMode}
        onCancel={() => setModalVisible(false)}
        onUpdate={handleUpdateEmployee}
      />
    </div>
  );
}

export default EmployeeManagementPage;