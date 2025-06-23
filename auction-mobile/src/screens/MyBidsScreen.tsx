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
import { fetchUserBids } from '../store/slices/userSlice';
import { THEME_COLORS } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';
import { getFullImageUrl } from '../constants/api';
import { UserBid } from '../store/slices/userSlice';
import { formatCurrency } from '../utils/formatCurrency';

interface MyBidsScreenProps {
  navigation: any;
}

const MyBidsScreen: React.FC<MyBidsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { bids, bidsLoading, bidsPagination } = useAppSelector((state) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      await dispatch(fetchUserBids({ page: 1, limit: 20 })).unwrap();
    } catch (error) {
      console.error('Error loading bids:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadBids();
    setIsRefreshing(false);
  };

  const handleAuctionPress = (auctionId: string) => {
    navigation.navigate('ProductDetail', { id: auctionId });
  };

  const getBidStatus = (bid: UserBid) => {
    const auction = bid.auction;
    if (!auction.endTime) return { status: 'active', color: THEME_COLORS.primary[600] };
    
    const isEnded = new Date(auction.endTime) <= new Date();
    if (!isEnded) return { status: 'active', color: THEME_COLORS.primary[600] };
    
    // Check if this is the highest bid (winner)
    const isWinning = bid.amount >= (auction.currentBid || auction.basePrice || 0);
    if (isWinning) return { status: 'won', color: THEME_COLORS.success };
    
    return { status: 'lost', color: THEME_COLORS.error };
  };

  const renderBidItem = ({ item }: { item: UserBid }) => {
    if (!item || !item.auction) return null;

    const auction = item.auction;
    const imageUrl = auction.images && auction.images.length > 0 && auction.images[0].url
      ? getFullImageUrl(auction.images[0].url)
      : 'https://via.placeholder.com/300x200?text=No+Image';

    const bidStatus = getBidStatus(item);
    const isActive = auction.endTime ? new Date(auction.endTime) > new Date() : true;

    return (
      <TouchableOpacity
        style={styles.bidCard}
        onPress={() => handleAuctionPress(auction.id || auction._id)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUrl }} style={styles.auctionImage} />
        
        <View style={styles.bidContent}>
          <View style={styles.bidHeader}>
            <Text style={styles.auctionTitle} numberOfLines={2}>
              {auction.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${bidStatus.color}20` }]}>
              <Text style={[styles.statusText, { color: bidStatus.color }]}>
                {bidStatus.status === 'won' ? 'Won' : bidStatus.status === 'lost' ? 'Lost' : 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.bidMeta}>
            <View style={styles.categoryRow}>
              <Ionicons name="pricetag-outline" size={scale(14)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.categoryText}>
                {(auction.category && auction.category.name) || 'General'}
              </Text>
            </View>
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={scale(14)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.timeText}>
                Bid placed {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.bidPricing}>
            <View style={styles.bidInfo}>
              <Text style={styles.bidLabel}>Your Bid</Text>
              <Text style={styles.yourBid}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.currentBid}>
                Current: {formatCurrency(auction.currentBid || auction.basePrice || 0)}
              </Text>
            </View>
            
            <View style={styles.bidStats}>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name={bidStatus.status === 'won' ? 'trophy' : bidStatus.status === 'lost' ? 'close-circle' : 'time'} 
                  size={scale(16)} 
                  color={bidStatus.color} 
                />
                <Text style={[styles.statusLabel, { color: bidStatus.color }]}>
                  {bidStatus.status === 'won' ? 'Winner!' : bidStatus.status === 'lost' ? 'Outbid' : 'Bidding'}
                </Text>
              </View>
              <Text style={styles.totalBids}>
                {auction._count?.bids || 0} total bids
              </Text>
              <Text style={styles.auctionStatus}>
                {isActive ? 'Auction Active' : 'Auction Ended'}
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
        <Ionicons name="trending-up-outline" size={scale(64)} color={THEME_COLORS.gray[400]} />
        <Text style={styles.emptyStateText}>No Bids Yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Start bidding on auctions to see your bids here
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
            <Text style={styles.headerTitle}>My Bids</Text>
            <View style={styles.placeholder} />
          </View>
          
          {bidsPagination && (
            <Text style={styles.resultsCount}>
              {bidsPagination.totalCount} bid{bidsPagination.totalCount !== 1 ? 's' : ''} placed
            </Text>
          )}
        </View>

        {/* Bids List */}
        <FlatList
          data={bids}
          renderItem={renderBidItem}
          keyExtractor={(item) => item?.id || item?._id || Math.random().toString()}
          style={styles.bidsList}
          contentContainerStyle={styles.bidsListContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLORS.primary[600]]}
              tintColor={THEME_COLORS.primary[600]}
            />
          }
          ListEmptyComponent={!bidsLoading ? <EmptyState /> : null}
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
  bidsList: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  bidsListContent: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(120),
  },
  bidCard: {
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
  bidContent: {
    padding: scale(20),
  },
  bidHeader: {
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
  statusText: {
    fontSize: scaleFont(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bidMeta: {
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    marginLeft: scale(6),
    fontWeight: '500',
  },
  bidPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bidInfo: {
    flex: 1,
  },
  bidLabel: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    marginBottom: verticalScale(2),
    fontWeight: '500',
  },
  yourBid: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
    marginBottom: verticalScale(4),
  },
  currentBid: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[400],
    fontWeight: '500',
  },
  bidStats: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  statusLabel: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    marginLeft: scale(4),
  },
  totalBids: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
    marginBottom: verticalScale(2),
  },
  auctionStatus: {
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

export default MyBidsScreen; 