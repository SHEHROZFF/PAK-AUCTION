import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Define types
interface PaymentSettings {
  stripe: {
    enabled: boolean;
    publishableKey: string;
  };
  general: {
    currency: string;
    paymentMode: string;
  };
}

interface WebsiteSettings {
  general: {
    websiteName: string;
    websiteUrl: string;
    adminEmail: string;
    contactPhone: string;
    websiteDescription: string;
  };
}

interface Settings {
  paymentSettings: PaymentSettings;
  websiteSettings: WebsiteSettings;
}

interface SettingsState {
  currency: string;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: SettingsState = {
  currency: 'PKR', // Default currency
  isLoading: false,
  error: null
};

// Create async thunk for fetching settings
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSettings();
      console.log("settings response",response.data.paymentSettings);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
  }
);

// Create the settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        // Extract currency from the settings response
        if (action.payload?.data?.paymentSettings?.general?.currency) {
          state.currency = action.payload.data.paymentSettings.general.currency;
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { setCurrency } = settingsSlice.actions;

// Export reducer
export default settingsSlice.reducer; 