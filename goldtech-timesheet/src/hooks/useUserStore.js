// src/hooks/useUserStore.js - Updated for User Management
import { useState, useEffect } from 'react';

export function useUserStore() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load users and roles from localStorage on mount
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stored = localStorage.getItem('users');
      if (stored) {
        const data = JSON.parse(stored);
        console.log('Loaded users from localStorage:', data);
        setUsers(data);
      } else {
        console.log('No stored data, creating sample users');
        const sampleData = generateSampleUsers();
        setUsers(sampleData);
        localStorage.setItem('users', JSON.stringify(sampleData));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const stored = localStorage.getItem('roles');
      if (stored) {
        setRoles(JSON.parse(stored));
      } else {
        const defaultRoles = [
          { id: 1, name: 'ADMIN', description: 'System Administrator - Full access to all features' },
          { id: 2, name: 'MANAGER', description: 'Project Manager - Can approve timesheets and manage team' },
          { id: 3, name: 'EMPLOYEE', description: 'Employee - Can submit timesheets and manage own profile' }
        ];
        setRoles(defaultRoles);
        localStorage.setItem('roles', JSON.stringify(defaultRoles));
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
    }
  };

  const saveToStorage = (updatedUsers) => {
    try {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const createUser = (userData) => {
    const newUser = {
      ...userData,
      id: generateId(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToStorage(updatedUsers);
    return newUser;
  };

  const updateUser = (id, updates) => {
    const updatedUsers = users.map(user => 
      user.id === id 
        ? { ...user, ...updates, updatedAt: new Date().toISOString() }
        : user
    );
    
    setUsers(updatedUsers);
    saveToStorage(updatedUsers);
    return updatedUsers.find(user => user.id === id);
  };

  const toggleUserStatus = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return updateUser(id, { status: newStatus });
    }
  };

  const getUser = (id) => {
    console.log('Looking for user with ID:', id);
    console.log('Available users:', users.map(u => u.id));
    const found = users.find(user => user.id === id);
    console.log('Found user:', found);
    return found;
  };

  const getActiveUsers = () => {
    return users.filter(user => user.status === 'ACTIVE');
  };

  const getUsersByRole = (roleName) => {
    return users.filter(user => 
      user.roles && user.roles.some(role => role.name === roleName)
    );
  };

  const getManagers = () => {
    return getUsersByRole('MANAGER');
  };

  const searchUsers = (searchTerm, filters = {}) => {
    let filteredUsers = [...users];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.fullName.toLowerCase().includes(term) ||
        user.employeeId?.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.position?.toLowerCase().includes(term) ||
        user.projectSite?.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }

    // Role filter
    if (filters.role && filters.role !== 'all') {
      filteredUsers = filteredUsers.filter(user => 
        user.roles && user.roles.some(role => role.name === filters.role)
      );
    }

    // Position filter
    if (filters.position && filters.position !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.position === filters.position);
    }

    // Project Site filter
    if (filters.projectSite && filters.projectSite !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.projectSite === filters.projectSite);
    }

    // Department filter
    if (filters.department && filters.department !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.department === filters.department);
    }

    return filteredUsers;
  };

  return {
    users,
    roles,
    loading,
    createUser,
    updateUser,
    toggleUserStatus,
    getUser,
    getActiveUsers,
    getUsersByRole,
    getManagers,
    searchUsers,
    loadUsers,
    loadRoles
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
      employeeId: 'GT001',
      email: 'john.smith@goldtech.com',
      fullName: 'John Smith',
      phone: '+65 9123 4567',
      position: 'Senior Developer',
      department: 'Development',
      projectSite: 'Marina Bay Project',
      managerId: 'USR002', // Alice Johnson
      joinDate: '2023-01-15',
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'EMPLOYEE', description: 'Employee - Can submit timesheets and manage own profile' }
      ],
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: 'USR002',
      employeeId: 'GT002',
      email: 'alice.johnson@goldtech.com',
      fullName: 'Alice Johnson',
      phone: '+65 9234 5678',
      position: 'Project Manager',
      department: 'Project Management',
      projectSite: 'Marina Bay Project',
      managerId: 'USR005', // Bob Chen (Senior Manager)
      joinDate: '2022-03-10',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'MANAGER', description: 'Project Manager - Can approve timesheets and manage team' },
        { id: 3, name: 'EMPLOYEE', description: 'Employee - Can submit timesheets and manage own profile' }
      ],
      createdAt: '2022-03-10T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: 'USR003',
      employeeId: 'GT003',
      email: 'michael.brown@goldtech.com',
      fullName: 'Michael Brown',
      phone: '+65 9345 6789',
      position: 'QA Engineer',
      department: 'Quality Assurance',
      projectSite: 'Sentosa Resort',
      managerId: 'USR002', // Alice Johnson
      joinDate: '2023-03-20',
      status: 'INACTIVE',
      roles: [
        { id: 3, name: 'EMPLOYEE', description: 'Employee - Can submit timesheets and manage own profile' }
      ],
      createdAt: '2023-03-20T08:00:00Z',
      updatedAt: '2024-02-01T08:00:00Z'
    },
    {
      id: 'USR004',
      employeeId: null, // Admin user without employee ID
      email: 'admin@goldtech.com',
      fullName: 'System Administrator',
      phone: '+65 9456 7890',
      position: 'System Administrator',
      department: 'IT',
      projectSite: 'Head Office',
      managerId: null, // No manager
      joinDate: '2021-01-01',
      status: 'ACTIVE',
      roles: [
        { id: 1, name: 'ADMIN', description: 'System Administrator - Full access to all features' }
      ],
      createdAt: '2021-01-01T08:00:00Z',
      updatedAt: '2024-01-20T08:00:00Z'
    },
    {
      id: 'USR005',
      employeeId: 'GT005',
      email: 'bob.chen@goldtech.com',
      fullName: 'Bob Chen',
      phone: '+65 9567 8901',
      position: 'Senior Manager',
      department: 'Management',
      projectSite: 'Head Office',
      managerId: null, // Top-level manager
      joinDate: '2020-08-15',
      status: 'ACTIVE',
      roles: [
        { id: 1, name: 'ADMIN', description: 'System Administrator - Full access to all features' },
        { id: 2, name: 'MANAGER', description: 'Project Manager - Can approve timesheets and manage team' },
        { id: 3, name: 'EMPLOYEE', description: 'Employee - Can submit timesheets and manage own profile' }
      ],
      createdAt: '2020-08-15T08:00:00Z',
      updatedAt: '2024-02-05T08:00:00Z'
    },
    {
      id: 'USR006',
      employeeId: 'GT006',
      email: 'emily.chen@goldtech.com',
      fullName: 'Emily Chen',
      phone: '+65 9678 9012',
      position: 'UI/UX Designer',
      department: 'Design',
      projectSite: 'CBD Tower Complex',
      managerId: 'USR002', // Alice Johnson
      joinDate: '2023-05-10',
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'EMPLOYEE', description: 'Employee - Can submit timesheets and manage own profile' }
      ],
      createdAt: '2023-05-10T08:00:00Z',
      updatedAt: '2024-01-20T08:00:00Z'
    }
  ];
};