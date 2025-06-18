import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyEmail, resendOTP, clearError, clearVerificationSent } from '../../store/slices/authSlice';
import Toast from 'react-native-toast-message';
import { THEME_COLORS } from '../../constants/api';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import PatternBackground from '../../components/common/PatternBackground';
import { scale, verticalScale, scaleFont, wp, hp } from '../../utils/responsive';

interface VerifyEmailScreenProps {
  navigation: any;
  route: any;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

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
        text2: 'Your email has been verified successfully.',
      });
      navigation.navigate('Login');
    } catch (error) {
      // Error handling is done in the useEffect above
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);

    try {
      await dispatch(resendOTP(email));
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
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                Verify Your Email
              </Text>
              <Text style={styles.description}>
                Enter the 6-digit code sent to your email address
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
                    disabled={resendLoading}
                  >
                    <Text style={styles.resendLink}>
                      {resendLoading ? 'Sending...' : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    Want to use a different email?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                  >
                    <Text style={styles.loginLink}>Register Again</Text>
                  </TouchableOpacity>
                </View> */}
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

export default VerifyEmailScreen; 