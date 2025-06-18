import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import { THEME_COLORS, getFullImageUrl } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutUser()) },
      ]
    );
  };

  // Get profile image URL
  const getProfileImageUrl = (profilePhoto?: string) => {
    if (!profilePhoto) return null;
    if (profilePhoto.startsWith('http')) return profilePhoto;
    return getFullImageUrl(profilePhoto);
  };

  const ProfileOption = ({ icon, title, subtitle, onPress, showArrow = true, iconColor = THEME_COLORS.primary[600] }: any) => (
    <TouchableOpacity style={styles.optionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.optionLeft}>
        <View style={[styles.optionIcon, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={scale(22)} color={iconColor} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={scale(20)} color={THEME_COLORS.gray[400]} />
      )}
    </TouchableOpacity>
  );

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* User Info */}
          <View style={styles.userSection}>
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatar}>
                {getProfileImageUrl(user?.profilePhoto) ? (
                  <Image 
                    source={{ uri: getProfileImageUrl(user?.profilePhoto)! }} 
                    style={styles.userAvatarImage} 
                  />
                ) : (
                  <Text style={styles.userInitials}>
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.isEmailVerified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={scale(16)} color={THEME_COLORS.success} />
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>
            ) : (
              <View style={styles.unverifiedBadge}>
                <Ionicons name="alert-circle" size={scale(16)} color={THEME_COLORS.warning} />
                <Text style={styles.unverifiedText}>Unverified Account</Text>
              </View>
            )}
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.optionsContainer}>
              <ProfileOption
                icon="person-outline"
                title="Edit Profile"
                subtitle="Update your personal information"
                iconColor={THEME_COLORS.primary[600]}
                onPress={() => navigation.navigate('EditProfile')}
              />
              <ProfileOption
                icon="card-outline"
                title="Payment Methods"
                subtitle="Manage your payment options"
                iconColor={THEME_COLORS.success}
                onPress={() => console.log('Payment Methods')}
              />
              <ProfileOption
                icon="shield-checkmark-outline"
                title="Security"
                subtitle="Password and security settings"
                iconColor={THEME_COLORS.warning}
                onPress={() => console.log('Security')}
              />
              <ProfileOption
                icon="notifications-outline"
                title="Notifications"
                subtitle="Manage notification preferences"
                iconColor={THEME_COLORS.primary[500]}
                onPress={() => console.log('Notifications')}
              />
            </View>
          </View>

          {/* Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Activity</Text>
            <View style={styles.optionsContainer}>
              <ProfileOption
                icon="hand-left-outline"
                title="My Bids"
                subtitle="Track your bidding history"
                iconColor={THEME_COLORS.success}
                onPress={() => navigation.navigate('MyBids')}
              />
              <ProfileOption
                icon="heart-outline"
                title="Watchlist"
                subtitle="Items you're watching"
                iconColor={THEME_COLORS.error}
                onPress={() => navigation.navigate('Watchlist')}
              />
              <ProfileOption
                icon="trophy-outline"
                title="Won Auctions"
                subtitle="Auctions you've won"
                iconColor={THEME_COLORS.warning}
                onPress={() => navigation.navigate('WonAuctions')}
              />
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support & Legal</Text>
            <View style={styles.optionsContainer}>
              <ProfileOption
                icon="help-circle-outline"
                title="Help Center"
                subtitle="Get help and support"
                iconColor={THEME_COLORS.primary[500]}
                onPress={() => console.log('Help Center')}
              />
              <ProfileOption
                icon="document-text-outline"
                title="Terms & Conditions"
                subtitle="Read our terms"
                iconColor={THEME_COLORS.gray[600]}
                onPress={() => console.log('Terms')}
              />
              <ProfileOption
                icon="shield-outline"
                title="Privacy Policy"
                subtitle="Learn about our privacy practices"
                iconColor={THEME_COLORS.gray[600]}
                onPress={() => console.log('Privacy')}
              />
              <ProfileOption
                icon="chatbubble-outline"
                title="Contact Us"
                subtitle="Get in touch with our team"
                iconColor={THEME_COLORS.primary[600]}
                onPress={() => console.log('Contact')}
              />
            </View>
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <View style={styles.logoutContainer}>
              <ProfileOption
                icon="log-out-outline"
                title="Logout"
                subtitle="Sign out of your account"
                iconColor={THEME_COLORS.error}
                onPress={handleLogout}
                showArrow={false}
              />
            </View>
          </View>

          {/* App Version */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>PakAuction v1.0.0</Text>
            <Text style={styles.copyrightText}>© 2024 PakAuction. All rights reserved.</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(120), // Space for bottom navigation
  },
  header: {
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
  headerTitle: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    textAlign: 'center',
  },
  userSection: {
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
  userAvatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(16),
    elevation: 8,
    marginBottom: verticalScale(20),
  },
  userAvatar: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    backgroundColor: THEME_COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: scale(48),
  },
  userInitials: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    marginBottom: verticalScale(16),
    textAlign: 'center',
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME_COLORS.success}15`,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
  },
  verifiedText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.success,
    fontWeight: '600',
    marginLeft: scale(6),
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME_COLORS.warning}15`,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
  },
  unverifiedText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.warning,
    fontWeight: '600',
    marginLeft: scale(6),
  },
  section: {
    marginTop: verticalScale(16),
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(20),
  },
  optionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    borderRadius: scale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    borderWidth: scale(1.5),
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  logoutContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    borderRadius: scale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    borderWidth: scale(1.5),
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    borderBottomWidth: scale(0.5),
    borderBottomColor: THEME_COLORS.gray[100],
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(2),
  },
  optionSubtitle: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(24),
    marginTop: verticalScale(16),
  },
  versionText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[400],
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[400],
    marginTop: verticalScale(4),
    fontWeight: '500',
  },
});

export default ProfileScreen; 