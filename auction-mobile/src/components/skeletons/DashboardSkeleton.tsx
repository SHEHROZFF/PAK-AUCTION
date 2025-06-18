import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonLoader from '../common/SkeletonLoader';
import PatternBackground from '../common/PatternBackground';
import { scale, verticalScale } from '../../utils/responsive';

const DashboardSkeleton: React.FC = () => {
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
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <SkeletonLoader width={scale(140)} height={scale(16)} />
                <SkeletonLoader width={scale(180)} height={scale(24)} style={{ marginTop: verticalScale(4) }} />
              </View>
              <SkeletonLoader width={scale(56)} height={scale(56)} borderRadius={scale(28)} />
            </View>
          </View>

          {/* Stats Section Skeleton */}
          <View style={styles.section}>
            <SkeletonLoader width={scale(120)} height={scale(20)} style={{ marginBottom: verticalScale(16), marginLeft: scale(20) }} />
            <View style={styles.statsGrid}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.statCard}>
                  <View style={styles.statContent}>
                    <View style={styles.statLeft}>
                      <SkeletonLoader width={scale(40)} height={scale(32)} />
                      <SkeletonLoader width={scale(80)} height={scale(14)} style={{ marginTop: verticalScale(4) }} />
                    </View>
                    <SkeletonLoader width={scale(32)} height={scale(32)} borderRadius={scale(16)} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions Section Skeleton */}
          <View style={styles.section}>
            <SkeletonLoader width={scale(120)} height={scale(20)} style={{ marginBottom: verticalScale(16), marginLeft: scale(20) }} />
            <View style={styles.actionsGrid}>
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.actionCard}>
                  <SkeletonLoader width={scale(64)} height={scale(64)} borderRadius={scale(32)} />
                  <SkeletonLoader width={scale(80)} height={scale(16)} style={{ marginTop: verticalScale(12) }} />
                  <SkeletonLoader width={scale(70)} height={scale(12)} style={{ marginTop: verticalScale(4) }} />
                </View>
              ))}
            </View>
          </View>

          {/* Recent Activity Section Skeleton */}
          <View style={styles.section}>
            <SkeletonLoader width={scale(140)} height={scale(20)} style={{ marginBottom: verticalScale(16), marginLeft: scale(20) }} />
            <View style={styles.activityCard}>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.activityItem}>
                  <SkeletonLoader width={scale(44)} height={scale(44)} borderRadius={scale(22)} />
                  <View style={styles.activityContent}>
                    <SkeletonLoader width="90%" height={scale(16)} />
                    <SkeletonLoader width="80%" height={scale(14)} style={{ marginTop: verticalScale(2) }} />
                    <SkeletonLoader width={scale(80)} height={scale(12)} style={{ marginTop: verticalScale(4) }} />
                  </View>
                </View>
              ))}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  section: {
    marginTop: verticalScale(16),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(20),
    gap: scale(12),
  },
  statCard: {
    width: '48%',
    borderRadius: scale(20),
    padding: scale(20),
    backgroundColor: 'rgba(59, 130, 246, 0.9)', // Default blue color for skeleton
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.15,
    shadowRadius: scale(16),
    elevation: 8,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLeft: {
    flex: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: scale(20),
    gap: scale(12),
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.1,
    shadowRadius: scale(16),
    elevation: 6,
    borderWidth: scale(1),
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    borderRadius: scale(20),
    padding: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.1,
    shadowRadius: scale(16),
    elevation: 6,
    borderWidth: scale(1),
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: verticalScale(16),
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityContent: {
    flex: 1,
    marginLeft: scale(16),
  },
});

export default DashboardSkeleton; 