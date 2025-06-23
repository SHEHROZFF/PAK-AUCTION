import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { store } from './src/store';
import { useAppDispatch, useAppSelector } from './src/store';
import { loadStoredAuth } from './src/store/slices/authSlice';
import { fetchSettings } from './src/store/slices/settingsSlice';
import { pushNotificationService } from './src/services/pushNotificationService';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const ErrorScreen: React.FC<{ error?: string }> = ({ error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorText}>Please restart the app</Text>
    {error && <Text style={styles.errorDetails}>{error}</Text>}
  </View>
);

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAppLoading, error } = useAppSelector((state) => state.auth);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    // Load stored authentication data and settings on app start
    const loadInitialData = async () => {
      try {
        // Load settings first
        await dispatch(fetchSettings());
        setIsSettingsLoaded(true);
        
        // Then load auth data
        await dispatch(loadStoredAuth());
      } catch (error) {
        console.log('Initial data loading failed:', error);
        setIsSettingsLoaded(true); // Continue with app even if settings fail
      }
    };
    
    loadInitialData();
  }, [dispatch]);

  // Initialize push notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔔 Initializing push notifications...');
      pushNotificationService.initialize().then((token) => {
        if (token) {
          console.log('✅ Push notifications initialized with token:', token);
        }
      }).catch((error) => {
        console.error('❌ Failed to initialize push notifications:', error);
      });
      
      // Setup notification listeners
      const listeners = pushNotificationService.setupNotificationListeners();
      
      // Cleanup listeners on unmount
      return () => {
        listeners.notificationListener.remove();
        listeners.responseListener.remove();
      };
    }
  }, [isAuthenticated]);

  // Show error screen if there's a critical error
  if (error && !isAppLoading) {
    return <ErrorScreen error={error} />;
  }

  // Show loading screen
  if (isAppLoading || !isSettingsLoaded) {
    return <LoadingScreen />;
  }

  try {
    return (
      <>
        <StatusBar style="light" />
        <NavigationContainer>
          {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
        <Toast />
      </>
    );
  } catch (error) {
    console.error('Navigation error:', error);
    return <ErrorScreen error="Navigation failed" />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: '#999999',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
