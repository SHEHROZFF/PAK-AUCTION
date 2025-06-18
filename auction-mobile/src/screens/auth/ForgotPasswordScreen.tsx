import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import PatternBackground from '../../components/common/PatternBackground';
import Toast from 'react-native-toast-message';
import { THEME_COLORS } from '../../constants/api';
import { scale, verticalScale, scaleFont, wp, hp } from '../../utils/responsive';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      
      setCodeSent(true);
      Toast.show({
        type: 'success',
        text1: 'Reset Code Sent!',
        text2: 'Please check your email for the password reset code.',
      });
      
      navigation.navigate('ForgotPasswordOTP', { email });
    } catch (error) {
      // Error handling is done in the useEffect above
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PatternBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="hammer" size={40} color={THEME_COLORS.primary[500]} />
              </View>
              <Text style={styles.title}>
                Pak<Text style={styles.titleHighlight}>Auction</Text>
              </Text>
              <Text style={styles.subtitle}>
                Forgot Password
              </Text>
              <Text style={styles.description}>
                Enter your email address and we'll send you a code to reset your password
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <InputField
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  leftIcon="mail"
                  error={emailError}
                />

                <Button
                  title={isLoading ? 'Sending Code...' : 'Send Reset Code'}
                  onPress={handleSendCode}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  size="medium"
                  style={{ marginBottom: verticalScale(24) }}
                />

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    Remember your password?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </PatternBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: THEME_COLORS.gray[600],
    fontSize: scaleFont(14),
  },
  loginLink: {
    color: THEME_COLORS.primary[500],
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen; 