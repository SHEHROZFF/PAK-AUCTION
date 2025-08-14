import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, loadStoredAuth, logoutUser } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';
import tokenManager from '../services/tokenManager';
import { apiService } from '../services/api';
import authEventBus from '../services/authEventBus';

const DebugAuthScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, refreshToken, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleLogin = async () => {
    try {
      console.log('🔍 Debug: Starting login test...');
      const result = await dispatch(loginUser({ email, password }));
      console.log('🔍 Debug: Login result:', result);
      
      // Get debug info after login attempt
      await updateDebugInfo();
    } catch (error) {
      console.error('🔍 Debug: Login error:', error);
      Alert.alert('Login Error', JSON.stringify(error));
    }
  };

  const handleLoadStored = async () => {
    try {
      console.log('🔍 Debug: Loading stored auth...');
      const result = await dispatch(loadStoredAuth());
      console.log('🔍 Debug: Load stored result:', result);
      
      await updateDebugInfo();
    } catch (error) {
      console.error('🔍 Debug: Load stored error:', error);
      Alert.alert('Load Error', JSON.stringify(error));
    }
  };

  const updateDebugInfo = async () => {
    try {
      const tokenManagerDebug = tokenManager.getDebugInfo();
      const apiDebug = apiService.getDebugInfo();
      const storedToken = await tokenManager.getAccessToken();
      const storedRefreshToken = await tokenManager.getRefreshToken();
      const storedUser = await tokenManager.getUserData();

      setDebugInfo({
        tokenManager: tokenManagerDebug,
        api: apiDebug,
        storedTokens: {
          accessToken: storedToken ? `${storedToken.substring(0, 20)}...` : null,
          refreshToken: storedRefreshToken ? `${storedRefreshToken.substring(0, 20)}...` : null,
        },
        storedUser: storedUser ? {
          id: storedUser.id,
          email: storedUser.email,
          firstName: storedUser.firstName,
        } : null,
      });
    } catch (error) {
      console.error('🔍 Debug: Failed to get debug info:', error);
    }
  };

  const clearTokens = async () => {
    try {
      await tokenManager.clearAll();
      await updateDebugInfo();
      Alert.alert('Success', 'All tokens cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear tokens');
    }
  };

  const testAuthFailureEvent = () => {
    try {
      console.log('🧪 Testing AUTH_FAILURE event...');
      Alert.alert(
        'Auth Failure Test',
        'This will simulate an authentication failure and should redirect to login.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Test', 
            onPress: () => {
              authEventBus.emit('AUTH_FAILURE');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Auth failure test error:', error);
      Alert.alert('Error', `Auth failure test failed: ${error.message}`);
    }
  };

  const testLogoutAction = async () => {
    try {
      console.log('🧪 Testing logout action...');
      Alert.alert(
        'Logout Test',
        'This will dispatch a logout action to Redux.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Logout', 
            onPress: async () => {
              await dispatch(logoutUser());
              console.log('✅ Logout action dispatched');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Logout test error:', error);
      Alert.alert('Error', `Logout test failed: ${error.message}`);
    }
  };

  React.useEffect(() => {
    updateDebugInfo();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Auth Debug Screen</Text>
      
      {/* Login Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Login Test</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Debug Actions</Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#34C759' }]}
          onPress={handleLoadStored}
        >
          <Text style={styles.buttonText}>Load Stored Auth</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF3B30' }]}
          onPress={clearTokens}
        >
          <Text style={styles.buttonText}>Clear All Tokens</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF9500' }]}
          onPress={updateDebugInfo}
        >
          <Text style={styles.buttonText}>Refresh Debug Info</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Event Testing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 Auth Event Testing</Text>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF6B6B' }]}
          onPress={testAuthFailureEvent}
        >
          <Text style={styles.buttonText}>Test AUTH_FAILURE Event</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4ECDC4' }]}
          onPress={testLogoutAction}
        >
          <Text style={styles.buttonText}>Test Logout Action</Text>
        </TouchableOpacity>
        
        <Text style={styles.debugText}>Event Bus Listeners: {authEventBus.getDebugInfo().totalListeners}</Text>
      </View>

      {/* Auth State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Redux Auth State</Text>
        <Text style={styles.debugText}>
          Authenticated: {isAuthenticated ? '✅' : '❌'}
        </Text>
        <Text style={styles.debugText}>
          Has User: {user ? '✅' : '❌'}
        </Text>
        <Text style={styles.debugText}>
          Has Token: {token ? '✅' : '❌'}
        </Text>
        <Text style={styles.debugText}>
          Has Refresh Token: {refreshToken ? '✅' : '❌'}
        </Text>
        {error && (
          <Text style={[styles.debugText, { color: '#FF3B30' }]}>
            Error: {error}
          </Text>
        )}
      </View>

      {/* Debug Info */}
      {debugInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Information</Text>
          <ScrollView style={styles.debugContainer}>
            <Text style={styles.debugText}>
              {JSON.stringify(debugInfo, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginVertical: 2,
  },
  debugContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
});

export default DebugAuthScreen;