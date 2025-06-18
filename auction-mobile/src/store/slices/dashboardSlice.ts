import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Auction } from './auctionsSlice';

export interface DashboardStats {
  activeAuctions: number;
  totalBids: number;
  watchlistItems: number;
  wonAuctions: number;
}

export interface RecentBid {
  id: string;
  _id: string;
  amount: number;
  createdAt: string;
  auction: Auction;
}

interface DashboardState {
  stats: DashboardStats | null;
  recentAuctions: Auction[];
  recentBids: RecentBid[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  recentAuctions: [],
  recentBids: [],
  loading: false,
  error: null,
};

// Async thunk for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getUserDashboard();
      
      // Backend returns { success: true, data: { stats: {...}, recentAuctions: [...], recentBids: [...] } }
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats || null;
        state.recentAuctions = action.payload.recentAuctions || [];
        state.recentBids = action.payload.recentBids || [];
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 