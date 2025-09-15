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
        (emp.manager_name && emp.manager_name.toLowerCase().includes(term))
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

    // Position filter
    if (filters.position && filters.position !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.position === filters.position);
    }

    // Project Site filter
    if (filters.projectSite && filters.projectSite !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.project_site === filters.projectSite);
    }

    return filteredEmployees;
  };

  return {
    employees,
    loading,
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    getEmployee,
    getActiveEmployees,
    searchEmployees,
    loadEmployees
  };
}

// Utility functions
const generateId = () => {
  return 'USR' + Date.now().toString();
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
      employee_id: null, // Admin doesn't need employee ID
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
      employee_id: null, // External manager doesn't need employee ID
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
    }
  ];
};