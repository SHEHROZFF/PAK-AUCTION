export const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Product Submissions
  PRODUCT_SUBMISSIONS: '/product-submissions',
  PRODUCT_SUBMISSIONS_ADMIN: '/product-submissions/admin',
  
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh-token',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Users
  USERS: '/users',
  
  // Auctions
  AUCTIONS: '/auctions',
  
  // Bids
  BIDS: '/bids'
};

export default {
  API_BASE_URL,
  API_ENDPOINTS
}; 