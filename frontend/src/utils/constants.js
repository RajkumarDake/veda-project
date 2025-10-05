// Color schemes for visualizations
export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#48bb78',
  warning: '#ed8936',
  danger: '#f56565',
  info: '#4299e1',
  light: '#f7fafc',
  dark: '#2d3748',
  gray: '#718096',
};

export const SENTIMENT_COLORS = {
  positive: COLORS.success,
  negative: COLORS.danger,
  neutral: COLORS.warning,
};

export const ENTITY_TYPE_COLORS = {
  Company: COLORS.danger,
  NGO: COLORS.success,
  Media: COLORS.primary,
  Person: COLORS.warning,
};

// Chart color palettes
export const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
];

// Bias detection thresholds
export const BIAS_THRESHOLDS = {
  sentiment: {
    high: 0.7,
    medium: 0.4,
    low: 0.0,
  },
  entropy: {
    high: 1.0,
    medium: 0.5,
    low: 0.0,
  },
};

// UI Constants
export const UI_CONSTANTS = {
  maxEntityNameLength: 20,
  maxArticlePreviewLength: 500,
  defaultPageSize: 20,
  searchDebounceMs: 300,
  animationDurationMs: 200,
};

// API Constants
export const API_CONSTANTS = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000,
};

// Network visualization constants
export const NETWORK_CONSTANTS = {
  nodeRadius: {
    min: 8,
    max: 20,
    default: 12,
  },
  linkDistance: 100,
  chargeStrength: -300,
  collisionRadius: 30,
};

// File upload constants
export const FILE_CONSTANTS = {
  allowedExtensions: ['.txt'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 100,
};

export default {
  COLORS,
  SENTIMENT_COLORS,
  ENTITY_TYPE_COLORS,
  CHART_COLORS,
  BIAS_THRESHOLDS,
  UI_CONSTANTS,
  API_CONSTANTS,
  NETWORK_CONSTANTS,
  FILE_CONSTANTS,
};
