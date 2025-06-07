import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  totalBids: number;
  totalAuctions: number;
}

interface UsersState {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  search: string;
  status: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  search: '',
  status: '',
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, limit, search, status }: { page: number; limit: number; search: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsers(page, limit, search, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUser(id, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
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
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload.user || action.payload;
        const index = state.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.totalUsers -= 1;
      });
  },
});

export const { setSearch, setStatus, setPage, clearError } = usersSlice.actions;
export default usersSlice.reducer; 