import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../store';
import { updateUserProfile } from '../store/slices/userSlice';
import { THEME_COLORS, getFullImageUrl, API_BASE_URL } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';

interface EditProfileScreenProps {
  navigation: any;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  maxLength?: number;
  icon?: any;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  keyboardType = 'default',
  maxLength,
  icon
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[styles.inputWrapper, error && styles.inputError]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={scale(20)} 
          color={THEME_COLORS.gray[400]} 
          style={styles.inputIcon}
        />
      )}
      <TextInput
        style={[styles.textInput, icon && styles.textInputWithIcon]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME_COLORS.gray[400]}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.user);

  // Form state - Initialize with user data when available
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
    marketingEmails: user?.marketingEmails || false,
    profilePhoto: user?.profilePhoto || '',
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
        marketingEmails: user.marketingEmails || false,
        profilePhoto: user.profilePhoto || '',
      });
    }
  }, [user]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUploading, setImageUploading] = useState(false);

  // Get profile image URL
  const getProfileImageUrl = (profilePhoto?: string) => {
    if (!profilePhoto) return null;
    if (profilePhoto.startsWith('http')) return profilePhoto;
    return getFullImageUrl(profilePhoto);
  };

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload profile photos!');
      }
    })();
  }, []);

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image picker
  const handleImagePicker = () => {
    Alert.alert(
      'Select Profile Photo',
      'Choose how you want to select your profile photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setImageUploading(true);
      
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('images', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      // Upload image to backend
      const { apiService } = await import('../services/api');
      const token = await apiService.getStoredToken();
      
      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (result.success && result.data?.images && result.data.images[0]?.url) {
        setFormData(prev => ({ ...prev, profilePhoto: result.data.images[0].url }));
        Toast.show({
          type: 'success',
          text1: '📸 Photo Uploaded',
          text2: 'Profile photo uploaded successfully',
          position: 'top',
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Upload Failed',
        text2: error.message || 'Failed to upload image',
        position: 'top',
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors below',
        position: 'top',
      });
      return;
    }

    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth?.toISOString(),
        marketingEmails: formData.marketingEmails,
        profilePhoto: formData.profilePhoto || undefined,
      };

      await dispatch(updateUserProfile(updateData)).unwrap();
      
      Toast.show({
        type: 'success',
        text1: '✅ Profile Updated',
        text2: 'Your profile has been updated successfully',
        position: 'top',
      });

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: '❌ Update Failed',
        text2: error.message || 'Failed to update profile',
        position: 'top',
      });
    }
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const profileImageUrl = getProfileImageUrl(formData.profilePhoto);

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={scale(24)} color={THEME_COLORS.gray[700]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity 
              style={[styles.saveButton, (loading || imageUploading) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading || imageUploading}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Profile Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity 
                  style={styles.avatar}
                  onPress={handleImagePicker}
                  activeOpacity={0.8}
                  disabled={imageUploading}
                >
                  {profileImageUrl ? (
                    <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                    </Text>
                  )}
                  {imageUploading && (
                    <View style={styles.uploadingOverlay}>
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.avatarEditButton} 
                  onPress={handleImagePicker}
                  activeOpacity={0.7}
                  disabled={imageUploading}
                >
                  <Ionicons name="camera" size={scale(16)} color={THEME_COLORS.primary[600]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarHint}>Tap to change profile photo</Text>
            </View>

            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <InputField
                label="First Name *"
                value={formData.firstName}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="Enter your first name"
                error={errors.firstName}
                icon="person-outline"
                maxLength={50}
              />

              <InputField
                label="Last Name *"
                value={formData.lastName}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, lastName: text }))}
                placeholder="Enter your last name"
                error={errors.lastName}
                icon="person-outline"
                maxLength={50}
              />

              <InputField
                label="Phone Number"
                value={formData.phone}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                error={errors.phone}
                keyboardType="phone-pad"
                icon="call-outline"
                maxLength={20}
              />

              {/* Date of Birth */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={scale(20)} 
                    color={THEME_COLORS.gray[400]} 
                    style={styles.inputIcon}
                  />
                  <Text style={[
                    styles.datePickerText,
                    !formData.dateOfBirth && styles.datePickerPlaceholder
                  ]}>
                    {formatDate(formData.dateOfBirth)}
                  </Text>
                  <Ionicons 
                    name="chevron-down" 
                    size={scale(20)} 
                    color={THEME_COLORS.gray[400]} 
                  />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.dateOfBirth || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchLeft}>
                  <Ionicons 
                    name="mail-outline" 
                    size={scale(22)} 
                    color={THEME_COLORS.primary[600]} 
                    style={styles.switchIcon}
                  />
                  <View style={styles.switchTextContainer}>
                    <Text style={styles.switchTitle}>Marketing Emails</Text>
                    <Text style={styles.switchSubtitle}>
                      Receive updates about new auctions and promotions
                    </Text>
                  </View>
                </View>
                <Switch
                  value={formData.marketingEmails}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, marketingEmails: value }))}
                  trackColor={{ 
                    false: THEME_COLORS.gray[300], 
                    true: THEME_COLORS.primary[200] 
                  }}
                  thumbColor={formData.marketingEmails ? THEME_COLORS.primary[600] : THEME_COLORS.gray[400]}
                />
              </View>
            </View>

            {/* Account Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              
              <View style={styles.infoItem}>
                <Ionicons 
                  name="mail" 
                  size={scale(20)} 
                  color={THEME_COLORS.gray[500]} 
                  style={styles.infoIcon}
                />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                  <Text style={styles.infoNote}>Email cannot be changed</Text>
                </View>
              </View>

              {user?.isEmailVerified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color={THEME_COLORS.success} />
                  <Text style={styles.verifiedText}>Email Verified</Text>
                </View>
              ) : (
                <View style={styles.unverifiedBadge}>
                  <Ionicons name="alert-circle" size={scale(16)} color={THEME_COLORS.warning} />
                  <Text style={styles.unverifiedText}>Email Not Verified</Text>
                </View>
              )}
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PatternBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
    borderRadius: scale(24),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    borderWidth: scale(1.5),
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  backButton: {
    padding: scale(8),
    borderRadius: scale(12),
    backgroundColor: THEME_COLORS.gray[100],
  },
  headerTitle: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  saveButton: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    backgroundColor: THEME_COLORS.primary[600],
    borderRadius: scale(12),
    shadowColor: THEME_COLORS.primary[600],
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: THEME_COLORS.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(120),
  },
  avatarSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    borderRadius: scale(24),
    alignItems: 'center',
    paddingVertical: verticalScale(32),
    paddingHorizontal: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    borderWidth: scale(1.5),
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(16),
    elevation: 8,
  },
  avatar: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    backgroundColor: THEME_COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(48),
  },
  avatarText: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: 'white',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(48),
  },
  uploadingText: {
    color: 'white',
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: THEME_COLORS.primary[600],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 6,
  },
  avatarHint: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    borderRadius: scale(24),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    borderWidth: scale(1.5),
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(20),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  inputLabel: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: THEME_COLORS.gray[700],
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.gray[50],
    borderRadius: scale(16),
    borderWidth: 2,
    borderColor: THEME_COLORS.gray[200],
    paddingHorizontal: scale(16),
    minHeight: scale(56),
  },
  inputError: {
    borderColor: THEME_COLORS.error,
    backgroundColor: `${THEME_COLORS.error}05`,
  },
  inputIcon: {
    marginRight: scale(12),
  },
  textInput: {
    flex: 1,
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[800],
    paddingVertical: scale(12),
  },
  textInputWithIcon: {
    marginLeft: 0,
  },
  errorText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.error,
    marginTop: verticalScale(6),
    marginLeft: scale(8),
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.gray[50],
    borderRadius: scale(16),
    borderWidth: 2,
    borderColor: THEME_COLORS.gray[200],
    paddingHorizontal: scale(16),
    minHeight: scale(56),
  },
  datePickerText: {
    flex: 1,
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[800],
    marginLeft: scale(12),
  },
  datePickerPlaceholder: {
    color: THEME_COLORS.gray[400],
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.gray[50],
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 2,
    borderColor: THEME_COLORS.gray[200],
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchIcon: {
    marginRight: scale(12),
  },
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(4),
  },
  switchSubtitle: {
    fontSize: scaleFont(13),
    color: THEME_COLORS.gray[500],
    lineHeight: scaleFont(18),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.gray[50],
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 2,
    borderColor: THEME_COLORS.gray[200],
    marginBottom: verticalScale(12),
  },
  infoIcon: {
    marginRight: scale(12),
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    marginBottom: verticalScale(4),
    fontWeight: '500',
  },
  infoValue: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(2),
  },
  infoNote: {
    fontSize: scaleFont(11),
    color: THEME_COLORS.gray[400],
    fontStyle: 'italic',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME_COLORS.success}15`,
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.success,
    fontWeight: '600',
    marginLeft: scale(6),
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME_COLORS.warning}15`,
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    alignSelf: 'flex-start',
  },
  unverifiedText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.warning,
    fontWeight: '600',
    marginLeft: scale(6),
  },
  bottomSpacing: {
    height: verticalScale(40),
  },
});

export default EditProfileScreen;