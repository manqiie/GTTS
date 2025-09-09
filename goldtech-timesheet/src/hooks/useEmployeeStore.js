// src/hooks/useEmployeeStore.js - Fixed Version
import { useState, useEffect } from 'react';

export function useEmployeeStore() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading = true

  // Load employees from localStorage on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Add a small delay to simulate real loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stored = localStorage.getItem('employees');
      if (stored) {
        const data = JSON.parse(stored);
        console.log('Loaded employees from localStorage:', data); // Debug log
        setEmployees(data);
      } else {
        // Initialize with sample data for development
        console.log('No stored data, creating sample employees'); // Debug log
        const sampleData = generateSampleEmployees();
        setEmployees(sampleData);
        localStorage.setItem('employees', JSON.stringify(sampleData));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (updatedEmployees) => {
    try {
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    } catch (error) {
      console.error('Error saving employees:', error);
    }
  };

  const createEmployee = (employeeData) => {
    const newEmployee = {
      ...employeeData,
      id: generateId(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedEmployees = [...employees, newEmployee];
    setEmployees(updatedEmployees);
    saveToStorage(updatedEmployees);
    return newEmployee;
  };

  const updateEmployee = (id, updates) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === id 
        ? { ...emp, ...updates, updatedAt: new Date().toISOString() }
        : emp
    );
    
    setEmployees(updatedEmployees);
    saveToStorage(updatedEmployees);
    return updatedEmployees.find(emp => emp.id === id);
  };

  const toggleEmployeeStatus = (id) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      const newStatus = employee.status === 'active' ? 'inactive' : 'active';
      return updateEmployee(id, { status: newStatus });
    }
  };

  const getEmployee = (id) => {
    console.log('Looking for employee with ID:', id); // Debug log
    console.log('Available employees:', employees.map(e => e.id)); // Debug log
    const found = employees.find(emp => emp.id === id);
    console.log('Found employee:', found); // Debug log
    return found;
  };

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.status === 'active');
  };

  const searchEmployees = (searchTerm, filters = {}) => {
    let filteredEmployees = [...employees];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.name.toLowerCase().includes(term) ||
        emp.employeeId.toLowerCase().includes(term) ||
        emp.position.toLowerCase().includes(term) ||
        emp.projectSite.toLowerCase().includes(term) ||
        emp.managerName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === filters.status);
    }

    // Position filter
    if (filters.position && filters.position !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.position === filters.position);
    }

    // Project Site filter
    if (filters.projectSite && filters.projectSite !== 'all') {
      filteredEmployees = filteredEmployees.filter(emp => emp.projectSite === filters.projectSite);
    }

    return filteredEmployees;
  };

  return {
    employees,
    loading, // Make sure to return loading state
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
  return 'EMP' + Date.now().toString();
};

const generateSampleEmployees = () => {
  return [
    {
      id: 'EMP001', // Fixed ID that matches what you're testing
      employeeId: 'GT001',
      name: 'John Smith',
      email: 'john.smith@goldtech.com',
      phone: '+65 9123 4567',
      position: 'Senior Developer',
      projectSite: 'Marina Bay Project',
      managerName: 'Alice Johnson',
      managerId: 'MGR001',
      department: 'Development',
      joinDate: '2023-01-15',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: 'EMP002',
      employeeId: 'GT002',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@goldtech.com',
      phone: '+65 9234 5678',
      position: 'Project Manager',
      projectSite: 'Orchard Road Development',
      managerName: 'Bob Chen',
      managerId: 'MGR002',
      department: 'Project Management',
      joinDate: '2022-11-01',
      status: 'active',
      createdAt: '2022-11-01T08:00:00Z',
      updatedAt: '2024-01-10T08:00:00Z'
    },
    {
      id: 'EMP003',
      employeeId: 'GT003',
      name: 'Michael Brown',
      email: 'michael.brown@goldtech.com',
      phone: '+65 9345 6789',
      position: 'QA Engineer',
      projectSite: 'Sentosa Resort',
      managerName: 'Alice Johnson',
      managerId: 'MGR001',
      department: 'Quality Assurance',
      joinDate: '2023-03-20',
      status: 'inactive',
      createdAt: '2023-03-20T08:00:00Z',
      updatedAt: '2024-02-01T08:00:00Z'
    },
    {
      id: 'EMP004',
      employeeId: 'GT004',
      name: 'Emily Chen',
      email: 'emily.chen@goldtech.com',
      phone: '+65 9456 7890',
      position: 'UI/UX Designer',
      projectSite: 'CBD Tower Complex',
      managerName: 'Carol Smith',
      managerId: 'MGR003',
      department: 'Design',
      joinDate: '2023-05-10',
      status: 'active',
      createdAt: '2023-05-10T08:00:00Z',
      updatedAt: '2024-01-20T08:00:00Z'
    },
    {
      id: 'EMP005',
      employeeId: 'GT005',
      name: 'David Lee',
      email: 'david.lee@goldtech.com',
      phone: '+65 9567 8901',
      position: 'DevOps Engineer',
      projectSite: 'Punggol Smart City',
      managerName: 'Bob Chen',
      managerId: 'MGR002',
      department: 'DevOps',
      joinDate: '2022-08-15',
      status: 'active',
      createdAt: '2022-08-15T08:00:00Z',
      updatedAt: '2024-02-05T08:00:00Z'
    }
  ];
};