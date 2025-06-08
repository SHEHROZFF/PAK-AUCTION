// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://pak-auc-back.com.phpnode.net/api';
class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const authToken = this.getAuthToken();
    
    const config: RequestInit = {
      credentials: 'include', // Important for cookie-based auth
      headers: {
        ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // If token is invalid, clear it from localStorage
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email: string, password: string, rememberMe = false) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async refreshToken() {
    return this.request('/auth/refresh-token', {
      method: 'POST',
    });
  }

  // User Management APIs
  async getUsers(page = 1, limit = 10, search = '', status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });
    return this.request(`/admin/users?${params}`);
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserDashboard(userId: string) {
    return this.request(`/users/dashboard?userId=${userId}`);
  }

  async getUserBids(userId: string) {
    return this.request(`/users/bids?userId=${userId}`);
  }

  async getUserNotifications(userId: string) {
    return this.request(`/users/notifications?userId=${userId}`);
  }

  // Auction Management APIs
  async getAuctions(page = 1, limit = 10, search = '', category = '', status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(category && { category }),
      ...(status && { status }),
    });
    return this.request(`/auctions?${params}`);
  }

  async getAuctionById(id: string) {
    return this.request(`/auctions/${id}`);
  }

  async createAuction(auctionData: any) {
    return this.request('/auctions', {
      method: 'POST',
      body: JSON.stringify(auctionData),
    });
  }

  async updateAuction(id: string, auctionData: any) {
    return this.request(`/auctions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(auctionData),
    });
  }

  async deleteAuction(id: string) {
    return this.request(`/auctions/${id}`, {
      method: 'DELETE',
    });
  }

  async getAuctionBids(auctionId: string) {
    return this.request(`/auctions/${auctionId}/bids`);
  }

  async placeBid(auctionId: string, amount: number) {
    return this.request(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Category Management APIs
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryById(id: string) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async initializeDefaultCategories() {
    return this.request('/categories/initialize-defaults', {
      method: 'POST',
    });
  }

  // Dashboard Analytics (these would need to be implemented in backend)
  async getDashboardStats() {
    return this.request('/admin/dashboard-stats');
  }

  async getRevenueData(period = '6months') {
    return this.request(`/admin/revenue?period=${period}`);
  }

  async getCategoryStats() {
    return this.request('/admin/category-stats');
  }

  async getRecentActivity() {
    return this.request('/admin/recent-activity');
  }

  async getEndingSoonAuctions() {
    return this.request('/admin/ending-soon');
  }

  // Bid Management
  async getAllBids(page = 1, limit = 10, search = '', status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });
    return this.request(`/admin/bids?${params}`);
  }

  async deleteBid(bidId: string) {
    return this.request(`/admin/bids/${bidId}`, {
      method: 'DELETE',
    });
  }

  // Notification Management
  async sendNotification(notificationData: any) {
    return this.request('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async getSystemNotifications() {
    return this.request('/admin/notifications');
  }

  // Settings Management
  async getSettings() {
    return this.request('/admin/settings');
  }

  async updateAllSettings(settingsData: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  async updatePaymentSettings(paymentSettings: any) {
    return this.request('/admin/settings/payment', {
      method: 'PUT',
      body: JSON.stringify({ paymentSettings }),
    });
  }

  async updateWebsiteSettings(websiteSettings: any) {
    return this.request('/admin/settings/website', {
      method: 'PUT',
      body: JSON.stringify({ websiteSettings }),
    });
  }

  async resetSettings() {
    return this.request('/admin/settings/reset', {
      method: 'POST',
    });
  }

  // Image Management
  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    return this.request('/images/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async cleanupOrphanedImages(imageFilenames: string[]) {
    return this.request('/images/cleanup-orphaned', {
      method: 'DELETE',
      body: JSON.stringify({ imageFilenames }),
    });
  }

  async deleteAuctionImage(filename: string) {
    return this.request(`/images/auction/${filename}`, {
      method: 'DELETE',
    });
  }

  // Homepage Management APIs
  async getHomepageContent() {
    return this.request('/homepage/content');
  }

  async updateHomepageContent(content: any) {
    return this.request('/homepage/content', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  }

  async getAuctionsForSelection() {
    return this.request('/homepage/auctions-for-selection');
  }

  async getActiveAuctions(limit = 50) {
    return this.request(`/auctions?status=ACTIVE&limit=${limit}`);
  }

  // Contact Management APIs
  async getContactContent() {
    return this.request('/contact/content');
  }

  async updateContactContent(content: any) {
    return this.request('/contact/content', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  }

  async getContactSubmissions() {
    return this.request('/contact/submissions');
  }

  async updateContactSubmissionStatus(id: string, status: string, adminNotes?: string) {
    return this.request(`/contact/submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  // About Management APIs
  async getAboutContent() {
    return this.request('/about/content');
  }

  async updateAboutContent(content: any) {
    return this.request('/about/content', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  }

  // Product Submission Management APIs
  async getProductSubmissions(page = 1, limit = 10, search = '', status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });
    return this.request(`/product-submissions/admin/all?${params}`);
  }

  async getProductSubmissionById(id: string) {
    return this.request(`/product-submissions/${id}`);
  }

  async updateProductSubmissionStatus(id: string, status: string, adminNotes?: string) {
    return this.request(`/product-submissions/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  async deleteProductSubmission(id: string) {
    return this.request(`/product-submissions/admin/${id}`, {
      method: 'DELETE',
    });
  }

  async convertProductSubmissionToAuction(id: string, auctionData: any) {
    return this.request(`/product-submissions/admin/${id}/convert-to-auction`, {
      method: 'POST',
      body: JSON.stringify(auctionData),
    });
  }
}

export const apiService = new ApiService(); 