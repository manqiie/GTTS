// src/hooks/useTimesheetHistoryStore.js
import { useState, useEffect } from 'react';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Hook for managing timesheet history data with API integration
 */
export function useTimesheetHistoryStore() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // API helper functions
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: getHeaders(),
      ...options,
    };

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - redirecting to login');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadHistory();
  }, []);

  /**
   * Load timesheet history from API
   */
  const loadHistory = async () => {
    console.log('Loading timesheet history from API...');
    setLoading(true);
    
    try {
      const response = await apiRequest('/timesheets/history');
      
      if (response.success && response.data) {
        console.log('History loaded successfully:', response.data);
        setHistory(response.data);
      } else {
        console.log('No history data received or API error');
        message.warning('Could not load history from server');
        setHistory([]);
      }
    } catch (error) {
      console.error('Error loading timesheet history:', error);
      message.error('Failed to load timesheet history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search and filter history
   */
  const searchHistory = (searchTerm, filters = {}) => {
    let filteredHistory = [...history];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredHistory = filteredHistory.filter(item => 
        item.monthName.toLowerCase().includes(term) ||
        item.year.toString().includes(term) ||
        (item.approvedBy && item.approvedBy.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredHistory = filteredHistory.filter(item => item.status === filters.status);
    }

    // Year filter
    if (filters.year && filters.year !== 'all') {
      filteredHistory = filteredHistory.filter(item => item.year === parseInt(filters.year));
    }

    // Month filter
    if (filters.month && filters.month !== 'all') {
      filteredHistory = filteredHistory.filter(item => item.month === parseInt(filters.month));
    }

    return filteredHistory;
  };

  /**
   * Get specific timesheet details
   */
  const getTimesheetDetails = async (timesheetId) => {
    try {
      console.log('Getting timesheet details:', timesheetId);
      
      const response = await apiRequest(`/timesheets/${timesheetId}/details`);
      
      if (response.success && response.data) {
        console.log('Timesheet details loaded successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get timesheet details');
      }
    } catch (error) {
      console.error('Error getting timesheet details:', error);
      message.error('Failed to load timesheet details');
      return null;
    }
  };

  return {
    history,
    loading,
    loadHistory,
    searchHistory,
    getTimesheetDetails
  };
}