import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';

interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  reservePrice: number;
  currentBid: number;
  startTime: string;
  endTime: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'SOLD';
  categoryId: string;
  category: { name: string };
  sellerId: string;
  seller: { firstName: string; lastName: string };
  bidCount: number;
  viewCount: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuctionsState {
  auctions: Auction[];
  totalAuctions: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  search: string;
  category: string;
  status: string;
  isLoading: boolean;
  error: string | null;
  selectedAuction: Auction | null;
}

const initialState: AuctionsState = {
  auctions: [],
  totalAuctions: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  search: '',
  category: '',
  status: '',
  isLoading: false,
  error: null,
  selectedAuction: null,
};

// Async thunks
export const fetchAuctions = createAsyncThunk(
  'auctions/fetchAuctions',
  async ({ page, limit, search, category, status }: { page: number; limit: number; search: string; category: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getAuctions(page, limit, search, category, status);
      // API returns { success: true, data: { auctions, pagination } }
      return {
        auctions: response.data.auctions,
        total: response.data.pagination.totalCount,
        totalPages: response.data.pagination.totalPages,
        page: response.data.pagination.currentPage
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch auctions');
    }
  }
);

export const fetchAuctionById = createAsyncThunk(
  'auctions/fetchAuctionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getAuctionById(id);
      // API returns { success: true, data: { auction } }
      return response.data.auction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch auction');
    }
  }
);

export const createAuction = createAsyncThunk(
  'auctions/createAuction',
  async (auctionData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createAuction(auctionData);
      // API returns { success: true, data: { auction } } 
      return response.data.auction || response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create auction');
    }
  }
);

export const updateAuction = createAsyncThunk(
  'auctions/updateAuction',
  async ({ id, auctionData }: { id: string; auctionData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateAuction(id, auctionData);
      // API returns { success: true, data: { auction } }
      return response.data.auction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update auction');
    }
  }
);

export const deleteAuction = createAsyncThunk(
  'auctions/deleteAuction',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteAuction(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete auction');
    }
  }
);

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
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
    clearSelectedAuction: (state) => {
      state.selectedAuction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Auctions
      .addCase(fetchAuctions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auctions = action.payload.auctions;
        state.totalAuctions = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Auction by ID
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.selectedAuction = action.payload;
      })
      // Create Auction
      .addCase(createAuction.fulfilled, (state, action) => {
        state.auctions.unshift(action.payload);
        state.totalAuctions += 1;
      })
      // Update Auction
      .addCase(updateAuction.fulfilled, (state, action) => {
        const index = state.auctions.findIndex(auction => auction.id === action.payload.id);
        if (index !== -1) {
          state.auctions[index] = action.payload;
        }
        if (state.selectedAuction?.id === action.payload.id) {
          state.selectedAuction = action.payload;
        }
      })
      // Delete Auction
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.auctions = state.auctions.filter(auction => auction.id !== action.payload);
        state.totalAuctions -= 1;
        if (state.selectedAuction?.id === action.payload) {
          state.selectedAuction = null;
        }
      });
  },
});

export const { setSearch, setCategory, setStatus, setPage, clearError, clearSelectedAuction } = auctionsSlice.actions;
export default auctionsSlice.reducer; 