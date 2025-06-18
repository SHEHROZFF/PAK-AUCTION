import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyEmail, resendOTP, clearError, logoutUser } from '../../store/slices/authSlice';
import Toast from 'react-native-toast-message';
import { THEME_COLORS } from '../../constants/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import PatternBackground from '../../components/common/PatternBackground';
import { scale, verticalScale, scaleFont, wp, hp } from '../../utils/responsive';

interface VerifyEmailAuthenticatedScreenProps {
  navigation: any;
  route: any;
}

const VerifyEmailAuthenticatedScreen: React.FC<VerifyEmailAuthenticatedScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);
  
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Ref to track if OTP has been sent to prevent multiple sends
  const otpSentRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Automatically send fresh OTP when screen mounts (ONLY ONCE)
  useEffect(() => {
    const sendInitialOTP = async () => {
      // Prevent multiple OTP sends
      if (otpSentRef.current) return;
      
      otpSentRef.current = true;
      
      try {
        await dispatch(resendOTP(email)).unwrap();
        Toast.show({
          type: 'info',
          text1: 'Verification Code Sent',
          text2: 'A fresh verification code has been sent to your email.',
        });
      } catch (error) {
        console.log('Failed to send initial OTP:', error);
        // Reset the flag if sending failed so user can try again
        otpSentRef.current = false;
      }
    };

    sendInitialOTP();
  }, []); // Empty dependency array to run only once

  // Timer effect with proper cleanup
  useEffect(() => {
    if (timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timer]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  // If user becomes verified, the MainNavigator will automatically switch to HomeScreen
  // No need for manual navigation

  const handleOtpChange = (text: string) => {
    setOtp(text);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors({ otp: 'Verification code is required' });
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setErrors({ otp: 'OTP must be a 6-digit number' });
      return;
    }

    setErrors({});

    try {
      await dispatch(verifyEmail({ email, otp })).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Email Verified!',
        text2: 'Welcome to PakAuction! Your account is now fully activated.',
      });
      // MainNavigator will automatically switch to HomeScreen when user.isEmailVerified becomes true
    } catch (error) {
      // Error handling is done in the useEffect above
    }
  };

  const handleResendOtp = async () => {
    // Prevent multiple simultaneous calls
    if (resendLoading || isLoading) return;
    
    setResendLoading(true);
    setTimer(60);
    setCanResend(false);

    try {
      await dispatch(resendOTP(email)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Code Sent!',
        text2: 'A new verification code has been sent to your email.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Resend Failed',
        text2: error.message || 'Failed to resend verification code',
      });
      // If resend failed, allow user to try again
      setCanResend(true);
      setTimer(0);
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You can verify your email later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutUser()) },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <PatternBackground>
        <View style={styles.content}>
          {/* Verification Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Ionicons name="warning" size={scale(20)} color="#f59e0b" />
              <Text style={styles.bannerText}>
                Please verify your email to access all features
              </Text>
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="hammer" size={scale(40)} color={THEME_COLORS.primary[500]} />
            </View>
            <Text style={styles.title}>
              Pak<Text style={styles.titleHighlight}>Auction</Text>
            </Text>
            <Text style={styles.subtitle}>
              Verify Your Email
            </Text>
            <Text style={styles.description}>
              A fresh verification code has been sent to your email
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <View style={styles.emailInfo}>
                <Text style={styles.emailLabel}>Verification code sent to:</Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>

              <InputField
                label="Verification Code"
                placeholder="Enter 6-digit code"
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="numeric"
                maxLength={6}
                returnKeyType="done"
                blurOnSubmit={true}
                leftIcon="key"
                error={errors.otp}
              />

              <Button
                title={isLoading ? 'Verifying...' : 'Verify Email'}
                onPress={handleVerifyOtp}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                size="medium"
                style={{ marginBottom: verticalScale(24) }}
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive the code?{' '}
                </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendLoading || isLoading || !canResend}
                  style={[
                    (resendLoading || isLoading || !canResend) && styles.disabledButton
                  ]}
                >
                  <Text style={[
                    styles.resendLink, 
                    (resendLoading || isLoading || !canResend) && styles.disabledLink
                  ]}>
                    {resendLoading || isLoading ? 'Sending...' : canResend ? 'Resend' : `Resend in ${formatTime(timer)}`}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionContainer}>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Ionicons name="log-out-outline" size={scale(16)} color="#dc2626" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </PatternBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
  },
  banner: {
    backgroundColor: '#fef3c7',
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(20),
    borderLeftWidth: scale(4),
    borderLeftColor: '#f59e0b',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: scaleFont(14),
    color: '#92400e',
    fontWeight: '500',
    marginLeft: scale(8),
    flex: 1,
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
  emailInfo: {
    marginBottom: verticalScale(24),
    padding: scale(16),
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: scale(12),
    borderLeftWidth: scale(4),
    borderLeftColor: THEME_COLORS.primary[500],
  },
  emailLabel: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[600],
    marginBottom: verticalScale(4),
  },
  emailText: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[800],
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  resendText: {
    color: THEME_COLORS.gray[600],
    fontSize: scaleFont(14),
  },
  resendLink: {
    color: THEME_COLORS.primary[500],
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
  disabledLink: {
    color: THEME_COLORS.gray[400],
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionContainer: {
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
  },
  logoutText: {
    color: '#dc2626',
    fontSize: scaleFont(14),
    fontWeight: '600',
    marginLeft: scale(4),
  },
});

export default VerifyEmailAuthenticatedScreen; 