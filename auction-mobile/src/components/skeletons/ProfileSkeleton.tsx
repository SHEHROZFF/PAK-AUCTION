import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonLoader from '../common/SkeletonLoader';
import PatternBackground from '../common/PatternBackground';
import { scale, verticalScale } from '../../utils/responsive';

const ProfileSkeleton: React.FC = () => {
  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Skeleton */}
          <View style={styles.headerCard}>
            <SkeletonLoader width={scale(120)} height={scale(28)} style={{ alignSelf: 'center' }} />
          </View>

          {/* User Info Skeleton */}
          <View style={styles.userCard}>
            <SkeletonLoader width={scale(96)} height={scale(96)} borderRadius={scale(48)} style={{ alignSelf: 'center' }} />
            <SkeletonLoader width={scale(180)} height={scale(24)} style={{ alignSelf: 'center', marginTop: verticalScale(20) }} />
            <SkeletonLoader width={scale(220)} height={scale(16)} style={{ alignSelf: 'center', marginTop: verticalScale(6) }} />
            <SkeletonLoader width={scale(140)} height={scale(32)} borderRadius={scale(20)} style={{ alignSelf: 'center', marginTop: verticalScale(16) }} />
          </View>

          {/* Account Settings Section Skeleton */}
          <View style={styles.sectionContainer}>
            <SkeletonLoader width={scale(140)} height={scale(20)} style={{ marginBottom: verticalScale(12), marginLeft: scale(20) }} />
            <View style={styles.optionsCard}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.optionItem}>
                  <View style={styles.optionLeft}>
                    <SkeletonLoader width={scale(48)} height={scale(48)} borderRadius={scale(24)} />
                    <View style={styles.optionText}>
                      <SkeletonLoader width={scale(120)} height={scale(16)} />
                      <SkeletonLoader width={scale(160)} height={scale(14)} style={{ marginTop: verticalScale(2) }} />
                    </View>
                  </View>
                  <SkeletonLoader width={scale(20)} height={scale(20)} borderRadius={scale(10)} />
                </View>
              ))}
            </View>
          </View>

          {/* My Activity Section Skeleton */}
          <View style={styles.sectionContainer}>
            <SkeletonLoader width={scale(100)} height={scale(20)} style={{ marginBottom: verticalScale(12), marginLeft: scale(20) }} />
            <View style={styles.optionsCard}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.optionItem}>
                  <View style={styles.optionLeft}>
                    <SkeletonLoader width={scale(48)} height={scale(48)} borderRadius={scale(24)} />
                    <View style={styles.optionText}>
                      <SkeletonLoader width={scale(110)} height={scale(16)} />
                      <SkeletonLoader width={scale(150)} height={scale(14)} style={{ marginTop: verticalScale(2) }} />
                    </View>
                  </View>
                  <SkeletonLoader width={scale(20)} height={scale(20)} borderRadius={scale(10)} />
                </View>
              ))}
            </View>
          </View>

          {/* Support & Legal Section Skeleton */}
          <View style={styles.sectionContainer}>
            <SkeletonLoader width={scale(130)} height={scale(20)} style={{ marginBottom: verticalScale(12), marginLeft: scale(20) }} />
            <View style={styles.optionsCard}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.optionItem}>
                  <View style={styles.optionLeft}>
                    <SkeletonLoader width={scale(48)} height={scale(48)} borderRadius={scale(24)} />
                    <View style={styles.optionText}>
                      <SkeletonLoader width={scale(130)} height={scale(16)} />
                      <SkeletonLoader width={scale(170)} height={scale(14)} style={{ marginTop: verticalScale(2) }} />
                    </View>
                  </View>
                  <SkeletonLoader width={scale(20)} height={scale(20)} borderRadius={scale(10)} />
                </View>
              ))}
            </View>
          </View>

          {/* Logout Section Skeleton */}
          <View style={styles.sectionContainer}>
            <View style={styles.logoutCard}>
              <View style={styles.optionItem}>
                <View style={styles.optionLeft}>
                  <SkeletonLoader width={scale(48)} height={scale(48)} borderRadius={scale(24)} />
                  <View style={styles.optionText}>
                    <SkeletonLoader width={scale(80)} height={scale(16)} />
                    <SkeletonLoader width={scale(140)} height={scale(14)} style={{ marginTop: verticalScale(2) }} />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Version Section Skeleton */}
          <View style={styles.versionSection}>
            <SkeletonLoader width={scale(120)} height={scale(14)} style={{ alignSelf: 'center' }} />
            <SkeletonLoader width={scale(200)} height={scale(12)} style={{ alignSelf: 'center', marginTop: verticalScale(4) }} />
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
    paddingBottom: verticalScale(120),
  },
  headerCard: {
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
  userCard: {
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
  sectionContainer: {
    marginTop: verticalScale(16),
  },
  optionsCard: {
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
  logoutCard: {
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
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: scale(16),
    flex: 1,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(24),
    marginTop: verticalScale(16),
  },
});

export default ProfileSkeleton; 