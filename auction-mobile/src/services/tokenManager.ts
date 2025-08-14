import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/api';

/**
 * Centralized Token Manager for Race-Condition-Free Authentication
 * 
 * This service handles all token operations with proper synchronization to prevent
 * race conditions that occur when multiple API calls try to refresh tokens simultaneously.
 */
class TokenManager {
  private static instance: TokenManager;
  
  // Synchronization primitives
  private refreshPromise: Promise<string | null> | null = null;
  private isRefreshing = false;
  private tokenUpdateQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
  }> = [];

  // Token cache for immediate access (reduces AsyncStorage reads)
  private cachedAccessToken: string | null = null;
  private cachedRefreshToken: string | null = null;
  private cacheInitialized = false;

  constructor() {
    if (TokenManager.instance) {
      return TokenManager.instance;
    }
    TokenManager.instance = this;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Initialize token cache from AsyncStorage
   */
  async initializeCache(): Promise<void> {
    if (this.cacheInitialized) return;

    try {
      console.log('📦 TokenManager: Initializing cache from AsyncStorage...');
      
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      this.cachedAccessToken = accessToken;
      this.cachedRefreshToken = refreshToken;
      this.cacheInitialized = true;
      
      console.log('✅ TokenManager: Cache initialized', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });
    } catch (error) {
      console.error('❌ TokenManager: Failed to initialize cache:', error);
      this.cacheInitialized = true; // Set to true to prevent retry loops
    }
  }

  /**
   * Get access token (from cache first, then AsyncStorage)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.cacheInitialized) {
      await this.initializeCache();
    }

    // Return cached token if available
    if (this.cachedAccessToken) {
      return this.cachedAccessToken;
    }

    // Fallback to AsyncStorage
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      this.cachedAccessToken = token;
      return token;
    } catch (error) {
      console.error('❌ TokenManager: Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token (from cache first, then AsyncStorage)
   */
  async getRefreshToken(): Promise<string | null> {
    if (!this.cacheInitialized) {
      await this.initializeCache();
    }

    // Return cached token if available
    if (this.cachedRefreshToken) {
      return this.cachedRefreshToken;
    }

    // Fallback to AsyncStorage
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      this.cachedRefreshToken = token;
      return token;
    } catch (error) {
      console.error('❌ TokenManager: Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Store tokens (updates both cache and AsyncStorage atomically)
   */
  async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      console.log('💾 TokenManager: Storing tokens...', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
      });

      // Update cache immediately for fast access
      this.cachedAccessToken = accessToken;
      if (refreshToken) {
        this.cachedRefreshToken = refreshToken;
      }

      // Update AsyncStorage
      const storagePromises = [
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
      ];

      if (refreshToken) {
        storagePromises.push(
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        );
      }

      await Promise.all(storagePromises);
      
      console.log('✅ TokenManager: Tokens stored successfully');
    } catch (error) {
      console.error('❌ TokenManager: Failed to store tokens:', error);
      // Reset cache on error to maintain consistency
      this.cachedAccessToken = null;
      if (refreshToken) {
        this.cachedRefreshToken = null;
      }
      throw error;
    }
  }

  /**
   * Store user data in AsyncStorage
   */
  async storeUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('✅ TokenManager: User data stored');
    } catch (error) {
      console.error('❌ TokenManager: Failed to store user data:', error);
      throw error;
    }
  }

  /**
   * Get stored user data
   */
  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ TokenManager: Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Clear all tokens and user data
   */
  async clearAll(): Promise<void> {
    try {
      console.log('🧹 TokenManager: Clearing all tokens and data...');
      
      // Clear cache first
      this.cachedAccessToken = null;
      this.cachedRefreshToken = null;
      
      // Clear AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);

      // Reset state
      this.refreshPromise = null;
      this.isRefreshing = false;
      this.tokenUpdateQueue = [];
      
      console.log('✅ TokenManager: All data cleared');
    } catch (error) {
      console.error('❌ TokenManager: Failed to clear data:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  }

  /**
   * Race-condition-safe token refresh
   * Multiple simultaneous calls will wait for the same refresh operation
   */
  async refreshAccessToken(refreshTokenCallback: (refreshToken: string) => Promise<{
    token: string;
    refreshToken?: string;
  }>): Promise<string | null> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      console.log('⏳ TokenManager: Refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // Create a new refresh promise
    this.refreshPromise = this.performRefresh(refreshTokenCallback);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise when done (success or failure)
      this.refreshPromise = null;
    }
  }

  /**
   * Internal method to perform the actual refresh
   */
  private async performRefresh(refreshTokenCallback: (refreshToken: string) => Promise<{
    token: string;
    refreshToken?: string;
  }>): Promise<string | null> {
    try {
      this.isRefreshing = true;
      console.log('🔄 TokenManager: Starting token refresh...');

      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        console.log('❌ TokenManager: No refresh token found');
        await this.clearAll();
        return null;
      }

      console.log('🔑 TokenManager: Making refresh request...');
      const response = await refreshTokenCallback(refreshToken);

      if (response && response.token) {
        console.log('✅ TokenManager: Token refreshed successfully');
        
        // Store new tokens atomically
        await this.storeTokens(response.token, response.refreshToken);
        
        // Notify any queued requests
        this.notifyQueuedRequests(response.token);
        
        return response.token;
      } else {
        console.log('❌ TokenManager: Invalid refresh response');
        await this.clearAll();
        this.notifyQueuedRequests(null);
        return null;
      }
    } catch (error) {
      console.error('❌ TokenManager: Refresh failed:', error);
      await this.clearAll();
      this.notifyQueuedRequests(null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Notify any queued token requests
   */
  private notifyQueuedRequests(token: string | null): void {
    const queue = [...this.tokenUpdateQueue];
    this.tokenUpdateQueue = [];

    queue.forEach(({ resolve }) => {
      resolve(token);
    });
  }

  /**
   * Add a request to the queue (for when refresh is in progress)
   */
  waitForRefresh(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.isRefreshing) {
        // If not refreshing, resolve immediately with current token
        this.getAccessToken().then(resolve).catch(reject);
        return;
      }

      // Add to queue
      this.tokenUpdateQueue.push({ resolve, reject });
    });
  }

  /**
   * Get debug information about the token manager state
   */
  getDebugInfo(): {
    isRefreshing: boolean;
    hasRefreshPromise: boolean;
    queueLength: number;
    cacheInitialized: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
  } {
    return {
      isRefreshing: this.isRefreshing,
      hasRefreshPromise: !!this.refreshPromise,
      queueLength: this.tokenUpdateQueue.length,
      cacheInitialized: this.cacheInitialized,
      hasAccessToken: !!this.cachedAccessToken,
      hasRefreshToken: !!this.cachedRefreshToken,
    };
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
export default tokenManager;