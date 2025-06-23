import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUserWatchlist } from '../store/slices/userSlice';
import { THEME_COLORS } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';
import { getFullImageUrl } from '../constants/api';
import { UserWatchlistItem } from '../store/slices/userSlice';
import { formatCurrency } from '../utils/formatCurrency';

interface WatchlistScreenProps {
  navigation: any;
}

const WatchlistScreen: React.FC<WatchlistScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { watchlist, watchlistLoading, watchlistPagination } = useAppSelector((state) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      await dispatch(fetchUserWatchlist({ page: 1, limit: 20 })).unwrap();
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadWatchlist();
    setIsRefreshing(false);
  };

  const handleAuctionPress = (auctionId: string) => {
    navigation.navigate('ProductDetail', { id: auctionId });
  };

  const renderWatchlistItem = ({ item }: { item: UserWatchlistItem }) => {
    if (!item || !item.auction) return null;

    const auction = item.auction;
    const imageUrl = auction.images && auction.images.length > 0 && auction.images[0].url
      ? getFullImageUrl(auction.images[0].url)
      : 'https://via.placeholder.com/300x200?text=No+Image';

    const isActive = auction.endTime ? new Date(auction.endTime) > new Date() : false;

    return (
      <TouchableOpacity
        style={styles.watchlistCard}
        onPress={() => handleAuctionPress(auction.id || auction._id)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUrl }} style={styles.auctionImage} />
        
        <View style={styles.auctionContent}>
          <View style={styles.auctionHeader}>
            <Text style={styles.auctionTitle} numberOfLines={2}>
              {auction.title}
            </Text>
            <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.endedBadge]}>
              <Text style={[styles.statusText, isActive ? styles.activeText : styles.endedText]}>
                {isActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </View>

          <View style={styles.auctionMeta}>
            <View style={styles.categoryRow}>
              <Ionicons name="pricetag-outline" size={scale(14)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.categoryText}>
                {(auction.category && auction.category.name) || 'General'}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={scale(14)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.locationText}>Pakistan</Text>
            </View>
          </View>

          <View style={styles.auctionPricing}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.currentBid}>
                {formatCurrency(auction.currentBid || auction.basePrice || 0)}
              </Text>
              <Text style={styles.basePrice}>
                Base: {formatCurrency(auction.basePrice || 0)}
              </Text>
            </View>
            
            <View style={styles.auctionStats}>
              <View style={styles.timeContainer}>
                <Ionicons 
                  name="time-outline" 
                  size={scale(16)} 
                  color={isActive ? THEME_COLORS.success : THEME_COLORS.error} 
                />
                <Text style={[styles.timeLeft, { color: isActive ? THEME_COLORS.success : THEME_COLORS.error }]}>
                  {isActive ? 'Active' : 'Ended'}
                </Text>
              </View>
              <Text style={styles.bidsCount}>
                {auction._count?.bids || 0} bids
              </Text>
              <Text style={styles.addedDate}>
                Added {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateCard}>
        <Ionicons name="heart-outline" size={scale(64)} color={THEME_COLORS.gray[400]} />
        <Text style={styles.emptyStateText}>No Watchlist Items</Text>
        <Text style={styles.emptyStateSubtext}>
          Items you add to your watchlist will appear here
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Products')}
          activeOpacity={0.8}
        >
          <Text style={styles.browseButtonText}>Browse Auctions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={scale(24)} color={THEME_COLORS.gray[800]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Watchlist</Text>
            <View style={styles.placeholder} />
          </View>
          
          {watchlistPagination && (
            <Text style={styles.resultsCount}>
              {watchlistPagination.totalCount} item{watchlistPagination.totalCount !== 1 ? 's' : ''} in watchlist
            </Text>
          )}
        </View>

        {/* Watchlist Items */}
        <FlatList
          data={watchlist}
          renderItem={renderWatchlistItem}
          keyExtractor={(item) => item?.id || item?._id || Math.random().toString()}
          style={styles.watchlistList}
          contentContainerStyle={styles.watchlistListContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLORS.primary[600]]}
              tintColor={THEME_COLORS.primary[600]}
            />
          }
          ListEmptyComponent={!watchlistLoading ? <EmptyState /> : null}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </PatternBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: THEME_COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  placeholder: {
    width: scale(44),
  },
  resultsCount: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
    textAlign: 'center',
  },
  watchlistList: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  watchlistListContent: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(120),
  },
  watchlistCard: {
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
  auctionImage: {
    width: '100%',
    height: scale(200),
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
  auctionTitle: {
    flex: 1,
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: THEME_COLORS.gray[800],
    marginRight: scale(12),
  },
  statusBadge: {
    borderRadius: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },
  activeBadge: {
    backgroundColor: THEME_COLORS.success + '20',
  },
  endedBadge: {
    backgroundColor: THEME_COLORS.error + '20',
  },
  statusText: {
    fontSize: scaleFont(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activeText: {
    color: THEME_COLORS.success,
  },
  endedText: {
    color: THEME_COLORS.error,
  },
  auctionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[600],
    marginLeft: scale(6),
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[600],
    marginLeft: scale(6),
    fontWeight: '500',
  },
  auctionPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    marginBottom: verticalScale(2),
    fontWeight: '500',
  },
  currentBid: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
    marginBottom: verticalScale(4),
  },
  basePrice: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[400],
    fontWeight: '500',
  },
  auctionStats: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  timeLeft: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    marginLeft: scale(4),
  },
  bidsCount: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  addedDate: {
    fontSize: scaleFont(10),
    color: THEME_COLORS.gray[400],
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(60),
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(24),
    padding: scale(40),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    borderWidth: scale(1.5),
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  emptyStateText: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: THEME_COLORS.gray[600],
    marginTop: verticalScale(20),
  },
  emptyStateSubtext: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    marginTop: verticalScale(8),
    textAlign: 'center',
    fontWeight: '500',
  },
  browseButton: {
    backgroundColor: THEME_COLORS.primary[600],
    borderRadius: scale(20),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(32),
    marginTop: verticalScale(24),
    shadowColor: THEME_COLORS.primary[600],
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(12),
    elevation: 8,
  },
  browseButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: 'white',
  },
});

export default WatchlistScreen; 