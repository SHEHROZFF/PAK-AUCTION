import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';

interface Bid {
  id: string;
  amount: number;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'OUTBID' | 'CANCELLED';
  auctionId: string;
  auction: {
    title: string;
    status: string;
    endTime: string;
  };
  bidderId: string;
  bidder: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface BidsState {
  bids: Bid[];
  totalBids: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  search: string;
  status: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: BidsState = {
  bids: [],
  totalBids: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  search: '',
  status: '',
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchBids = createAsyncThunk(
  'bids/fetchBids',
  async ({ page, limit, search, status }: { page: number; limit: number; search: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getAllBids(page, limit, search, status);
      // API returns { success: true, data: { bids, total, page, totalPages } }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch bids');
    }
  }
);

export const deleteBid = createAsyncThunk(
  'bids/deleteBid',
  async (bidId: string, { rejectWithValue }) => {
    try {
      await apiService.deleteBid(bidId);
      return bidId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete bid');
    }
  }
);

export const fetchAuctionBids = createAsyncThunk(
  'bids/fetchAuctionBids',
  async (auctionId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getAuctionBids(auctionId);
      // API returns { success: true, data: { bids } } or similar
      return response.data.bids || response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch auction bids');
    }
  }
);

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bids
      .addCase(fetchBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = action.payload.bids;
        state.totalBids = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Bid
      .addCase(deleteBid.fulfilled, (state, action) => {
        state.bids = state.bids.filter(bid => bid.id !== action.payload);
        state.totalBids -= 1;
      })
      // Fetch Auction Bids
      .addCase(fetchAuctionBids.fulfilled, (state, action) => {
        // This could be used to update a specific auction's bids
        // For now, we'll just store them in the main bids array
        state.bids = action.payload;
      });
  },
});

export const { setSearch, setStatus, setPage, clearError } = bidsSlice.actions;
export default bidsSlice.reducer; 