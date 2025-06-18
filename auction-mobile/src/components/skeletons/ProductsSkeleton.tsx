import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonLoader from '../common/SkeletonLoader';
import PatternBackground from '../common/PatternBackground';
import { scale, verticalScale } from '../../utils/responsive';

const ProductsSkeleton: React.FC = () => {
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
              <SkeletonLoader width={scale(44)} height={scale(44)} borderRadius={scale(22)} />
              <SkeletonLoader width={scale(100)} height={scale(24)} />
              <SkeletonLoader width={scale(44)} height={scale(44)} borderRadius={scale(22)} />
            </View>

            {/* Search Bar Skeleton */}
            <View style={styles.searchContainer}>
              <SkeletonLoader width="100%" height={scale(48)} borderRadius={scale(16)} />
            </View>

            {/* Active Filters Skeleton */}
            <View style={styles.activeFilters}>
              <SkeletonLoader width={scale(80)} height={scale(20)} borderRadius={scale(10)} />
              <SkeletonLoader width={scale(120)} height={scale(16)} />
            </View>
          </View>

          {/* Auction Cards Skeleton */}
          <View style={styles.auctionsContainer}>
            {[1, 2, 3, 4, 5].map((item) => (
              <View key={item} style={styles.auctionCard}>
                {/* Auction Image */}
                <SkeletonLoader width="100%" height={scale(200)} borderRadius={0} />
                
                {/* Auction Content */}
                <View style={styles.auctionContent}>
                  {/* Header: Title + Category Badge */}
                  <View style={styles.auctionHeader}>
                    <View style={styles.titleContainer}>
                      <SkeletonLoader width="80%" height={scale(18)} />
                      <SkeletonLoader width="60%" height={scale(16)} style={{ marginTop: verticalScale(4) }} />
                    </View>
                    <SkeletonLoader width={scale(60)} height={scale(28)} borderRadius={scale(16)} />
                  </View>

                  {/* Location/Condition Meta */}
                  <View style={styles.auctionMeta}>
                    <SkeletonLoader width={scale(180)} height={scale(14)} />
                  </View>

                  {/* Pricing and Stats */}
                  <View style={styles.auctionPricing}>
                    <View style={styles.priceInfo}>
                      <SkeletonLoader width={scale(80)} height={scale(12)} />
                      <SkeletonLoader width={scale(120)} height={scale(20)} style={{ marginTop: verticalScale(4) }} />
                      <SkeletonLoader width={scale(100)} height={scale(12)} style={{ marginTop: verticalScale(4) }} />
                    </View>
                    
                    <View style={styles.auctionStats}>
                      <SkeletonLoader width={scale(60)} height={scale(12)} />
                      <SkeletonLoader width={scale(50)} height={scale(12)} style={{ marginTop: verticalScale(4) }} />
                    </View>
                  </View>
                </View>
              </View>
            ))}
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
    marginBottom: verticalScale(16),
  },
  searchContainer: {
    marginBottom: verticalScale(16),
  },
  activeFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auctionsContainer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
  },
  auctionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(24),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(24),
    elevation: 10,
    borderWidth: scale(1),
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  auctionContent: {
    padding: scale(20),
  },
  auctionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  titleContainer: {
    flex: 1,
    marginRight: scale(12),
  },
  auctionMeta: {
    marginBottom: verticalScale(16),
  },
  auctionPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceInfo: {
    flex: 1,
  },
  auctionStats: {
    alignItems: 'flex-end',
  },
});

export default ProductsSkeleton;
