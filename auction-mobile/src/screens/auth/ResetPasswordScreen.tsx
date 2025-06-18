import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetPassword, clearError } from '../../store/slices/authSlice';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import PatternBackground from '../../components/common/PatternBackground';
import Toast from 'react-native-toast-message';
import { THEME_COLORS } from '../../constants/api';
import { scale, verticalScale, scaleFont, wp, hp } from '../../utils/responsive';

interface ResetPasswordScreenProps {
  navigation: any;
  route: any;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const { email, otp } = route.params;
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation does not match password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(resetPassword({
        email,
        otp: otp,
        newPassword: formData.newPassword,
      })).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful!',
        text2: 'Please login with your new password.',
      });

      navigation.navigate('Login');
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
                Create New Password
              </Text>
              <Text style={styles.description}>
                Your identity has been verified. Please create a strong new password for your account.
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                <View style={styles.emailInfo}>
                  <Text style={styles.emailLabel}>✅ Email verified:</Text>
                  <Text style={styles.emailText}>{email}</Text>
                </View>

                <InputField
                  label="New Password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChangeText={(text: string) => updateFormData('newPassword', text)}
                  secureTextEntry
                  returnKeyType="next"
                  blurOnSubmit={false}
                  leftIcon="lock-closed"
                  error={errors.newPassword}
                />

                <InputField
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChangeText={(text: string) => updateFormData('confirmPassword', text)}
                  secureTextEntry
                  returnKeyType="done"
                  blurOnSubmit={true}
                  leftIcon="lock-closed"
                  error={errors.confirmPassword}
                />

                <Button
                  title={isLoading ? 'Resetting Password...' : 'Reset Password'}
                  onPress={handleResetPassword}
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

export default ResetPasswordScreen; 