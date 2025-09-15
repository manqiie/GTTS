// useEmployeeStore.js - Complete User Store for User Management
import { useState, useEffect } from 'react';

export function useEmployeeStore() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load employees from localStorage on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Add a small delay to simulate real loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stored = localStorage.getItem('users');
      if (stored) {
        const data = JSON.parse(stored);
        console.log('Loaded users from localStorage:', data);
        setEmployees(data);
      } else {
        console.log('No stored data, creating sample users');
        const sampleData = generateSampleUsers();
        setEmployees(sampleData);
        localStorage.setItem('users', JSON.stringify(sampleData));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (updatedEmployees) => {
    try {
      localStorage.setItem('users', JSON.stringify(updatedEmployees));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const createEmployee = (employeeData) => {
    const newEmployee = {
      ...employeeData,
      id: generateId(),
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
      // Convert role IDs to role objects for display
      roles: employeeData.roles.map(roleId => {
        const roleMap = {
          1: { id: 1, name: 'admin', description: 'Administrator' },
          2: { id: 2, name: 'manager', description: 'Manager' },
          3: { id: 3, name: 'employee', description: 'Employee' }
        };
        return roleMap[roleId];
      }).filter(Boolean)
    };

    // Get manager name if manager_id is provided
    if (newEmployee.manager_id) {
      const manager = employees.find(emp => emp.id === newEmployee.manager_id);
      newEmployee.manager_name = manager ? manager.full_name : null;
    }

    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    saveToStorage(updatedEmployees);
    return newEmployee;
  };

  const updateEmployee = (id, updates) => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === id) {
        const updatedEmp = { ...emp, ...updates, updated_at: new Date().toISOString() };
        
        // Convert role IDs to role objects if roles are being updated
        if (updates.roles && Array.isArray(updates.roles) && typeof updates.roles[0] === 'number') {
          const roleMap = {
            1: { id: 1, name: 'admin', description: 'Administrator' },
            2: { id: 2, name: 'manager', description: 'Manager' },
            3: { id: 3, name: 'employee', description: 'Employee' }
          };
          updatedEmp.roles = updates.roles.map(roleId => roleMap[roleId]).filter(Boolean);
        }

        // Update manager name if manager_id is being updated
        if (updates.manager_id) {
          const manager = employees.find(emp => emp.id === updates.manager_id);
          updatedEmp.manager_name = manager ? manager.full_name : null;
        } else if (updates.manager_id === null) {
          updatedEmp.manager_name = null;
        }

        return updatedEmp;
      }
      return emp;
    });
    
    setEmployees(updatedEmployees);
    saveToStorage(updatedEmployees);
    return updatedEmployees.find(emp => emp.id === id);
  };

  const deleteEmployee = (id) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    saveToStorage(updatedEmployees);
    return true;
  };

  const toggleEmployeeStatus = (id) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return updateEmployee(id, { status: newStatus });
    }
  };

  const getEmployee = (id) => {
    console.log('Looking for user with ID:', id);
    console.log('Available users:', employees.map(e => e.id));
    const found = employees.find(emp => emp.id === id);
    console.log('Found user:', found);
    return found;
  };

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.status === 'ACTIVE');
  };

  const getEmployeesByRole = (roleName) => {
    return employees.filter(emp => 
      emp.roles && emp.roles.some(role => role.name === roleName)
    );
  };

  const getManagers = () => {
    return employees.filter(emp => 
      emp.roles && emp.roles.some(role => role.name === 'manager' || role.name === 'admin') &&
      emp.status === 'ACTIVE'
    );
  };

  const searchEmployees = (searchTerm, filters = {}) => {
    let filteredEmployees = [...employees];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.full_name.toLowerCase().includes(term) ||
        (emp.employee_id && emp.employee_id.toLowerCase().includes(term)) ||
        emp.email.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term) ||
        (emp.project_site && emp.project_site.toLowerCase().includes(term)) ||
        (emp.manager_name && emp.manager_name.toLowerCase().includes(term)) ||
        (emp.department && emp.department.toLowerCase().includes(term)) ||
        (emp.company && emp.company.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === filters.status);
    }

    // Role filter
    if (filters.role && filters.role !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.roles && emp.roles.some(role => role.name === filters.role)
      );
    }

    // Dropdown-based filters - exact match filtering
    if (filters.position && filters.position !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.position === filters.position);
    }

    if (filters.department && filters.department !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === filters.department);
    }

    if (filters.projectSite && filters.projectSite !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.project_site === filters.projectSite);
    }

    if (filters.company && filters.company !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.company === filters.company);
    }

    return filteredEmployees;
  };

  const getEmployeeStats = () => {
    const total = employees.length;
    const active = employees.filter(emp => emp.status === 'ACTIVE').length;
    const inactive = employees.filter(emp => emp.status === 'INACTIVE').length;
    
    const roleStats = {
      admin: employees.filter(emp => emp.roles?.some(role => role.name === 'admin')).length,
      manager: employees.filter(emp => emp.roles?.some(role => role.name === 'manager')).length,
      employee: employees.filter(emp => emp.roles?.some(role => role.name === 'employee')).length
    };

    const departmentStats = {};
    employees.forEach(emp => {
      if (emp.department) {
        departmentStats[emp.department] = (departmentStats[emp.department] || 0) + 1;
      }
    });

    return {
      total,
      active,
      inactive,
      roleStats,
      departmentStats
    };
  };

  const bulkUpdateEmployees = (employeeIds, updates) => {
    const updatedEmployees = employees.map(emp => {
      if (employeeIds.includes(emp.id)) {
        return { ...emp, ...updates, updated_at: new Date().toISOString() };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    saveToStorage(updatedEmployees);
    return updatedEmployees.filter(emp => employeeIds.includes(emp.id));
  };

  const validateEmployee = (employeeData) => {
    const errors = [];

    // Required field validation
    if (!employeeData.full_name?.trim()) {
      errors.push('Full name is required');
    }

    if (!employeeData.email?.trim()) {
      errors.push('Email is required');
    }

    if (!employeeData.position?.trim()) {
      errors.push('Position is required');
    }

    if (!employeeData.department?.trim()) {
      errors.push('Department is required');
    }

    if (!employeeData.roles || employeeData.roles.length === 0) {
      errors.push('At least one role must be selected');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (employeeData.email && !emailRegex.test(employeeData.email)) {
      errors.push('Invalid email format');
    }

    // Phone format validation (Singapore format)
    const phoneRegex = /^\+65\s\d{4}\s\d{4}$/;
    if (employeeData.phone && !phoneRegex.test(employeeData.phone)) {
      errors.push('Phone must be in Singapore format: +65 1234 5678');
    }

    // Check for duplicate email
    const existingEmployee = employees.find(emp => 
      emp.email === employeeData.email && emp.id !== employeeData.id
    );
    if (existingEmployee) {
      errors.push('Email already exists');
    }

    // Check for duplicate employee_id if provided
    if (employeeData.employee_id) {
      const existingEmployeeId = employees.find(emp => 
        emp.employee_id === employeeData.employee_id && emp.id !== employeeData.id
      );
      if (existingEmployeeId) {
        errors.push('Employee ID already exists');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    employees,
    loading,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    getEmployee,
    getActiveEmployees,
    getEmployeesByRole,
    getManagers,
    searchEmployees,
    getEmployeeStats,
    bulkUpdateEmployees,
    validateEmployee,
    loadEmployees
  };
}

// Utility functions
const generateId = () => {
  return 'USR' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
};

const generateSampleUsers = () => {
  return [
    {
      id: 'USR001',
      employee_id: 'GT001',
      email: 'john.smith@goldtech.com',
      full_name: 'John Smith',
      phone: '+65 9123 4567',
      position: 'Senior Developer',
      department: 'Development',
      project_site: 'Marina Bay Project',
      company: null,
      join_date: '2023-01-15',
      manager_id: 'USR002',
      manager_name: 'Alice Johnson',
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2023-01-15T08:00:00Z',
      updated_at: '2024-01-15T08:00:00Z',
      last_login_at: '2024-01-20T09:30:00Z'
    },
    {
      id: 'USR002',
      employee_id: 'MGR001',
      email: 'alice.johnson@goldtech.com',
      full_name: 'Alice Johnson',
      phone: '+65 9234 5678',
      position: 'Project Manager',
      department: 'Project Management',
      project_site: 'Marina Bay Project',
      company: null,
      join_date: '2022-11-01',
      manager_id: 'USR006',
      manager_name: 'Admin User',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' },
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2022-11-01T08:00:00Z',
      updated_at: '2024-01-10T08:00:00Z',
      last_login_at: '2024-01-20T08:15:00Z'
    },
    {
      id: 'USR003',
      employee_id: 'GT003',
      email: 'michael.brown@goldtech.com',
      full_name: 'Michael Brown',
      phone: '+65 9345 6789',
      position: 'QA Engineer',
      department: 'Quality Assurance',
      project_site: 'Sentosa Resort',
      company: null,
      join_date: '2023-03-20',
      manager_id: 'USR002',
      manager_name: 'Alice Johnson',
      status: 'INACTIVE',
      roles: [
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2023-03-20T08:00:00Z',
      updated_at: '2024-02-01T08:00:00Z',
      last_login_at: '2024-01-15T14:22:00Z'
    },
    {
      id: 'USR004',
      employee_id: 'GT004',
      email: 'emily.chen@goldtech.com',
      full_name: 'Emily Chen',
      phone: '+65 9456 7890',
      position: 'UI/UX Designer',
      department: 'Design',
      project_site: 'CBD Tower Complex',
      company: null,
      join_date: '2023-05-10',
      manager_id: 'USR005',
      manager_name: 'Carol Smith',
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2023-05-10T08:00:00Z',
      updated_at: '2024-01-20T08:00:00Z',
      last_login_at: '2024-01-19T16:45:00Z'
    },
    {
      id: 'USR005',
      employee_id: 'MGR002',
      email: 'carol.smith@goldtech.com',
      full_name: 'Carol Smith',
      phone: '+65 9567 8901',
      position: 'Design Manager',
      department: 'Design',
      project_site: 'CBD Tower Complex',
      company: null,
      join_date: '2022-08-15',
      manager_id: 'USR006',
      manager_name: 'Admin User',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' },
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2022-08-15T08:00:00Z',
      updated_at: '2024-02-05T08:00:00Z',
      last_login_at: '2024-01-20T07:30:00Z'
    },
    {
      id: 'USR006',
      employee_id: null,
      email: 'admin@goldtech.com',
      full_name: 'Admin User',
      phone: '+65 9678 9012',
      position: 'System Administrator',
      department: 'Administration',
      project_site: null,
      company: 'GoldTech Resources',
      join_date: '2021-01-01',
      manager_id: null,
      manager_name: null,
      status: 'ACTIVE',
      roles: [
        { id: 1, name: 'admin', description: 'Administrator' }
      ],
      created_at: '2021-01-01T08:00:00Z',
      updated_at: '2024-01-01T08:00:00Z',
      last_login_at: '2024-01-20T08:00:00Z'
    },
    {
      id: 'USR007',
      employee_id: null,
      email: 'client.manager@externalsystem.com',
      full_name: 'External Client Manager',
      phone: '+65 9789 0123',
      position: 'Client Project Manager',
      department: 'External Relations',
      project_site: 'Punggol Smart City',
      company: 'External Systems Pte Ltd',
      join_date: '2023-06-01',
      manager_id: null,
      manager_name: null,
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' }
      ],
      created_at: '2023-06-01T08:00:00Z',
      updated_at: '2024-01-10T08:00:00Z',
      last_login_at: '2024-01-18T10:15:00Z'
    },
    {
      id: 'USR008',
      employee_id: 'MGR003',
      email: 'bob.chen@goldtech.com',
      full_name: 'Bob Chen',
      phone: '+65 9890 1234',
      position: 'Technical Lead',
      department: 'Development',
      project_site: 'Orchard Road Development',
      company: null,
      join_date: '2022-04-12',
      manager_id: 'USR006',
      manager_name: 'Admin User',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' },
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2022-04-12T08:00:00Z',
      updated_at: '2024-01-12T08:00:00Z',
      last_login_at: '2024-01-19T11:20:00Z'
    },
    {
      id: 'USR009',
      employee_id: 'MGR004',
      email: 'david.johnson@goldtech.com',
      full_name: 'David Lee Johnson',
      phone: '+65 9901 2345',
      position: 'Operations Manager',
      department: 'Operations',
      project_site: 'Changi Airport Expansion',
      company: null,
      join_date: '2022-09-20',
      manager_id: 'USR006',
      manager_name: 'Admin User',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' }
      ],
      created_at: '2022-09-20T08:00:00Z',
      updated_at: '2024-01-15T08:00:00Z',
      last_login_at: '2024-01-18T15:30:00Z'
    },
    {
      id: 'USR010',
      employee_id: 'MGR005',
      email: 'emily.wong@goldtech.com',
      full_name: 'Emily Wong',
      phone: '+65 9012 3456',
      position: 'HR Manager',
      department: 'Human Resources',
      project_site: null,
      company: null,
      join_date: '2021-11-08',
      manager_id: 'USR006',
      manager_name: 'Admin User',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' }
      ],
      created_at: '2021-11-08T08:00:00Z',
      updated_at: '2024-01-08T08:00:00Z',
      last_login_at: '2024-01-19T09:45:00Z'
    },
    {
      id: 'USR011',
      employee_id: 'MGR006',
      email: 'johnson.martinez@goldtech.com',
      full_name: 'Johnson Martinez',
      phone: '+65 9123 4567',
      position: 'Finance Manager',
      department: 'Finance',
      project_site: null,
      company: null,
      join_date: '2022-01-15',
      manager_id: 'USR006',
      manager_name: 'Admin User',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' }
      ],
      created_at: '2022-01-15T08:00:00Z',
      updated_at: '2024-01-16T08:00:00Z',
      last_login_at: '2024-01-17T13:15:00Z'
    },
    {
      id: 'USR012',
      employee_id: 'GT005',
      email: 'sarah.wilson@goldtech.com',
      full_name: 'Sarah Wilson',
      phone: '+65 9234 5678',
      position: 'Junior Developer',
      department: 'Development',
      project_site: 'Marina Bay Project',
      company: null,
      join_date: '2023-07-10',
      manager_id: 'USR008',
      manager_name: 'Bob Chen',
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2023-07-10T08:00:00Z',
      updated_at: '2024-01-18T08:00:00Z',
      last_login_at: '2024-01-19T14:20:00Z'
    },
    {
      id: 'USR013',
      employee_id: 'GT006',
      email: 'mark.thompson@goldtech.com',
      full_name: 'Mark Thompson',
      phone: '+65 9345 6789',
      position: 'Business Analyst',
      department: 'Business Analysis',
      project_site: 'CBD Tower Complex',
      company: null,
      join_date: '2023-04-15',
      manager_id: 'USR005',
      manager_name: 'Carol Smith',
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2023-04-15T08:00:00Z',
      updated_at: '2024-01-17T08:00:00Z',
      last_login_at: '2024-01-18T10:30:00Z'
    },
    {
      id: 'USR014',
      employee_id: 'GT007',
      email: 'lisa.garcia@goldtech.com',
      full_name: 'Lisa Garcia',
      phone: '+65 9456 7890',
      position: 'DevOps Engineer',
      department: 'DevOps',
      project_site: 'Orchard Road Development',
      company: null,
      join_date: '2023-08-20',
      manager_id: 'USR008',
      manager_name: 'Bob Chen',
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      created_at: '2023-08-20T08:00:00Z',
      updated_at: '2024-01-19T08:00:00Z',
      last_login_at: '2024-01-20T11:15:00Z'
    }
  ];
};