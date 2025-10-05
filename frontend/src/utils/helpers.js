import { SENTIMENT_COLORS, BIAS_THRESHOLDS, UI_CONSTANTS } from './constants';

/**
 * Utility functions for the FishEye Watcher application
 */

// Text processing utilities
export const truncateText = (text, maxLength = UI_CONSTANTS.maxEntityNameLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatEntityName = (name) => {
  return truncateText(name, UI_CONSTANTS.maxEntityNameLength);
};

// Color utilities
export const getSentimentColor = (sentiment) => {
  return SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.neutral;
};

export const getSentimentIcon = (sentiment) => {
  const icons = {
    positive: '😊',
    negative: '😞',
    neutral: '😐',
  };
  return icons[sentiment] || '❓';
};

export const getScoreColor = (score, type = 'sentiment') => {
  const thresholds = BIAS_THRESHOLDS[type];
  
  if (type === 'sentiment') {
    if (score >= thresholds.high * 100) return SENTIMENT_COLORS.positive;
    if (score >= thresholds.medium * 100) return SENTIMENT_COLORS.neutral;
    return SENTIMENT_COLORS.negative;
  } else if (type === 'entropy') {
    // For entropy, lower scores indicate more bias
    if (score <= thresholds.low) return SENTIMENT_COLORS.negative;
    if (score <= thresholds.medium) return SENTIMENT_COLORS.neutral;
    return SENTIMENT_COLORS.positive;
  }
  
  return SENTIMENT_COLORS.neutral;
};

export const getScoreCategory = (score, type = 'sentiment') => {
  const thresholds = BIAS_THRESHOLDS[type];
  
  if (type === 'sentiment') {
    if (score >= thresholds.high * 100) return 'score-high';
    if (score >= thresholds.medium * 100) return 'score-medium';
    return 'score-low';
  } else if (type === 'entropy') {
    if (score <= thresholds.low) return 'score-low';
    if (score <= thresholds.medium) return 'score-medium';
    return 'score-high';
  }
  
  return 'score-medium';
};

// Data processing utilities
export const calculateSentimentRatio = (positive, negative, neutral) => {
  const total = positive + negative + neutral;
  if (total === 0) return { positiveRatio: 0, negativeRatio: 0, neutralRatio: 0 };
  
  return {
    positiveRatio: positive / total,
    negativeRatio: negative / total,
    neutralRatio: neutral / total,
  };
};

export const sortByBias = (data, type = 'sentiment') => {
  if (type === 'sentiment') {
    return [...data].sort((a, b) => a.positive_ratio - b.positive_ratio);
  } else if (type === 'entropy') {
    return [...data].sort((a, b) => a.entropy - b.entropy);
  }
  return data;
};

export const filterBySearch = (data, searchTerm, fields = ['entity', 'name']) => {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter(item => 
    fields.some(field => 
      item[field] && item[field].toLowerCase().includes(term)
    )
  );
};

// Date utilities
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Number utilities
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatNumber = (value, decimals = 0) => {
  if (typeof value !== 'number') return '0';
  return value.toFixed(decimals);
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const unique = (array, key) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage utilities
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const handleApiError = (error, defaultMessage = 'Operation failed') => {
  const message = getErrorMessage(error);
  console.error('API Error:', message);
  return message || defaultMessage;
};

// Export all utilities as default
export default {
  truncateText,
  capitalizeFirst,
  formatEntityName,
  getSentimentColor,
  getSentimentIcon,
  getScoreColor,
  getScoreCategory,
  calculateSentimentRatio,
  sortByBias,
  filterBySearch,
  formatDate,
  formatDateTime,
  formatPercentage,
  formatNumber,
  isValidEmail,
  isValidUrl,
  groupBy,
  unique,
  debounce,
  saveToLocalStorage,
  loadFromLocalStorage,
  getErrorMessage,
  handleApiError,
};
