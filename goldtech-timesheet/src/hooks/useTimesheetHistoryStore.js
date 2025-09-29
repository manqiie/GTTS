// src/hooks/useTimesheetHistoryStore.js - Refactored
import { useState, useEffect } from 'react';
import { message } from 'antd';
import { timesheetApi } from '../services/timesheetApi';

/**
 * Hook for managing timesheet history data with API integration
 */
export function useTimesheetHistoryStore() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const response = await timesheetApi.getTimesheetHistory();
      
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
      
      const response = await timesheetApi.getTimesheetDetails(timesheetId);
      
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