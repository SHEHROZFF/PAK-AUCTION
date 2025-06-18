import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: string;
  _id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  isActive: boolean;
  auctionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

// Async thunk for fetching categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getCategories();
      
      // Backend returns { success: true, data: { categories: [...] } }
      if (response.success && response.data?.categories) {
        return response.data.categories;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer; 