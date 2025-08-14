// API Base URL - Update this to match your backend URL
export const API_BASE_URL = 'https://assisted-determination-transparent-begins.trycloudflare.com/api';

// Base URL for images (without /api)
export const IMAGE_BASE_URL = 'https://assisted-determination-transparent-begins.trycloudflare.com';

// Utility function to construct full image URLs
export const getFullImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, remove it to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    // Web-based endpoints (token-based)
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    // Mobile-specific OTP endpoints
    SEND_OTP: '/auth/mobile/send-otp',
    VERIFY_OTP: '/auth/mobile/verify-otp',
    FORGOT_PASSWORD_OTP: '/auth/mobile/forgot-password-otp',
    VERIFY_PASSWORD_RESET_OTP: '/auth/mobile/verify-password-reset-otp',
    RESET_PASSWORD_OTP: '/auth/mobile/reset-password-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  
  // User endpoints
  USERS: {
    PROFILE: '/users/profile',
    DASHBOARD: '/users/dashboard',
    WATCHLIST: '/users/watchlist',
    BIDS: '/users/bids',
    NOTIFICATIONS: '/users/notifications',
  },
  
  // Auction endpoints
  AUCTIONS: {
    LIST: '/auctions',
    DETAILS: '/auctions/:id',
    CREATE: '/auctions',
    UPDATE: '/auctions/:id',
    DELETE: '/auctions/:id',
    BID: '/auctions/:id/bid',
    WATCHLIST: '/auctions/:id/watchlist',
  },
  
  // Category endpoints
  CATEGORIES: '/categories',
  
  // Image upload
  IMAGES: '/images/upload',
};

// Request timeout
export const REQUEST_TIMEOUT = 10000;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  REMEMBER_EMAIL: 'remember_email',
};

// Theme colors matching the website
export const THEME_COLORS = {
  // Primary blue from website
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
}; 