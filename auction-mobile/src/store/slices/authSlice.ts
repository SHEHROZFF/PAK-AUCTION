import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  AuthState, 
  LoginRequest, 
  RegisterRequest, 
  VerifyOTPRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  User 
} from '../../types/auth';
import { apiService } from '../../services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false, // For individual operations (login, register, forgot password, etc.)
  isAppLoading: false, // For initial app loading (loadStoredAuth)
  isAuthenticated: false,
  error: null,
  verificationSent: false,
  passwordResetSent: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success && response.data) {
        // After successful login, fetch complete profile data
        const profileResponse = await apiService.getProfile();
        
        if (profileResponse.success && profileResponse.data?.user) {
          // Store complete user data including profile fields
          await apiService.storeAuthData(
            response.data.token,
            response.data.refreshToken,
            profileResponse.data.user // Use complete profile data instead of login response user data
          );
          
          return {
            user: profileResponse.data.user, // Return complete user data
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          };
        } else {
          // Fallback to login response data if profile fetch fails
          await apiService.storeAuthData(
            response.data.token,
            response.data.refreshToken,
            response.data.user
          );
          
          return response.data;
        }
      }
      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (data: VerifyOTPRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyEmail(data);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Email verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Email verification failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: VerifyOTPRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyOTP(data);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'OTP verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

export const verifyPasswordResetOTP = createAsyncThunk(
  'auth/verifyPasswordResetOTP',
  async (data: VerifyOTPRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyPasswordResetOTP(data);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Password reset code verification failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset code verification failed');
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiService.resendOTP(email);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Failed to resend OTP');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to resend OTP');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: ForgotPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.forgotPassword(data);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Password reset request failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.resetPassword(data);
      if (response.success) {
        return response;
      }
      throw new Error(response.message || 'Password reset failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.logout();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const [token, refreshToken] = await Promise.all([
        apiService.getStoredToken(),
        apiService.getStoredRefreshToken(),
      ]);

      if (token) {
        // Always fetch fresh profile data to ensure we have complete user information
        try {
          const profileResponse = await apiService.getProfile();
          if (profileResponse.success && profileResponse.data?.user) {
            // Store the complete user data with existing tokens
            await apiService.storeAuthData(
              token,
              refreshToken || '', // Use empty string if no refresh token
              profileResponse.data.user
            );
            
            return {
              token,
              refreshToken,
              user: profileResponse.data.user,
            };
          }
        } catch (error) {
          // Token is invalid, clear stored data
          await apiService.logout();
          throw new Error('Token expired');
        }
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load stored authentication');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVerificationSent: (state) => {
      state.verificationSent = false;
    },
    clearPasswordResetSent: (state) => {
      state.passwordResetSent = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.verificationSent = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.verificationSent = action.payload.verificationRequired || false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.verificationSent = false;
      });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.verificationSent = false;
        state.error = null;
        // Update user's email verification status
        if (state.user) {
          state.user.isEmailVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.verificationSent = false;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify Password Reset OTP
    builder
      .addCase(verifyPasswordResetOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPasswordResetOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyPasswordResetOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = true;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.passwordResetSent = false;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return initialState;
      })
      .addCase(logoutUser.rejected, (state) => {
        return initialState;
      });

    // Load Stored Auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isAppLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isAppLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken || null;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isAppLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });
  },
});

export const { 
  clearError, 
  clearVerificationSent, 
  clearPasswordResetSent, 
  updateUser 
} = authSlice.actions;

export default authSlice.reducer; 