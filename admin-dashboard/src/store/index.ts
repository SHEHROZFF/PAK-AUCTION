import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import dashboardSlice from './slices/dashboardSlice';
import usersSlice from './slices/usersSlice';
import auctionsSlice from './slices/auctionsSlice';
import bidsSlice from './slices/bidsSlice';
import categoriesSlice from './slices/categoriesSlice';
import settingsSlice from './slices/settingsSlice';
import notificationsSlice from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    dashboard: dashboardSlice,
    users: usersSlice,
    auctions: auctionsSlice,
    bids: bidsSlice,
    categories: categoriesSlice,
    settings: settingsSlice,
    notifications: notificationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 