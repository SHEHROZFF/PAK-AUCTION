import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';

interface Category {
  _id: string;
  id?: string; // Optional for backward compatibility
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  auctionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesState {
  categories: Category[];
  totalCategories: number;
  isLoading: boolean;
  error: string | null;
  selectedCategory: Category | null;
}

const initialState: CategoriesState = {
  categories: [],
  totalCategories: 0,
  isLoading: false,
  error: null,
  selectedCategory: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategories();
      return response.data.categories;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategoryById(id);
      return response.data.category;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createCategory(categoryData);
      return response.data.category;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }: { id: string; categoryData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateCategory(id, categoryData);
      return response.data.category;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update category';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteCategory(id);
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete category';
      return rejectWithValue(errorMessage);
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
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.totalCategories = action.payload.length;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Category by ID
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.selectedCategory = action.payload;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories.unshift(action.payload);
        state.totalCategories += 1;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        const index = state.categories.findIndex(category => category._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.selectedCategory?._id === action.payload._id) {
          state.selectedCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter(category => category._id !== action.payload);
        state.totalCategories -= 1;
        if (state.selectedCategory?._id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer; 