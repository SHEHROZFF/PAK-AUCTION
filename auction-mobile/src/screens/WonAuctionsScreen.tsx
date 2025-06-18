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
import { fetchUserWonAuctions } from '../store/slices/userSlice';
import { THEME_COLORS } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';
import { getFullImageUrl } from '../constants/api';
import { UserWonAuction } from '../store/slices/userSlice';

interface WonAuctionsScreenProps {
  navigation: any;
}

const WonAuctionsScreen: React.FC<WonAuctionsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { wonAuctions, wonAuctionsLoading, wonAuctionsPagination } = useAppSelector((state) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadWonAuctions();
  }, []);

  const loadWonAuctions = async () => {
    try {
      await dispatch(fetchUserWonAuctions({ page: 1, limit: 20 })).unwrap();
    } catch (error) {
      console.error('Error loading won auctions:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadWonAuctions();
    setIsRefreshing(false);
  };

  const handleAuctionPress = (auctionId: string) => {
    navigation.navigate('ProductDetail', { id: auctionId });
  };

  const renderWonAuctionItem = ({ item }: { item: UserWonAuction }) => {
    if (!item) return null;

    const imageUrl = item.images && item.images.length > 0 && item.images[0].url
      ? getFullImageUrl(item.images[0].url)
      : 'https://via.placeholder.com/300x200?text=No+Image';

    const isPaid = item.status === 'SOLD';

    return (
      <TouchableOpacity
        style={styles.wonAuctionCard}
        onPress={() => handleAuctionPress(item.id || item._id)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUrl }} style={styles.auctionImage} />
        
        <View style={styles.auctionContent}>
          <View style={styles.auctionHeader}>
            <Text style={styles.auctionTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.wonBadge]}>
              <Text style={[styles.statusText, isPaid ? styles.paidText : styles.wonText]}>
                {isPaid ? 'Paid' : 'Won'}
              </Text>
            </View>
          </View>

          <View style={styles.auctionMeta}>
            <View style={styles.categoryRow}>
              <Ionicons name="pricetag-outline" size={scale(14)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.categoryText}>
                {(item.category && item.category.name) || 'General'}
              </Text>
            </View>
            <View style={styles.sellerRow}>
              <Ionicons name="person-outline" size={scale(14)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.sellerText}>
                {item.seller ? `${item.seller.firstName} ${item.seller.lastName}` : 'Unknown Seller'}
              </Text>
            </View>
          </View>

          <View style={styles.auctionPricing}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Winning Bid</Text>
              <Text style={styles.winningBid}>
                Rs. {(item.winningBid || item.currentBid || 0).toLocaleString()}
              </Text>
              <Text style={styles.basePrice}>
                Base: Rs. {(item.basePrice || 0).toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.auctionStats}>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name="trophy" 
                  size={scale(16)} 
                  color={THEME_COLORS.warning} 
                />
                <Text style={[styles.statusLabel, { color: THEME_COLORS.warning }]}>
                  Winner!
                </Text>
              </View>
              <Text style={styles.totalBids}>
                {item._count?.bids || 0} total bids
              </Text>
              <Text style={styles.endDate}>
                Won on {new Date(item.endTime).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {!isPaid && (
            <View style={styles.paymentNotice}>
              <Ionicons name="warning-outline" size={scale(16)} color={THEME_COLORS.warning} />
              <Text style={styles.paymentNoticeText}>
                Payment required to complete purchase
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateCard}>
        <Ionicons name="trophy-outline" size={scale(64)} color={THEME_COLORS.gray[400]} />
        <Text style={styles.emptyStateText}>No Won Auctions</Text>
        <Text style={styles.emptyStateSubtext}>
          Win some auctions to see them here
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
            <Text style={styles.headerTitle}>Won Auctions</Text>
            <View style={styles.placeholder} />
          </View>
          
          {wonAuctionsPagination && (
            <Text style={styles.resultsCount}>
              {wonAuctionsPagination.totalCount} auction{wonAuctionsPagination.totalCount !== 1 ? 's' : ''} won
            </Text>
          )}
        </View>

        {/* Won Auctions List */}
        <FlatList
          data={wonAuctions}
          renderItem={renderWonAuctionItem}
          keyExtractor={(item) => item?.id || item?._id || Math.random().toString()}
          style={styles.wonAuctionsList}
          contentContainerStyle={styles.wonAuctionsListContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLORS.primary[600]]}
              tintColor={THEME_COLORS.primary[600]}
            />
          }
          ListEmptyComponent={!wonAuctionsLoading ? <EmptyState /> : null}
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
  wonAuctionsList: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  wonAuctionsListContent: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(120),
  },
  wonAuctionCard: {
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
  wonBadge: {
    backgroundColor: THEME_COLORS.warning + '20',
  },
  paidBadge: {
    backgroundColor: THEME_COLORS.success + '20',
  },
  statusText: {
    fontSize: scaleFont(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  wonText: {
    color: THEME_COLORS.warning,
  },
  paidText: {
    color: THEME_COLORS.success,
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
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerText: {
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
  winningBid: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.warning,
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
  endDate: {
    fontSize: scaleFont(10),
    color: THEME_COLORS.gray[400],
    fontWeight: '500',
  },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.warning + '10',
    borderRadius: scale(12),
    padding: scale(12),
    marginTop: verticalScale(12),
  },
  paymentNoticeText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.warning,
    fontWeight: '600',
    marginLeft: scale(8),
    flex: 1,
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

export default WonAuctionsScreen; 