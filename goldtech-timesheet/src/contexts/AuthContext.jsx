// AuthContext.jsx - Updated for Real Backend Integration
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

  // API base URL - adjust as needed
  const API_BASE_URL = 'http://localhost:8080/api';

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Validate token with backend
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.valid && data.user) {
            // Transform backend user data to frontend format
            const transformedUser = transformUserData(data.user);
            setUser(transformedUser);
          } else {
            // Token invalid, remove it
            localStorage.removeItem('authToken');
          }
        } else {
          // Token invalid, remove it
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token
        localStorage.setItem('authToken', data.token);
        
        // Transform and set user data
        const transformedUser = transformUserData(data.user);
        setUser(transformedUser);
        
        return { success: true, user: transformedUser };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Call backend logout endpoint
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of backend response
      setUser(null);
      localStorage.removeItem('authToken');
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update user profile via API
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const transformedUser = transformUserData(result.data);
          setUser(transformedUser);
          return { success: true };
        } else {
          return { success: false, error: result.message };
        }
      } else {
        return { success: false, error: 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const transformedUser = transformUserData(userData);
        setUser(transformedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Transform backend user data to frontend format
  const transformUserData = (backendUser) => {
    return {
      id: backendUser.id,
      employeeId: backendUser.employeeId,
      name: backendUser.fullName || backendUser.name,
      fullName: backendUser.fullName,
      email: backendUser.email,
      phone: backendUser.phone,
      position: backendUser.position,
      department: backendUser.department,
      projectSite: backendUser.projectSite,
      company: backendUser.company,
      joinDate: backendUser.joinDate,
      managerName: backendUser.managerName,
      status: backendUser.status?.toLowerCase() || 'active',
      roles: backendUser.roles || [],
      role: backendUser.role || (backendUser.roles?.[0]?.name) || 'employee',
      permissions: backendUser.permissions || [],
      lastLoginAt: backendUser.lastLoginAt,
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt
    };
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};