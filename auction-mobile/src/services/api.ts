import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT, STORAGE_KEYS } from '../constants/api';
import { 
  LoginRequest, 
  RegisterRequest, 
  VerifyOTPRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  LoginResponse,
  RegisterResponse,
  ApiResponse 
} from '../types/auth';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              if (response.data) {
                const newToken = response.data.token;
                
                await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await this.clearAuthData();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  // Helper method to handle API errors
  private handleError(error: AxiosError): never {
    console.log('API Error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      // Check if it's a validation error with specific field errors
      const errorData = error.response.data as any;
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Format validation errors
        const validationErrors = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
        throw { 
          success: false, 
          message: `Validation failed: ${validationErrors}`,
          errors: errorData.errors
        };
      }
      throw error.response.data;
    } else if (error.request) {
      throw { success: false, message: 'Network error. Please check your connection and ensure the server is running.' };
    } else {
      throw { success: false, message: 'An unexpected error occurred.' };
    }
  }

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Mobile registration (automatically sends OTP)
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Add mobile flag to the existing register endpoint
      const mobileData = { ...userData, isMobile: true };
      const response = await this.api.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, mobileData);
      console.log(" register response",response);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Verify OTP for email verification
  async verifyEmail(data: VerifyOTPRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Verify OTP for password reset
  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // NEW: Verify Password Reset OTP (separate from email verification)
  async verifyPasswordResetOTP(data: VerifyOTPRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET_OTP, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Send OTP for email verification (resend)
  async resendOTP(email: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.SEND_OTP, { email });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Send OTP for password reset
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_OTP, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Reset password with OTP
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD_OTP, data);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    try {
      const response = await this.api.post<ApiResponse<{ token: string; refreshToken: string }>>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken }
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.LOGOUT);
      await this.clearAuthData();
      return this.handleResponse(response);
    } catch (error) {
      await this.clearAuthData();
      this.handleError(error as AxiosError);
    }
  }

  async getProfile(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.AUTH.PROFILE);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Store authentication data
  async storeAuthData(token: string, refreshToken: string, user: any): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  // Get stored user data
  async getStoredUserData(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Get stored token
  async getStoredToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Get stored refresh token
  async getStoredRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Categories API methods
  async getCategories(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.CATEGORIES);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Auctions API methods
  async getAuctions(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.AUCTIONS.LIST, { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getAuctionById(id: string): Promise<ApiResponse> {
    try {
      const url = API_ENDPOINTS.AUCTIONS.DETAILS.replace(':id', id);
      const response = await this.api.get<ApiResponse>(url);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async placeBid(auctionId: string, amount: number): Promise<ApiResponse> {
    try {
      const url = `/auctions/${auctionId}/bids`;
      const response = await this.api.post<ApiResponse>(url, { amount });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async toggleWatchlist(auctionId: string): Promise<ApiResponse> {
    try {
      const url = `/auctions/${auctionId}/watchlist`;
      const response = await this.api.post<ApiResponse>(url);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Homepage API methods
  async getHomepageContent(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>('/homepage/content');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getFeaturedAuction(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>('/homepage/featured-auction');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // User Dashboard API methods
  async getUserDashboard(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.USERS.DASHBOARD);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getUserBids(params?: { page?: number; limit?: number }): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.USERS.BIDS, { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getUserWatchlist(params?: { page?: number; limit?: number }): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.USERS.WATCHLIST, { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getUserWonAuctions(params?: { page?: number; limit?: number }): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>('/users/won-auctions', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Notifications API methods
  async getNotifications(params?: { 
    page?: number; 
    limit?: number; 
    unreadOnly?: boolean 
  }): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.USERS.NOTIFICATIONS, { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    try {
      const response = await this.api.put<ApiResponse>(`/users/notifications/${id}/read`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async markAllNotificationsRead(): Promise<ApiResponse> {
    try {
      const response = await this.api.put<ApiResponse>('/users/notifications/read-all');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete<ApiResponse>(`/users/notifications/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async registerPushToken(pushToken: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>('/mobile-auth/register-push-token', { pushToken });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Profile update method
  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    marketingEmails?: boolean;
    profilePhoto?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await this.api.put<ApiResponse>(API_ENDPOINTS.USERS.PROFILE, profileData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Payment API methods
  async getPaymentStatus(auctionId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(`/payments/status/${auctionId}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Auction bid methods
  async getAuctionBids(auctionId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(`/auctions/${auctionId}/bids`, { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getUserBidStatus(auctionId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(`/auctions/${auctionId}/user-bid`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getWatchlistStatus(auctionId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(`/auctions/${auctionId}/watchlist-status`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Settings
  async getSettings(): Promise<ApiResponse> {
    try {
      // Use the public settings endpoint that doesn't require authentication
      const response = await this.api.get<ApiResponse>('/settings');
      // console.log("settings response",response.data);
      
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }
}

// Export as singleton
export const apiService = new ApiService(); 