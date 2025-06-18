import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AuctionImage {
  _id: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  order: number;
  isMain: boolean;
}

export interface Category {
  id: string;
  _id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  auctionCount: number;
}

export interface Seller {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface Auction {
  id: string;
  _id: string;
  title: string;
  description: string;
  brand?: string;
  condition: string;
  basePrice: number;
  currentBid?: number;
  bidIncrement: number;
  entryFee: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'SOLD' | 'CANCELLED';
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  seller: Seller;
  category: Category;
  images: AuctionImage[];
  _count: {
    bids: number;
    watchlist: number;
  };
  createdAt: string;
  updatedAt: string;
  isWatched?: boolean;
  userHasPaid?: boolean;
}

export interface FeaturedAuction {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  basePrice: number;
  timeRemaining: string;
  timeRemainingMs: number;
  status: string;
  images: Array<{ url: string; isPrimary: boolean }>;
  seller: string;
  category: string;
  endTime: string;
  isActive: boolean;
}

interface AuctionsState {
  auctions: Auction[];
  featuredAuctions: FeaturedAuction[];
  currentAuction: Auction | null;
  loading: boolean;
  featuredLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

const initialState: AuctionsState = {
  auctions: [],
  featuredAuctions: [],
  currentAuction: null,
  loading: false,
  featuredLoading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const fetchAuctions = createAsyncThunk(
  'auctions/fetchAuctions',
  async (params: {
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
  } = {}, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getAuctions(params);
      
      // Backend returns { success: true, data: { auctions: [...], pagination: {...} } }
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch auctions');
    }
  }
);

export const fetchAuctionById = createAsyncThunk(
  'auctions/fetchAuctionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getAuctionById(id);
      
      // Backend returns { success: true, data: { auction: {...} } }
      if (response.success && response.data?.auction) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch auction');
    }
  }
);

export const fetchFeaturedAuctions = createAsyncThunk(
  'auctions/fetchFeaturedAuctions',
  async (_, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      // Get featured auctions from the auctions API with isFeatured=true
      const response = await apiService.getAuctions({ 
        isFeatured: true, 
        status: 'ACTIVE',
        limit: 8,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      // Backend returns { success: true, data: { auctions: [...], pagination: {...} } }
      if (response.success && response.data?.auctions) {
        // Convert auctions to FeaturedAuction format
        const featuredAuctions = response.data.auctions.map((auction: any) => {
          // Safely construct seller name
          let sellerName = 'Unknown';
          if (auction.seller && auction.seller.firstName && auction.seller.lastName) {
            sellerName = `${auction.seller.firstName} ${auction.seller.lastName}`;
          } else if (auction.seller && auction.seller.username) {
            sellerName = auction.seller.username;
          }

          return {
            id: auction._id || auction.id,
            title: auction.title,
            description: auction.description,
            currentBid: auction.currentBid || auction.basePrice,
            basePrice: auction.basePrice,
            timeRemaining: 'N/A', // Will be calculated on frontend
            timeRemainingMs: 0,
            status: auction.status,
            images: auction.images || [],
            seller: sellerName,
            category: auction.category?.name || 'General',
            endTime: auction.endTime,
            isActive: auction.status === 'ACTIVE'
          };
        });
        
        console.log('✅ Featured auctions loaded:', featuredAuctions.length);
        return featuredAuctions;
      } else {
        console.log('⚠️ No featured auctions found');
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching featured auctions:', error);
      return rejectWithValue(error.message || 'Failed to fetch featured auctions');
    }
  }
);

export const placeBid = createAsyncThunk(
  'auctions/placeBid',
  async ({ auctionId, amount }: { auctionId: string; amount: number }, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.placeBid(auctionId, amount);
      
      if (response.success) {
        return { auctionId, ...response.data };
      } else {
        throw new Error(response.message || 'Failed to place bid');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to place bid');
    }
  }
);

export const toggleWatchlist = createAsyncThunk(
  'auctions/toggleWatchlist',
  async (auctionId: string, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.toggleWatchlist(auctionId);
      
      if (response.success) {
        return { auctionId, ...response.data };
      } else {
        throw new Error(response.message || 'Failed to toggle watchlist');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle watchlist');
    }
  }
);

const auctionsSlice = createSlice({
  name: 'auctions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    updateAuctionWatchStatus: (state, action: PayloadAction<{ auctionId: string; isWatched: boolean }>) => {
      const { auctionId, isWatched } = action.payload;
      
      // Update in auctions list
      const auctionIndex = state.auctions.findIndex(auction => auction.id === auctionId);
      if (auctionIndex !== -1) {
        state.auctions[auctionIndex].isWatched = isWatched;
      }
      
      // Update current auction if it matches
      if (state.currentAuction && state.currentAuction.id === auctionId) {
        state.currentAuction.isWatched = isWatched;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch auctions
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload.auctions || [];
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch auction by ID
      .addCase(fetchAuctionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload.auction;
        state.error = null;
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch featured auctions
      .addCase(fetchFeaturedAuctions.pending, (state) => {
        state.featuredLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedAuctions.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredAuctions = action.payload || [];
        state.error = null;
      })
      .addCase(fetchFeaturedAuctions.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload as string;
      })
      
      // Toggle watchlist
      .addCase(toggleWatchlist.fulfilled, (state, action) => {
        const { auctionId, isWatched } = action.payload;
        
        // Update in auctions list
        const auctionIndex = state.auctions.findIndex(auction => auction.id === auctionId);
        if (auctionIndex !== -1) {
          state.auctions[auctionIndex].isWatched = isWatched;
        }
        
        // Update current auction if it matches
        if (state.currentAuction && state.currentAuction.id === auctionId) {
          state.currentAuction.isWatched = isWatched;
        }
      });
  },
});

export const { clearError, clearCurrentAuction, updateAuctionWatchStatus } = auctionsSlice.actions;
export default auctionsSlice.reducer; 