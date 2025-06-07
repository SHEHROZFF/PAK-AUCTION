import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';

interface DashboardStats {
  totalProducts: number;
  activeAuctions: number;
  totalRevenue: number;
  totalBids: number;
  newUsersThisMonth: number;
  revenueGrowth: number;
}

interface RevenueData {
  labels: string[];
  data: number[];
}

interface CategoryStats {
  labels: string[];
  data: number[];
}

interface RecentActivity {
  id: string;
  type: 'product_added' | 'auction_ended' | 'bid_placed' | 'user_registered';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  iconBg: string;
}

interface EndingSoonAuction {
  id: string;
  title: string;
  currentBid: number;
  reservePrice: number;
  bidCount: number;
  timeLeft: string;
  image: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  revenueData: RevenueData | null;
  categoryStats: CategoryStats | null;
  recentActivity: RecentActivity[];
  endingSoonAuctions: EndingSoonAuction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  revenueData: null,
  categoryStats: null,
  recentActivity: [],
  endingSoonAuctions: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getDashboardStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRevenueData = createAsyncThunk(
  'dashboard/fetchRevenue',
  async (period: string = '6months', { rejectWithValue }) => {
    try {
      const response = await apiService.getRevenueData(period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch revenue data');
    }
  }
);

export const fetchCategoryStats = createAsyncThunk(
  'dashboard/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategoryStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch category stats');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchActivity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getRecentActivity();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent activity');
    }
  }
);

export const fetchEndingSoonAuctions = createAsyncThunk(
  'dashboard/fetchEndingSoon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getEndingSoonAuctions();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch ending soon auctions');
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
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Revenue Data
      .addCase(fetchRevenueData.fulfilled, (state, action: PayloadAction<RevenueData>) => {
        state.revenueData = action.payload;
      })
      // Category Stats
      .addCase(fetchCategoryStats.fulfilled, (state, action: PayloadAction<CategoryStats>) => {
        state.categoryStats = action.payload;
      })
      // Recent Activity
      .addCase(fetchRecentActivity.fulfilled, (state, action: PayloadAction<RecentActivity[]>) => {
        state.recentActivity = action.payload;
      })
      // Ending Soon Auctions
      .addCase(fetchEndingSoonAuctions.fulfilled, (state, action: PayloadAction<EndingSoonAuction[]>) => {
        state.endingSoonAuctions = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 