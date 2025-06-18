import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import PatternBackground from '../../components/common/PatternBackground';
import Toast from 'react-native-toast-message';
import { THEME_COLORS } from '../../constants/api';
import { useResponsiveDimensions } from '../../utils/responsive';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { scale, verticalScale, scaleFont, wp, hp } = useResponsiveDimensions();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'You have been logged in successfully.',
      });
      // Navigation will be handled by the AuthNavigator
    } catch (error) {
      // Error handling is done in the useEffect above
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Create styles using responsive dimensions
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(40),
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(40),
    },
    logoContainer: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(20),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: verticalScale(8),
      },
      shadowOpacity: 0.15,
      shadowRadius: scale(12),
      elevation: 10,
      borderWidth: scale(1),
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
      fontSize: scaleFont(32),
      fontWeight: 'bold',
      color: '#0f172a',
      marginBottom: verticalScale(8),
      textShadowColor: 'rgba(255, 255, 255, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    titleHighlight: {
      color: THEME_COLORS.primary[600],
    },
    subtitle: {
      fontSize: scaleFont(20),
      fontWeight: '600',
      color: '#334155',
      marginBottom: verticalScale(4),
    },
    description: {
      fontSize: scaleFont(16),
      color: '#64748b',
      textAlign: 'center',
    },
    formContainer: {
      width: wp(90),
      alignSelf: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: scale(24),
      paddingHorizontal: scale(28),
      paddingVertical: verticalScale(36),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: verticalScale(16),
      },
      shadowOpacity: 0.25,
      shadowRadius: scale(32),
      elevation: 20,
      borderWidth: scale(1.5),
      borderColor: 'rgba(255, 255, 255, 0.6)',
      position: 'relative',
    },
    form: {
      width: '100%',
    },
    formOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(24),
    },
    rememberMe: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: scale(20),
      height: scale(20),
      borderWidth: scale(2),
      borderColor: THEME_COLORS.gray[300],
      borderRadius: scale(4),
      marginRight: scale(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxInner: {
      width: scale(12),
      height: scale(12),
      backgroundColor: THEME_COLORS.primary[500],
      borderRadius: scale(2),
    },
    rememberText: {
      color: THEME_COLORS.gray[700],
      fontSize: scaleFont(14),
    },
    forgotPasswordText: {
      color: THEME_COLORS.primary[500],
      fontSize: scaleFont(14),
      fontWeight: '500',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    signupText: {
      color: THEME_COLORS.gray[600],
      fontSize: scaleFont(14),
    },
    signupLink: {
      color: THEME_COLORS.primary[500],
      fontSize: scaleFont(14),
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <PatternBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="hammer" size={40} color={THEME_COLORS.primary[500]} />
              </View>
              <Text style={styles.title}>
                Pak<Text style={styles.titleHighlight}>Auction</Text>
              </Text>
              <Text style={styles.subtitle}>
                Login to Your Account
              </Text>
              <Text style={styles.description}>
                Access your PakAuction account
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <InputField
                  label="Email Address"
                  placeholder="Your email address"
                  value={formData.email}
                  onChangeText={(text: string) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail"
                  error={errors.email}
                />

                <InputField
                  label="Password"
                  placeholder="Your password"
                  value={formData.password}
                  onChangeText={(text: string) => updateFormData('password', text)}
                  secureTextEntry
                  leftIcon="lock-closed"
                  error={errors.password}
                />

                <View style={styles.formOptions}>
                  <View style={styles.rememberMe}>
                    <TouchableOpacity style={styles.checkbox}>
                      <View style={styles.checkboxInner} />
                    </TouchableOpacity>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title={isLoading ? 'Signing in...' : 'Login'}
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  size="medium"
                  style={{ marginBottom: verticalScale(24) }}
                />

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                  >
                    <Text style={styles.signupLink}>Register</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </PatternBackground>
    </SafeAreaView>
  );
};

export default LoginScreen; 