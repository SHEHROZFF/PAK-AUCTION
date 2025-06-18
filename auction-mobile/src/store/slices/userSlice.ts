import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Auction } from './auctionsSlice';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  dateOfBirth: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePhoto?: string;
  marketingEmails?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserBid {
  id: string;
  _id: string;
  amount: number;
  createdAt: string;
  auction: Auction;
}

export interface UserWatchlistItem {
  id: string;
  _id: string;
  createdAt: string;
  auction: Auction;
}

export interface UserWonAuction {
  id: string;
  _id: string;
  title: string;
  description: string;
  basePrice: number;
  currentBid: number;
  winningBid: number;
  endTime: string;
  status: string;
  category: any;
  seller: any;
  images: any[];
  _count: {
    bids: number;
    watchlist: number;
  };
}

interface UserState {
  profile: UserProfile | null;
  bids: UserBid[];
  watchlist: UserWatchlistItem[];
  wonAuctions: UserWonAuction[];
  loading: boolean;
  bidsLoading: boolean;
  watchlistLoading: boolean;
  wonAuctionsLoading: boolean;
  error: string | null;
  bidsPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  } | null;
  watchlistPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  } | null;
  wonAuctionsPagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  } | null;
}

const initialState: UserState = {
  profile: null,
  bids: [],
  watchlist: [],
  wonAuctions: [],
  loading: false,
  bidsLoading: false,
  watchlistLoading: false,
  wonAuctionsLoading: false,
  error: null,
  bidsPagination: null,
  watchlistPagination: null,
  wonAuctionsPagination: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getProfile();
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const fetchUserBids = createAsyncThunk(
  'user/fetchUserBids',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getUserBids(params);
      
      // Backend returns { success: true, data: { bids: [...], pagination: {...} } }
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user bids');
    }
  }
);

export const fetchUserWatchlist = createAsyncThunk(
  'user/fetchUserWatchlist',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getUserWatchlist(params);
      
      // Backend returns { success: true, data: { watchlist: [...], pagination: {...} } }
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user watchlist');
    }
  }
);

export const fetchUserWonAuctions = createAsyncThunk(
  'user/fetchUserWonAuctions',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getUserWonAuctions(params);
      
      // Backend returns { success: true, data: { wonAuctions: [...], pagination: {...} } }
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user won auctions');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    marketingEmails?: boolean;
    profilePhoto?: string;
  }, { rejectWithValue, dispatch }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.updateProfile(profileData);
      
      // Backend returns { success: true, data: { user: {...} } }
      if (response.success && response.data?.user) {
        // Also update the auth slice with the new user data
        const { updateUser } = await import('./authSlice');
        dispatch(updateUser(response.data.user));
        
        return response.data.user;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user bids
      .addCase(fetchUserBids.pending, (state) => {
        state.bidsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBids.fulfilled, (state, action) => {
        state.bidsLoading = false;
        state.bids = action.payload.bids || [];
        state.bidsPagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchUserBids.rejected, (state, action) => {
        state.bidsLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user watchlist
      .addCase(fetchUserWatchlist.pending, (state) => {
        state.watchlistLoading = true;
        state.error = null;
      })
      .addCase(fetchUserWatchlist.fulfilled, (state, action) => {
        state.watchlistLoading = false;
        state.watchlist = action.payload.watchlist || [];
        state.watchlistPagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchUserWatchlist.rejected, (state, action) => {
        state.watchlistLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user won auctions
      .addCase(fetchUserWonAuctions.pending, (state) => {
        state.wonAuctionsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserWonAuctions.fulfilled, (state, action) => {
        state.wonAuctionsLoading = false;
        state.wonAuctions = action.payload.wonAuctions || [];
        state.wonAuctionsPagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchUserWonAuctions.rejected, (state, action) => {
        state.wonAuctionsLoading = false;
        state.error = action.payload as string;
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateProfile } = userSlice.actions;
export default userSlice.reducer; 