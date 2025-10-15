// src/hooks/useTimesheetHistoryStore.js - Updated with stand-in support
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
        
        // Transform the data to handle stand-in approvals
        const transformedHistory = response.data.map(transformHistoryItem);
        setHistory(transformedHistory);
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
   * Transform history item to handle stand-in approvals
   */
  const transformHistoryItem = (item) => {
    return {
      ...item,
      // If stand-in approval, show stand-in name as approver
      approvedBy: item.isStandinApproval && item.standinApproverName 
        ? item.standinApproverName 
        : item.approvedBy,
      // Keep original supervisor name for reference
      originalSupervisor: item.approvedBy,
      // Add display name that combines both for clarity
      approvedByDisplay: item.isStandinApproval && item.standinApproverName
        ? `${item.standinApproverName} (for ${item.approvedBy})`
        : item.approvedBy
    };
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
        (item.approvedBy && item.approvedBy.toLowerCase().includes(term)) ||
        (item.standinApproverName && item.standinApproverName.toLowerCase().includes(term)) ||
        (item.originalSupervisor && item.originalSupervisor.toLowerCase().includes(term))
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
        
        // Transform the details to handle stand-in approvals
        const transformedDetails = {
          ...response.data,
          approvedBy: response.data.isStandinApproval && response.data.standinApproverName 
            ? response.data.standinApproverName 
            : response.data.approvedBy,
          originalSupervisor: response.data.approvedBy,
          approvedByDisplay: response.data.isStandinApproval && response.data.standinApproverName
            ? `${response.data.standinApproverName} (for ${response.data.approvedBy})`
            : response.data.approvedBy
        };
        
        return transformedDetails;
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