import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';

interface PaymentSettings {
  stripe: {
    enabled: boolean;
    apiKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  general: {
    currency: string;
    paymentMode: string;
    auctionDepositPercent: number;
    invoicePrefix: string;
    enableReceiptEmails: boolean;
    requireVerificationHighValue: boolean;
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
  logo: {
    logoUrl: string;
    faviconUrl: string;
  };
  auction: {
    defaultDurationDays: number;
    minimumBidIncrementPercent: number;
    autoExtendTimeMinutes: number;
    featuredAuctionFee: number;
    enableAutoExtend: boolean;
    allowReservePrices: boolean;
    enableBuyNow: boolean;
  };
}

interface SettingsState {
  paymentSettings: PaymentSettings | null;
  websiteSettings: WebsiteSettings | null;
  isLoading: boolean;
  error: string | null;
  lastSaved: string | null;
}

const initialState: SettingsState = {
  paymentSettings: null,
  websiteSettings: null,
  isLoading: false,
  error: null,
  lastSaved: null,
};

// Async thunks
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSettings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
  }
);

export const updatePaymentSettings = createAsyncThunk(
  'settings/updatePaymentSettings',
  async (paymentSettings: PaymentSettings, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePaymentSettings(paymentSettings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update payment settings');
    }
  }
);

export const updateWebsiteSettings = createAsyncThunk(
  'settings/updateWebsiteSettings',
  async (websiteSettings: WebsiteSettings, { rejectWithValue }) => {
    try {
      const response = await apiService.updateWebsiteSettings(websiteSettings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update website settings');
    }
  }
);

export const updateAllSettings = createAsyncThunk(
  'settings/updateAllSettings',
  async ({ paymentSettings, websiteSettings }: { paymentSettings?: PaymentSettings; websiteSettings?: WebsiteSettings }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateAllSettings({ paymentSettings, websiteSettings });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update settings');
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.resetSettings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset settings');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePaymentSettingsLocal: (state, action: PayloadAction<Partial<PaymentSettings>>) => {
      if (state.paymentSettings) {
        state.paymentSettings = { ...state.paymentSettings, ...action.payload };
      }
    },
    updateWebsiteSettingsLocal: (state, action: PayloadAction<Partial<WebsiteSettings>>) => {
      if (state.websiteSettings) {
        state.websiteSettings = { ...state.websiteSettings, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentSettings = action.payload.paymentSettings;
        state.websiteSettings = action.payload.websiteSettings;
        state.lastSaved = action.payload.lastUpdated;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Payment Settings
      .addCase(updatePaymentSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentSettings = action.payload.paymentSettings;
        state.lastSaved = action.payload.lastUpdated;
      })
      .addCase(updatePaymentSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Website Settings
      .addCase(updateWebsiteSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWebsiteSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.websiteSettings = action.payload.websiteSettings;
        state.lastSaved = action.payload.lastUpdated;
      })
      .addCase(updateWebsiteSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update All Settings
      .addCase(updateAllSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAllSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentSettings = action.payload.paymentSettings;
        state.websiteSettings = action.payload.websiteSettings;
        state.lastSaved = action.payload.lastUpdated;
      })
      .addCase(updateAllSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Reset Settings
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.paymentSettings = action.payload.paymentSettings;
        state.websiteSettings = action.payload.websiteSettings;
        state.lastSaved = action.payload.lastUpdated;
      });
  },
});

export const { clearError, updatePaymentSettingsLocal, updateWebsiteSettingsLocal } = settingsSlice.actions;
export default settingsSlice.reducer; 