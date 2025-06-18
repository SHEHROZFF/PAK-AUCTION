import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import PatternBackground from '../../components/common/PatternBackground';
import Toast from 'react-native-toast-message';
import { THEME_COLORS } from '../../constants/api';
import { scale, verticalScale, scaleFont, wp, hp } from '../../utils/responsive';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, verificationSent } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    marketingEmails: false,
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (verificationSent) {
      Toast.show({
        type: 'success',
        text1: 'Registration Successful!',
        text2: 'Please check your email for verification code.',
      });
      navigation.navigate('VerifyEmail', { email: formData.email });
    }
  }, [verificationSent, navigation, formData.email]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // First name validation - 2-50 characters, only letters and spaces
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2 || formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be 2-50 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name must contain only letters';
    }

    // Last name validation - 2-50 characters, only letters and spaces
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2 || formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be 2-50 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name must contain only letters';
    }

    // Username validation - 3-30 characters, only letters/numbers/underscores
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = 'Username must be 3-30 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username must contain only letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    // Password validation - Strong requirements matching backend
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation does not match password';
    }

    // Phone validation (optional) - Using more comprehensive pattern
    if (formData.phone && formData.phone.trim()) {
      // Basic international phone number pattern
      if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Please provide a valid phone number';
      }
    }

    // Date of birth validation (optional) - Must be 18+ years old
    if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Please enter date in YYYY-MM-DD format';
      } else {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18) {
          newErrors.dateOfBirth = 'You must be at least 18 years old to register';
        }
      }
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        marketingEmails: formData.marketingEmails,
      };

      await dispatch(registerUser(registerData)).unwrap();
    } catch (error) {
      // Error handling is done in the useEffect above
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
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
                Create Your Account
              </Text>
              <Text style={styles.description}>
                Join PakAuction and start bidding on unique items
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                {/* Personal Information Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>

                <View style={styles.nameRow}>
                  <View style={styles.nameField}>
                    <InputField
                      label="First Name"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChangeText={(text: string) => updateFormData('firstName', text)}
                      autoCapitalize="words"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      error={errors.firstName}
                    />
                  </View>
                  <View style={styles.nameField}>
                    <InputField
                      label="Last Name"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChangeText={(text: string) => updateFormData('lastName', text)}
                      autoCapitalize="words"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      error={errors.lastName}
                    />
                  </View>
                </View>

                <InputField
                  label="Email Address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChangeText={(text: string) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  leftIcon="mail"
                  error={errors.email}
                />

                <InputField
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={(text: string) => updateFormData('phone', text)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  leftIcon="call"
                  error={errors.phone}
                />

                <InputField
                  label="Date of Birth"
                  placeholder="YYYY-MM-DD"
                  value={formData.dateOfBirth}
                  onChangeText={(text: string) => updateFormData('dateOfBirth', text)}
                  keyboardType="numeric"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  leftIcon="calendar"
                  error={errors.dateOfBirth}
                />

                {/* Account Information Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Account Information</Text>
                </View>

                <InputField
                  label="Username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChangeText={(text: string) => updateFormData('username', text)}
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  leftIcon="person"
                  error={errors.username}
                />

                <InputField
                  label="Password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChangeText={(text: string) => updateFormData('password', text)}
                  secureTextEntry
                  returnKeyType="next"
                  blurOnSubmit={false}
                  leftIcon="lock-closed"
                  error={errors.password}
                />

                <InputField
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChangeText={(text: string) => updateFormData('confirmPassword', text)}
                  secureTextEntry
                  returnKeyType="done"
                  blurOnSubmit={true}
                  leftIcon="lock-closed"
                  error={errors.confirmPassword}
                />

                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => updateFormData('agreeToTerms', !formData.agreeToTerms)}
                >
                  <View style={[styles.checkboxBox, formData.agreeToTerms && styles.checkboxChecked]}>
                    {formData.agreeToTerms && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    I agree to the{' '}
                    <Text style={styles.linkText}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                    . I confirm that I am at least 18 years old.
                  </Text>
                </TouchableOpacity>
                {errors.agreeToTerms && (
                  <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
                )}

                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => updateFormData('marketingEmails', !formData.marketingEmails)}
                >
                  <View style={[styles.checkboxBox, formData.marketingEmails && styles.checkboxChecked]}>
                    {formData.marketingEmails && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    I would like to receive emails about new auctions, special offers, and updates.
                  </Text>
                </TouchableOpacity>

                <Button
                  title={isLoading ? 'Creating Account...' : 'Create Account'}
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  variant="primary"
                  size="medium"
                  style={{ marginBottom: verticalScale(24) }}
                />

                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.loginLink}>Sign In</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
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
  sectionHeader: {
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  nameRow: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  nameField: {
    flex: 1,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    paddingHorizontal: scale(4),
  },
  checkboxBox: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(4),
    borderWidth: scale(2),
    borderColor: THEME_COLORS.gray[300],
    marginRight: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: THEME_COLORS.primary[500],
    borderColor: THEME_COLORS.primary[500],
  },
  checkboxText: {
    flex: 1,
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[600],
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
  linkText: {
    color: THEME_COLORS.primary[500],
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: scaleFont(12),
    marginTop: verticalScale(4),
  },
});

export default RegisterScreen; 