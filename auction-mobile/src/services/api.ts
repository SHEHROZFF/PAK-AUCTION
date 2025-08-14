import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT } from '../constants/api';
import tokenManager from './tokenManager';
import authEventBus from './authEventBus';
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

/**
 * Enhanced API Service with Race-Condition-Free Token Management
 * 
 * This service integrates with the new TokenManager to provide seamless
 * authentication and automatic token refresh without race conditions.
 */
class ApiService {
  private api: AxiosInstance;
  private isAuthFailureHandled = false;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token to requests
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await tokenManager.getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('❌ API: Failed to add auth token:', error);
          return config;
        }
      },
      (error) => {
        console.error('❌ API: Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Don't try to refresh for refresh token requests or if already retried
        if (this.isRefreshTokenRequest(originalRequest) || originalRequest._isRetry) {
          return Promise.reject(error);
        }

        // Handle 401 errors with token refresh
        if (error.response?.status === 401) {
          return this.handleUnauthorizedError(originalRequest, error);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if the request is a refresh token request
   */
  private isRefreshTokenRequest(config: any): boolean {
    return config?.url?.includes('/refresh-token');
  }

  /**
   * Handle 401 unauthorized errors with automatic token refresh
   */
  private async handleUnauthorizedError(originalRequest: any, error: AxiosError): Promise<any> {
    try {
      console.log('🔄 API: 401 detected, attempting token refresh...');
      
      // Mark request as retry to prevent infinite loops
      originalRequest._isRetry = true;

      // Use the TokenManager to handle refresh (race-condition safe)
      const newToken = await tokenManager.refreshAccessToken(async (refreshToken) => {
        return this.makeRefreshRequest(refreshToken);
      });

      if (newToken) {
        console.log('✅ API: Token refreshed, retrying original request');
        
        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Retry the original request
        return this.api(originalRequest);
      } else {
        console.log('❌ API: Token refresh failed, user needs to re-authenticate');
        
        // Clear all auth data
        await tokenManager.clearAll();
        
        // You can emit an event here or call a logout callback
        this.handleAuthenticationFailure();
        
        return Promise.reject(error);
      }
    } catch (refreshError) {
      console.error('❌ API: Token refresh error:', refreshError);
      
      // Clear all auth data on refresh failure
      await tokenManager.clearAll();
      this.handleAuthenticationFailure();
      
      return Promise.reject(error);
    }
  }

  /**
   * Make the actual refresh token request
   */
  private async makeRefreshRequest(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    try {
      console.log('🔑 API: Making refresh token request...');
      
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        { refreshToken },
        {
          timeout: REQUEST_TIMEOUT,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data?.success && response.data?.data) {
        const { token, refreshToken: newRefreshToken } = response.data.data;
        console.log('✅ API: Refresh token request successful');
        
        return {
          token,
          refreshToken: newRefreshToken
        };
      } else {
        throw new Error('Invalid refresh response format');
      }
    } catch (error) {
      console.error('❌ API: Refresh token request failed:', error);
      throw error;
    }
  }

  /**
   * Handle authentication failure - emits auth failure event (once only)
   */
  private handleAuthenticationFailure(): void {
    // Prevent multiple AUTH_FAILURE events
    if (this.isAuthFailureHandled) {
      console.log('🚪 API: Authentication failure already handled, skipping...');
      return;
    }
    
    console.log('🚪 API: Authentication failed, emitting AUTH_FAILURE event...');
    this.isAuthFailureHandled = true;
    
    // Emit authentication failure event (will be handled by App component)
    authEventBus.emit('AUTH_FAILURE');
  }

  /**
   * Reset authentication failure flag (used after successful login)
   */
  resetAuthFailureFlag(): void {
    console.log('🔄 API: Resetting auth failure flag');
    this.isAuthFailureHandled = false;
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  // Helper method to handle API errors
  private handleError(error: AxiosError): never {
    console.log('❌ API Error:', error.response?.data || error.message);
    
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

  // =============================================================================
  // AUTH API METHODS
  // =============================================================================

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.api.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN, 
        credentials
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await this.api.post<ApiResponse<RegisterResponse>>(
        API_ENDPOINTS.AUTH.REGISTER, 
        userData
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async verifyEmail(data: VerifyOTPRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.VERIFY_OTP, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async sendOTP(data: { phone: string }): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.SEND_OTP, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async resendOTP(email: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        '/auth/resend-verification', 
        { email }
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async forgotPasswordOTP(data: { phone: string }): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD_OTP, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async verifyPasswordResetOTP(data: VerifyOTPRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET_OTP, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async resetPasswordOTP(data: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD_OTP, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD, 
        data
      );
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.api.post<ApiResponse>(API_ENDPOINTS.AUTH.LOGOUT);
      await tokenManager.clearAll();
      return this.handleResponse(response);
    } catch (error) {
      await tokenManager.clearAll();
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

  // =============================================================================
  // TOKEN MANAGEMENT METHODS (using TokenManager)
  // =============================================================================

  /**
   * Store authentication data using TokenManager
   */
  async storeAuthData(token: string, refreshToken: string, user: any): Promise<void> {
    try {
      await Promise.all([
        tokenManager.storeTokens(token, refreshToken),
        tokenManager.storeUserData(user)
      ]);
      console.log('✅ API: Auth data stored successfully');
    } catch (error) {
      console.error('❌ API: Failed to store auth data:', error);
      throw error;
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUserData(): Promise<any | null> {
    try {
      return await tokenManager.getUserData();
    } catch (error) {
      console.error('❌ API: Failed to get stored user data:', error);
      return null;
    }
  }

  /**
   * Get stored access token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await tokenManager.getAccessToken();
    } catch (error) {
      console.error('❌ API: Failed to get stored token:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await tokenManager.getRefreshToken();
    } catch (error) {
      console.error('❌ API: Failed to get stored refresh token:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  async clearAuthData(): Promise<void> {
    try {
      await tokenManager.clearAll();
      console.log('✅ API: Auth data cleared successfully');
    } catch (error) {
      console.error('❌ API: Failed to clear auth data:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      return await tokenManager.isAuthenticated();
    } catch (error) {
      console.error('❌ API: Failed to check authentication:', error);
      return false;
    }
  }

  // =============================================================================
  // OTHER API METHODS (Categories, Auctions, etc.)
  // =============================================================================

  async getCategories(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.CATEGORIES);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

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

  async getUserBid(auctionId: string): Promise<ApiResponse> {
    try {
      const url = `/auctions/${auctionId}/user-bid`;
      const response = await this.api.get<ApiResponse>(url);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getWatchlistStatus(auctionId: string): Promise<ApiResponse> {
    try {
      const url = `/auctions/${auctionId}/watchlist-status`;
      const response = await this.api.get<ApiResponse>(url);
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

  async getUserDashboard(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.USERS.DASHBOARD);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getUserBids(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.USERS.BIDS);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getUserWatchlist(): Promise<ApiResponse> {
    try {
      const response = await this.api.get<ApiResponse>(API_ENDPOINTS.USERS.WATCHLIST);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }



  async getAuctionBids(auctionId: string): Promise<ApiResponse> {
    try {
      const url = `/auctions/${auctionId}/bids`;
      const response = await this.api.get<ApiResponse>(url);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getPaymentStatus(auctionId: string): Promise<ApiResponse> {
    try {
      const url = `/payments/status/${auctionId}`;
      const response = await this.api.get<ApiResponse>(url);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  /**
   * Get debug information about the API service and token manager
   */
  getDebugInfo(): any {
    return {
      apiBaseURL: API_BASE_URL,
      tokenManager: tokenManager.getDebugInfo()
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;