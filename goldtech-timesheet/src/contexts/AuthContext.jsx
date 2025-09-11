// src/contexts/AuthContext.jsx
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
      // In real implementation, this would be an API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });
      // const userData = await response.json();

      // Mock authentication - check against sample users
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
    // In real implementation, you might also call logout API
    // fetch('/api/auth/logout', { method: 'POST' });
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // In real implementation, sync with backend
    // fetch('/api/user/profile', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedData)
    // });
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

// Mock authentication function
const mockAuthenticate = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Sample users for demo
  const sampleUsers = [
    {
      id: 'USR001',
      employeeId: 'GT001',
      name: 'John Smith',
      email: 'john.smith@goldtech.com',
      phone: '+65 9123 4567',
      position: 'Senior Developer',
      department: 'Development',
      projectSite: 'Marina Bay Project',
      managerName: 'Alice Johnson',
      managerId: 'MGR001',
      joinDate: '2023-01-15',
      role: 'employee',
      permissions: ['timesheet.create', 'timesheet.view', 'timesheet.edit'],
      avatar: null,
      status: 'active'
    },
    {
      id: 'USR002',
      employeeId: 'GT002',
      name: 'Alice Johnson',
      email: 'alice.johnson@goldtech.com',
      phone: '+65 9234 5678',
      position: 'Project Manager',
      department: 'Project Management',
      projectSite: 'Marina Bay Project',
      managerName: 'Bob Chen',
      managerId: 'MGR002',
      joinDate: '2022-03-10',
      role: 'manager',
      permissions: [
        'timesheet.create', 'timesheet.view', 'timesheet.edit',
        'timesheet.approve', 'employee.view'
      ],
      avatar: null,
      status: 'active'
    },
    {
      id: 'USR003',
      employeeId: 'ADMIN001',
      name: 'Admin User',
      email: 'admin@goldtech.com',
      phone: '+65 9345 6789',
      position: 'System Administrator',
      department: 'IT',
      projectSite: 'Head Office',
      managerName: 'CEO',
      managerId: 'CEO001',
      joinDate: '2021-01-01',
      role: 'admin',
      permissions: [
        'timesheet.create', 'timesheet.view', 'timesheet.edit',
        'timesheet.approve', 'timesheet.manage',
        'employee.create', 'employee.view', 'employee.edit', 'employee.manage',
        'system.admin'
      ],
      avatar: null,
      status: 'active'
    }
  ];

  // Simple credential check
  const user = sampleUsers.find(u => 
    u.email === credentials.email || u.employeeId === credentials.email
  );

  // For demo purposes, accept any password for existing users
  if (user && credentials.password) {
    return user;
  }

  return null;
};