import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import PatternBackground from '../components/common/PatternBackground';

const SellProductScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    description: '',
    condition: '',
    basePrice: '',
    bidIncrement: '',
    auctionDuration: '',
    location: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const categories = [
    'Computers',
    'Antiques', 
    'DVD',
    'Retro Games',
    'Phones',
    'Art',
  ];

  const conditions = [
    'New',
    'Like New',
    'Excellent',
    'Very Good',
    'Good',
    'Fair',
  ];

  const durations = [
    '1 Day',
    '3 Days',
    '5 Days',
    '7 Days',
    '10 Days',
  ];

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select condition';
    }

    if (!formData.basePrice.trim()) {
      newErrors.basePrice = 'Base price is required';
    } else if (isNaN(parseInt(formData.basePrice)) || parseInt(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Please enter a valid price';
    }

    if (!formData.bidIncrement.trim()) {
      newErrors.bidIncrement = 'Bid increment is required';
    } else if (isNaN(parseInt(formData.bidIncrement)) || parseInt(formData.bidIncrement) <= 0) {
      newErrors.bidIncrement = 'Please enter a valid increment';
    }

    if (!formData.auctionDuration) {
      newErrors.auctionDuration = 'Please select auction duration';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert(
      'Submit Product',
      'Your product will be reviewed by our team before going live. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            // TODO: Submit to API
            Alert.alert('Success', 'Your product has been submitted for review!', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        },
      ]
    );
  };

  const SelectField = ({ 
    label, 
    placeholder, 
    value, 
    options, 
    onSelect, 
    error, 
    icon 
  }: {
    label: string;
    placeholder: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
    error?: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.selectField, error && styles.selectFieldError]}
        onPress={() => {
          Alert.alert(
            `Select ${label}`,
            '',
            options.map(option => ({
              text: option,
              onPress: () => onSelect(option)
            })).concat([{ text: 'Cancel', onPress: () => {} }])
          );
        }}
        activeOpacity={0.7}
      >
        <View style={styles.selectFieldContent}>
          <Ionicons name={icon} size={scale(20)} color={THEME_COLORS.gray[500]} />
          <Text style={[
            styles.selectFieldText,
            !value && styles.placeholderText
          ]}>
            {value || placeholder}
          </Text>
          <Ionicons name="chevron-down" size={scale(20)} color={THEME_COLORS.gray[400]} />
        </View>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={scale(24)} color={THEME_COLORS.gray[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sell Product</Text>
          <View style={{ width: scale(44) }} />
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="storefront" size={scale(40)} color={THEME_COLORS.primary[600]} />
            </View>
            <Text style={styles.introTitle}>List Your Product</Text>
            <Text style={styles.introSubtitle}>
              Fill in the details below to list your product for auction. Our team will review and approve it within 24 hours.
            </Text>
          </View>

          {/* Product Information */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Product Information</Text>
            
            <InputField
              label="Product Name"
              placeholder="e.g., Samsung Galaxy S22 Ultra"
              value={formData.productName}
              onChangeText={(text) => updateFormData('productName', text)}
              leftIcon="pricetag-outline"
              error={errors.productName}
            />

            <SelectField
              label="Category"
              placeholder="Select Category"
              value={formData.category}
              options={categories}
              onSelect={(value) => updateFormData('category', value)}
              error={errors.category}
              icon="grid-outline"
            />

            <InputField
              label="Description"
              placeholder="Describe your product in detail..."
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              leftIcon="document-text-outline"
              multiline={true}
              numberOfLines={4}
              error={errors.description}
              style={{ height: scale(120) }}
            />

            <SelectField
              label="Condition"
              placeholder="Select Condition"
              value={formData.condition}
              options={conditions}
              onSelect={(value) => updateFormData('condition', value)}
              error={errors.condition}
              icon="star-outline"
            />
          </View>

          {/* Pricing & Auction Details */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Pricing & Auction Details</Text>
            
            <InputField
              label="Base Price (PKR)"
              placeholder="Starting bid amount"
              value={formData.basePrice}
              onChangeText={(text) => updateFormData('basePrice', text)}
              leftIcon="cash-outline"
              keyboardType="numeric"
              error={errors.basePrice}
            />

            <InputField
              label="Bid Increment (PKR)"
              placeholder="Minimum bid increase"
              value={formData.bidIncrement}
              onChangeText={(text) => updateFormData('bidIncrement', text)}
              leftIcon="trending-up-outline"
              keyboardType="numeric"
              error={errors.bidIncrement}
            />

            <SelectField
              label="Auction Duration"
              placeholder="Select Duration"
              value={formData.auctionDuration}
              options={durations}
              onSelect={(value) => updateFormData('auctionDuration', value)}
              error={errors.auctionDuration}
              icon="time-outline"
            />

            <InputField
              label="Location"
              placeholder="Your city"
              value={formData.location}
              onChangeText={(text) => updateFormData('location', text)}
              leftIcon="location-outline"
              error={errors.location}
            />
          </View>

          {/* Submit Section */}
          <View style={styles.submitCard}>
            <Button
              title="Submit for Review"
              onPress={handleSubmit}
              variant="primary"
              size="large"
            />
            
            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={scale(20)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.submitNote}>
                Your product will be reviewed by our team within 24 hours
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PatternBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
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
  headerButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: THEME_COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  content: {
    flex: 1,
    marginTop: verticalScale(16),
  },
  contentContainer: {
    paddingBottom: verticalScale(120),
  },
  introCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
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
  introIcon: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: THEME_COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
    elevation: 6,
  },
  introTitle: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    textAlign: 'center',
    lineHeight: scaleFont(24),
    fontWeight: '500',
  },
  formCard: {
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
  submitCard: {
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
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(20),
  },
  fieldContainer: {
    marginBottom: verticalScale(20),
  },
  fieldLabel: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(8),
  },
  selectField: {
    borderWidth: scale(1.5),
    borderColor: THEME_COLORS.gray[300],
    borderRadius: scale(16),
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 2,
  },
  selectFieldError: {
    borderColor: THEME_COLORS.error,
  },
  selectFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  selectFieldText: {
    flex: 1,
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[800],
    marginLeft: scale(12),
    fontWeight: '500',
  },
  placeholderText: {
    color: THEME_COLORS.gray[400],
  },
  errorText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.error,
    marginTop: verticalScale(6),
    marginLeft: scale(16),
    fontWeight: '500',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(16),
    paddingHorizontal: scale(16),
  },
  submitNote: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    textAlign: 'center',
    marginLeft: scale(8),
    fontWeight: '500',
    lineHeight: scaleFont(20),
  },
});

export default SellProductScreen; 