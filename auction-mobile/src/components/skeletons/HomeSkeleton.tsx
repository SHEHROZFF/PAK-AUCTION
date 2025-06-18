import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonLoader from '../common/SkeletonLoader';
import PatternBackground from '../common/PatternBackground';
import { scale, verticalScale } from '../../utils/responsive';

const HomeSkeleton: React.FC = () => {
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
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <SkeletonLoader width={scale(48)} height={scale(48)} borderRadius={scale(24)} />
                <SkeletonLoader width={scale(120)} height={scale(24)} style={{ marginLeft: scale(12) }} />
              </View>
              <SkeletonLoader width={scale(22)} height={scale(22)} borderRadius={scale(11)} />
            </View>
            <SkeletonLoader width={scale(200)} height={scale(16)} style={{ marginTop: verticalScale(12) }} />
          </View>

          {/* Search Bar Skeleton */}
          <View style={styles.searchCard}>
            <View style={styles.searchBar}>
              <SkeletonLoader width={scale(20)} height={scale(20)} borderRadius={scale(10)} />
              <SkeletonLoader width="70%" height={scale(20)} style={{ marginLeft: scale(12) }} />
              <SkeletonLoader width={scale(20)} height={scale(20)} borderRadius={scale(10)} />
            </View>
          </View>

          {/* Stats Skeleton */}
          <View style={styles.statsCard}>
            <SkeletonLoader width={scale(150)} height={scale(18)} style={{ alignSelf: 'center', marginBottom: verticalScale(16) }} />
            <View style={styles.statsContainer}>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.statItem}>
                  <SkeletonLoader width={scale(48)} height={scale(48)} borderRadius={scale(24)} />
                  <SkeletonLoader width={scale(30)} height={scale(24)} style={{ marginTop: verticalScale(8) }} />
                  <SkeletonLoader width={scale(80)} height={scale(12)} style={{ marginTop: verticalScale(4) }} />
                </View>
              ))}
            </View>
          </View>

          {/* Categories Skeleton */}
          <View style={styles.sectionCard}>
            <SkeletonLoader width={scale(140)} height={scale(20)} style={{ marginBottom: verticalScale(16) }} />
            <View style={styles.categoriesGrid}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <View key={item} style={styles.categoryCard}>
                  <SkeletonLoader width={scale(64)} height={scale(64)} borderRadius={scale(32)} />
                  <SkeletonLoader width={scale(70)} height={scale(14)} style={{ marginTop: verticalScale(12) }} />
                  <SkeletonLoader width={scale(60)} height={scale(12)} style={{ marginTop: verticalScale(4) }} />
                </View>
              ))}
            </View>
          </View>

          {/* Featured Auctions Skeleton */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <SkeletonLoader width={scale(140)} height={scale(20)} />
              <SkeletonLoader width={scale(60)} height={scale(14)} />
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.auctionsContainer}>
                {[1, 2].map((item) => (
                  <View key={item} style={styles.auctionCard}>
                    <SkeletonLoader width="100%" height={scale(160)} borderRadius={scale(12)} />
                    <View style={styles.auctionInfo}>
                      <SkeletonLoader width="90%" height={scale(16)} />
                      <SkeletonLoader width={scale(60)} height={scale(20)} borderRadius={scale(10)} style={{ marginTop: verticalScale(8) }} />
                      <View style={styles.auctionPricing}>
                        <View>
                          <SkeletonLoader width={scale(80)} height={scale(12)} />
                          <SkeletonLoader width={scale(100)} height={scale(18)} style={{ marginTop: verticalScale(4) }} />
                        </View>
                        <View>
                          <SkeletonLoader width={scale(50)} height={scale(12)} />
                          <SkeletonLoader width={scale(40)} height={scale(12)} style={{ marginTop: verticalScale(4) }} />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Quick Actions Skeleton */}
          <View style={styles.sectionCard}>
            <SkeletonLoader width={scale(120)} height={scale(20)} style={{ marginBottom: verticalScale(16) }} />
            <View style={styles.quickActions}>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.quickActionButton}>
                  <SkeletonLoader width={scale(56)} height={scale(56)} borderRadius={scale(28)} />
                  <SkeletonLoader width={scale(60)} height={scale(12)} style={{ marginTop: verticalScale(8) }} />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    marginTop: verticalScale(16),
    borderRadius: scale(20),
    padding: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(16),
    elevation: 8,
    borderWidth: scale(1),
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: scale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderWidth: scale(1),
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  statsCard: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(16),
  },
  categoryCard: {
    width: '47%',
    alignItems: 'center',
    padding: scale(16),
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  auctionsContainer: {
    flexDirection: 'row',
    gap: scale(16),
    paddingHorizontal: scale(4),
  },
  auctionCard: {
    width: scale(280),
    backgroundColor: 'white',
    borderRadius: scale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(12),
    elevation: 6,
  },
  auctionInfo: {
    padding: scale(16),
  },
  auctionPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: verticalScale(12),
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
  },
});

export default HomeSkeleton; 