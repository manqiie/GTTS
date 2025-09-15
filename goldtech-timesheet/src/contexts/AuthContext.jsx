// AuthContext.jsx - Complete Updated Version
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Mock authentication - check against sample users with new structure
      const mockUser = await mockAuthenticate(credentials);
      
      if (mockUser) {
        setUser(mockUser);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        return { success: true, user: mockUser };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock authentication function with new user structure
const mockAuthenticate = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Sample users for demo - matching new database structure
  const sampleUsers = [
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
      status: 'ACTIVE',
      roles: [
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      // Legacy compatibility for existing components
      name: 'John Smith',
      role: 'employee',
      permissions: ['timesheet.create', 'timesheet.view', 'timesheet.edit'],
      employeeId: 'GT001',
      projectSite: 'Marina Bay Project',
      managerName: 'Alice Johnson'
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
      join_date: '2022-03-10',
      manager_id: 'USR006',
      status: 'ACTIVE',
      roles: [
        { id: 2, name: 'manager', description: 'Manager' },
        { id: 3, name: 'employee', description: 'Employee' }
      ],
      // Legacy compatibility
      name: 'Alice Johnson',
      role: 'manager',
      permissions: [
        'timesheet.create', 'timesheet.view', 'timesheet.edit',
        'timesheet.approve', 'employee.view'
      ],
      employeeId: 'MGR001',
      projectSite: 'Marina Bay Project',
      managerName: 'Admin User'
    },
    {
      id: 'USR006',
      employee_id: null,
      email: 'admin@goldtech.com',
      full_name: 'Admin User',
      phone: '+65 9345 6789',
      position: 'System Administrator',
      department: 'Administration',
      project_site: null,
      company: 'GoldTech Resources',
      join_date: '2021-01-01',
      manager_id: null,
      status: 'ACTIVE',
      roles: [
        { id: 1, name: 'admin', description: 'Administrator' }
      ],
      // Legacy compatibility
      name: 'Admin User',
      role: 'admin',
      permissions: [
        'timesheet.create', 'timesheet.view', 'timesheet.edit',
        'timesheet.approve', 'timesheet.manage',
        'employee.create', 'employee.view', 'employee.edit', 'employee.manage',
        'system.admin'
      ],
      employeeId: 'ADMIN001',
      projectSite: 'Head Office',
      managerName: null
    }
  ];

  // Simple credential check - can use email or employee_id
  const user = sampleUsers.find(u => 
    u.email === credentials.email || u.employee_id === credentials.email
  );

  // For demo purposes, accept any password for existing users
  if (user && credentials.password) {
    // Update last login time
    user.last_login_at = new Date().toISOString();
    return user;
  }

  return null;
};