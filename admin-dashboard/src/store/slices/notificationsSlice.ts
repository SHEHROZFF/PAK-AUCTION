import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

interface NotificationData {
  title: string;
  message: string;
  type: 'GENERAL' | 'SYSTEM' | 'ANNOUNCEMENT';
  targetUsers: 'all' | 'specific';
  userEmails?: string[];
}

interface NotificationsState {
  loading: boolean;
  error: string | null;
  lastSentNotification: NotificationData | null;
}

const initialState: NotificationsState = {
  loading: false,
  error: null,
  lastSentNotification: null,
};

// Async thunk for sending notifications
export const sendNotificationToUsers = createAsyncThunk(
  'notifications/sendToUsers',
  async (notificationData: NotificationData, { rejectWithValue }) => {
    try {
      const response = await apiService.sendNotification(notificationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send notification');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastSentNotification: (state) => {
      state.lastSentNotification = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendNotificationToUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendNotificationToUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSentNotification = action.meta.arg;
        state.error = null;
      })
      .addCase(sendNotificationToUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLastSentNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer; 