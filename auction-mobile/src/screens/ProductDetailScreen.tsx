import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchAuctionById, clearCurrentAuction, placeBid, toggleWatchlist } from '../store/slices/auctionsSlice';
import { THEME_COLORS, getFullImageUrl, API_BASE_URL } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import Button from '../components/common/Button';
import PatternBackground from '../components/common/PatternBackground';
import ProductDetailSkeleton from '../components/skeletons/ProductDetailSkeleton';
import Toast from 'react-native-toast-message';
import { RootState } from '../store';
import { formatCurrency, getCurrencySymbol } from '../utils/formatCurrency';

const { width: screenWidth } = Dimensions.get('window');

interface ProductDetailScreenProps {
  navigation: any;
  route?: {
    params?: {
      id?: string;
    };
  };
}

interface BidHistoryItem {
  id: string;
  amount: number;
  bidder: {
    firstName: string;
    lastName: string;
    username: string;
    profilePhoto?: string;
  };
  createdAt: string;
  isWinning?: boolean;
}

interface PaymentStatus {
  hasPaid: boolean;
  auctionId: string;
  payment?: {
    id: string;
    amount: number;
    paidAt: string;
  };
}

interface UserBidStatus {
  hasUserBid: boolean;
  userBid?: {
    id: string;
    amount: number;
    isWinning: boolean;
    createdAt: string;
  };
  minBidAmount: number;
  canBid: boolean;
  auctionStatus: string;
  currentHighestBid: number;
}

// Image Slider Component
const ImageSlider: React.FC<{ images: any[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const renderImageItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.imageSlideContainer}>
      <Image
        source={{ uri: getFullImageUrl(item.url) }}
        style={styles.sliderImage}
        resizeMode="cover"
      />
    </View>
  );

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  return (
    <View style={styles.imageSliderContainer}>
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => `image-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      
      {/* Image Indicators */}
      {images.length > 1 && (
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>
      )}
      
      {/* Image Counter */}
      {images.length > 1 && (
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentIndex + 1} / {images.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentAuction, loading, error } = useSelector((state: RootState) => state.auctions);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [bidAmount, setBidAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [userBidStatus, setUserBidStatus] = useState<UserBidStatus | null>(null);
  const [watchlistStatus, setWatchlistStatus] = useState<{ isWatched: boolean }>({ isWatched: false });
  const [loadingBids, setLoadingBids] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auctionId = route?.params?.id;

  useEffect(() => {
    if (auctionId) {
      loadAuctionDetails();
    }
  }, [auctionId]);

  useEffect(() => {
    if (currentAuction && isAuthenticated) {
      loadUserSpecificData();
    }
  }, [currentAuction, isAuthenticated]);

  useEffect(() => {
    if (currentAuction?.endTime) {
      const timer = setInterval(() => {
        updateTimeRemaining();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentAuction?.endTime]);

  useEffect(() => {
    if (currentAuction) {
      loadBidHistory();
    }
  }, [currentAuction]);

  const loadAuctionDetails = async () => {
    if (!auctionId) return;
    
    try {
      await dispatch(fetchAuctionById(auctionId)).unwrap();
    } catch (error) {
      console.error('Error loading auction:', error);
      Alert.alert('Error', 'Failed to load auction details');
    }
  };

  const loadUserSpecificData = async () => {
    if (!auctionId || !isAuthenticated) return;

    try {
      await Promise.all([
        loadPaymentStatus(),
        loadUserBidStatus(),
        loadWatchlistStatus()
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPaymentStatus = async () => {
    if (!auctionId || !isAuthenticated) return;
    
    setLoadingPayment(true);
    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.getPaymentStatus(auctionId);
      if (response.success) {
        setPaymentStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading payment status:', error);
    } finally {
      setLoadingPayment(false);
    }
  };

  const loadUserBidStatus = async () => {
    if (!auctionId || !isAuthenticated) return;
    
    try {
      const { apiService } = await import('../services/api');
              const response = await apiService.getUserBid(auctionId);
      if (response.success) {
        setUserBidStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading user bid status:', error);
    }
  };

  const loadWatchlistStatus = async () => {
    if (!auctionId || !isAuthenticated) return;
    
    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.getWatchlistStatus(auctionId);
      if (response.success) {
        setWatchlistStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading watchlist status:', error);
    }
  };

  const loadBidHistory = async () => {
    if (!auctionId) return;
    
    setLoadingBids(true);
    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.getAuctionBids(auctionId);
      if (response.success) {
        setBidHistory(response.data.bids || []);
      }
    } catch (error) {
      console.error('Error loading bid history:', error);
    } finally {
      setLoadingBids(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!currentAuction?.endTime) return;
    
    const now = new Date().getTime();
    const endTime = new Date(currentAuction.endTime).getTime();
    const difference = endTime - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    } else {
      setTimeRemaining('Auction Ended');
    }
  };

  const handleBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Bid Amount',
        text2: 'Please enter a valid bid amount',
        position: 'bottom'
      });
      return;
    }
    
    // Check if bid is at least the minimum amount
    const amount = parseFloat(bidAmount);
    const minBid = userBidStatus?.minBidAmount || currentAuction?.basePrice || 0;
    
    if (amount < minBid) {
      Toast.show({
        type: 'error',
        text1: 'Bid Too Low',
        text2: `Minimum bid amount is ${formatCurrency(minBid)}`,
        position: 'bottom'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { apiService } = await import('../services/api');
      const response = await apiService.placeBid(auctionId, amount);
      
      if (response.success) {
      Toast.show({
        type: 'success',
          text1: 'Bid Placed Successfully',
          text2: `Your bid of ${formatCurrency(amount)} has been placed`,
          position: 'bottom'
      });
      
        // Refresh auction data and bid status
        await loadAuctionDetails();
        await loadUserBidStatus();
        await loadBidHistory();
        
        // Clear bid amount
        setBidAmount('');
      } else {
      Toast.show({
        type: 'error',
        text1: 'Bid Failed',
          text2: response.message || 'Failed to place bid',
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Bid error:', error);
      Toast.show({
        type: 'error',
        text1: 'Bid Failed',
        text2: 'An error occurred while placing your bid',
        position: 'bottom'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayEntryFee = async () => {
    if (!auctionId || !currentAuction) return;
    
    Alert.alert(
      'Pay Entry Fee',
      `You need to pay an entry fee of ${formatCurrency(currentAuction.entryFee)} to participate in this auction.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
            Alert.alert('Payment', 'Payment integration needed');
          }
        }
      ]
    );
  };

  const handleToggleWatchlist = async () => {
    if (!auctionId) return;
    
    try {
      await dispatch(toggleWatchlist(auctionId)).unwrap();
      await loadWatchlistStatus();
      
      Toast.show({
        type: 'success',
        text1: watchlistStatus.isWatched ? '💔 Removed from Watchlist' : '❤️ Added to Watchlist',
        text2: watchlistStatus.isWatched ? 'Item removed from your watchlist' : 'Item added to your watchlist',
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Watchlist Error',
        text2: error.message || 'Failed to update watchlist',
        position: 'top',
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuctionDetails();
    if (isAuthenticated) {
      await loadUserSpecificData();
    }
    await loadBidHistory();
    setRefreshing(false);
  };

  const renderBidHistoryItem = ({ item, index }: { item: BidHistoryItem; index: number }) => {
    const getProfileImageUrl = (profilePhoto?: string) => {
      if (!profilePhoto) return null;
      if (profilePhoto.startsWith('http')) return profilePhoto;
      return `${API_BASE_URL.replace('/api', '')}${profilePhoto}`;
    };

    const formatTimeAgo = (dateString: string) => {
      const now = new Date();
      const bidTime = new Date(dateString);
      const diffInMinutes = Math.floor((now.getTime() - bidTime.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const isTopBid = index === 0;
    const profileImageUrl = getProfileImageUrl(item.bidder?.profilePhoto);

    return (
      <View style={[
        styles.bidHistoryItem,
        isTopBid && styles.topBidItem,
        item.isWinning && styles.winningBidItem
      ]}>
        {/* Rank indicator for top bids */}
        {index < 3 && (
          <View style={[
            styles.rankBadge,
            index === 0 && styles.goldRank,
            index === 1 && styles.silverRank,
            index === 2 && styles.bronzeRank
          ]}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
        )}

        {/* Profile section */}
        <View style={styles.bidderProfileSection}>
          <View style={styles.profileImageContainer}>
            {profileImageUrl ? (
              <Image 
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
                onError={() => console.log('Profile image failed to load')}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, isTopBid && styles.topBidAvatar]}>
                <Text style={[styles.profileInitial, isTopBid && styles.topBidInitial]}>
                  {item.bidder?.firstName?.charAt(0) || item.bidder?.username?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            {isTopBid && (
              <View style={styles.crownIcon}>
                <Ionicons name="trophy" size={scale(12)} color="#FFD700" />
              </View>
            )}
          </View>

          <View style={styles.bidderInfoSection}>
            <View style={styles.bidderNameRow}>
              <Text style={[styles.bidderDisplayName, isTopBid && styles.topBidderName]}>
                {item.bidder?.firstName && item.bidder?.lastName 
                  ? `${item.bidder.firstName} ${item.bidder.lastName}`
                  : item.bidder?.username || 'Anonymous'
                }
              </Text>
              {item.isWinning && (
                <View style={styles.winningBadge}>
                  <Ionicons name="trophy" size={scale(12)} color="#FFD700" />
                  <Text style={styles.winningBadgeText}>Leading</Text>
                </View>
              )}
            </View>
            <Text style={styles.bidTimeAgo}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Bid amount section */}
        <View style={styles.bidAmountSection}>
          <Text style={[
            styles.bidAmountText,
            isTopBid && styles.topBidAmount,
            item.isWinning && styles.winningBidAmount
          ]}>
            {formatCurrency(item.amount)}
          </Text>
          {isTopBid && (
            <Text style={styles.highestBidLabel}>Highest Bid</Text>
          )}
        </View>

        {/* Bid status indicator */}
        <View style={[
          styles.bidStatusIndicator,
          isTopBid && styles.topBidIndicator,
          item.isWinning && styles.winningBidIndicator
        ]} />
      </View>
    );
  };

  const renderBiddingSection = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.biddingCard}>
          <View style={[styles.infoBox, { backgroundColor: THEME_COLORS.primary[50] }]}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={scale(24)} color={THEME_COLORS.primary[600]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Login Required</Text>
              <Text style={styles.infoText}>Please login to participate in this auction and place bids.</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.primaryButton, styles.loginButton]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in" size={scale(20)} color="white" />
            <Text style={styles.buttonText}>Login to Bid</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentAuction?.status === 'ENDED') {
      return (
        <View style={styles.biddingCard}>
          <View style={[styles.infoBox, { backgroundColor: THEME_COLORS.gray[50] }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: THEME_COLORS.gray[100] }]}>
              <Ionicons name="flag" size={scale(24)} color={THEME_COLORS.gray[500]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: THEME_COLORS.gray[700] }]}>Auction Ended</Text>
              <Text style={styles.infoText}>This auction has ended. No more bids can be placed.</Text>
            </View>
          </View>
        </View>
      );
    }

    if (loadingPayment) {
      return (
        <View style={styles.biddingCard}>
          <View style={styles.loadingBidContainer}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary[600]} />
            <Text style={styles.loadingBidText}>Checking payment status...</Text>
          </View>
        </View>
      );
    }

    if (!paymentStatus?.hasPaid) {
      return (
        <View style={styles.biddingCard}>
          <View style={[styles.infoBox, { backgroundColor: THEME_COLORS.warning + '15' }]}>
            <View style={[styles.infoIconContainer, { backgroundColor: THEME_COLORS.warning + '20' }]}>
              <Ionicons name="card" size={scale(24)} color={THEME_COLORS.warning} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Pay Entry Fee to Bid</Text>
              <Text style={styles.infoText}>
                To participate in this auction, you need to pay an entry fee of {formatCurrency(currentAuction?.entryFee || 0)}.
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.primaryButton, styles.paymentButton]}
            onPress={handlePayEntryFee}
            activeOpacity={0.8}
          >
            <Ionicons name="card" size={scale(20)} color="white" />
            <Text style={styles.buttonText}>Pay Entry Fee ({formatCurrency(currentAuction?.entryFee || 0)})</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Main bidding section with beautiful design
    return (
      <View style={styles.biddingCard}>
        {/* Success indicator */}
        <View style={[styles.infoBox, { backgroundColor: THEME_COLORS.success + '15' }]}>
          <View style={[styles.infoIconContainer, { backgroundColor: THEME_COLORS.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={scale(24)} color={THEME_COLORS.success} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Ready to Bid</Text>
            <Text style={styles.infoText}>Entry fee paid. You can now place bids on this auction.</Text>
          </View>
        </View>

        {/* Current bid info */}
        <View style={styles.currentBidContainer}>
          <View style={styles.currentBidHeader}>
            <Text style={styles.currentBidLabel}>Current Highest Bid</Text>
            <View style={styles.bidCountBadge}>
              <Ionicons name="people" size={scale(14)} color={THEME_COLORS.primary[600]} />
              <Text style={styles.bidCountText}>{currentAuction?._count?.bids || 0} bids</Text>
            </View>
          </View>
          <Text style={styles.currentBidAmount}>
            {formatCurrency(currentAuction?.currentBid || currentAuction?.basePrice || 0)}
          </Text>
          <Text style={styles.minBidInfo}>
            Minimum next bid: {formatCurrency(userBidStatus?.minBidAmount || currentAuction?.basePrice || 0)}
          </Text>
        </View>

        {/* Bid input section */}
        <View style={styles.bidInputSection}>
          <Text style={styles.bidInputLabel}>Enter Your Bid Amount</Text>
          <View style={styles.bidInputWrapper}>
            <View style={styles.currencySymbol}>
              <Text style={styles.currencyText}>{getCurrencySymbol()}</Text>
            </View>
            <TextInput
              style={styles.bidInput}
              placeholder={`${userBidStatus?.minBidAmount || currentAuction?.basePrice || 0}`}
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              placeholderTextColor={THEME_COLORS.gray[400]}
            />
            <TouchableOpacity 
              style={[
                styles.bidButton,
                !bidAmount && styles.bidButtonDisabled
              ]}
              onPress={handleBid}
              disabled={!bidAmount}
              activeOpacity={0.8}
            >
              <Ionicons name="hammer" size={scale(18)} color="white" />
              <Text style={styles.bidButtonText}>Place Bid</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick bid buttons */}
        <View style={styles.quickBidSection}>
          <Text style={styles.quickBidLabel}>Quick Bid</Text>
          <View style={styles.quickBidButtons}>
            {[
              userBidStatus?.minBidAmount || currentAuction?.basePrice || 0,
              (userBidStatus?.minBidAmount || currentAuction?.basePrice || 0) + (currentAuction?.bidIncrement || 10),
              (userBidStatus?.minBidAmount || currentAuction?.basePrice || 0) + (currentAuction?.bidIncrement || 10) * 2,
              (userBidStatus?.minBidAmount || currentAuction?.basePrice || 0) + (currentAuction?.bidIncrement || 10) * 5
            ].map((amount, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickBidButton,
                  bidAmount === amount.toString() && styles.quickBidButtonSelected
                ]}
                onPress={() => setBidAmount(amount.toString())}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.quickBidButtonText,
                  bidAmount === amount.toString() && styles.quickBidButtonTextSelected
                ]}>
                  {formatCurrency(amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bid increment info */}
        <View style={styles.bidInfoFooter}>
          <View style={styles.bidInfoItem}>
            <Ionicons name="trending-up" size={scale(16)} color={THEME_COLORS.gray[500]} />
            <Text style={styles.bidInfoText}>Increment: {formatCurrency(currentAuction?.bidIncrement || 0)}</Text>
          </View>
          <View style={styles.bidInfoItem}>
            <Ionicons name="time" size={scale(16)} color={THEME_COLORS.gray[500]} />
            <Text style={styles.bidInfoText}>{timeRemaining}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !currentAuction) {
    return (
      <ProductDetailSkeleton />
    );
  }

  if (error || !currentAuction) {
    return (
      <PatternBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={scale(64)} color={THEME_COLORS.gray[400]} />
            <Text style={styles.errorTitle}>Auction Not Found</Text>
            <Text style={styles.errorText}>The auction you're looking for doesn't exist or has been removed.</Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </PatternBackground>
    );
  }

  const mainImage = currentAuction.images?.[0];

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={scale(24)} color={THEME_COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auction Details</Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleToggleWatchlist}
          >
            <Ionicons 
              name={watchlistStatus.isWatched ? "heart" : "heart-outline"} 
              size={scale(24)} 
              color={watchlistStatus.isWatched ? THEME_COLORS.error : THEME_COLORS.gray[700]} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Product Images Slider */}
          {currentAuction.images && currentAuction.images.length > 0 && (
            <ImageSlider images={currentAuction.images} />
          )}

          {/* Product Info */}
          <View style={styles.productCard}>
            <View style={styles.titleSection}>
              <Text style={styles.productTitle}>{currentAuction.title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{currentAuction.category?.name || 'General'}</Text>
              </View>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Ionicons name="pricetag" size={scale(16)} color={THEME_COLORS.gray[500]} />
                <Text style={styles.metaText}>Condition: {currentAuction.condition}</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="eye" size={scale(16)} color={THEME_COLORS.gray[500]} />
                <Text style={styles.metaText}>{currentAuction.viewCount} views</Text>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="time" size={scale(16)} color={THEME_COLORS.gray[500]} />
                <Text style={styles.metaText}>{timeRemaining}</Text>
              </View>
            </View>
          </View>

          {/* Pricing Info */}
          <View style={styles.pricingCard}>
            <Text style={styles.cardTitle}>Pricing Information</Text>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Current Bid</Text>
                <Text style={styles.currentPrice}>{formatCurrency(currentAuction.currentBid || currentAuction.basePrice)}</Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceLabel}>Base Price</Text>
                <Text style={styles.basePrice}>{formatCurrency(currentAuction.basePrice)}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Bid Increment</Text>
                <Text style={styles.incrementPrice}>{formatCurrency(currentAuction.bidIncrement)}</Text>
              </View>
              <View style={styles.priceRight}>
                <Text style={styles.priceLabel}>Entry Fee</Text>
                <Text style={styles.incrementPrice}>{formatCurrency(currentAuction.entryFee)}</Text>
              </View>
            </View>
          </View>

          {/* Bidding Section */}
          {renderBiddingSection()}

          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.description}>{currentAuction.description}</Text>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerCard}>
            <Text style={styles.cardTitle}>Seller Information</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitial}>
                  {currentAuction.seller?.firstName?.charAt(0) || currentAuction.seller?.username?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>
                  {currentAuction.seller?.firstName && currentAuction.seller?.lastName 
                    ? `${currentAuction.seller.firstName} ${currentAuction.seller.lastName}`
                    : currentAuction.seller?.username || 'Unknown Seller'
                  }
                </Text>
                <View style={styles.sellerBadge}>
                  <Ionicons name="checkmark-circle" size={scale(16)} color={THEME_COLORS.success} />
                  <Text style={styles.sellerBadgeText}>Verified Seller</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bid History */}
          <View style={styles.bidHistoryCard}>
            <View style={styles.bidHistoryHeader}>
              <Text style={styles.cardTitle}>Bid History</Text>
              <TouchableOpacity onPress={loadBidHistory}>
                <Ionicons name="refresh" size={scale(20)} color={THEME_COLORS.primary[600]} />
              </TouchableOpacity>
            </View>
            
            {loadingBids ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={THEME_COLORS.primary[600]} />
                <Text style={styles.loadingText}>Loading bid history...</Text>
              </View>
            ) : bidHistory.length === 0 ? (
              <View style={styles.noBidsContainer}>
                <Ionicons name="hammer" size={scale(48)} color={THEME_COLORS.gray[300]} />
                <Text style={styles.noBidsText}>Be the first one to bid</Text>
              </View>
            ) : (
              <FlatList
                data={bidHistory}
                renderItem={({ item, index }) => renderBidHistoryItem({ item, index })}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
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
  imageContainer: {
    marginHorizontal: scale(20),
    borderRadius: scale(24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
  },
  auctionImage: {
    width: scale(335), // Adjust based on screen width minus margins
    height: scale(280),
    resizeMode: 'cover',
  },
  productCard: {
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
  pricingCard: {
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
  biddingCard: {
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
  descriptionCard: {
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
  sellerCard: {
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
  cardTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(16),
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  productTitle: {
    flex: 1,
    fontSize: scaleFont(22),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginRight: scale(12),
  },
  categoryBadge: {
    backgroundColor: THEME_COLORS.primary[50],
    borderRadius: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },
  categoryText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.primary[600],
    fontWeight: '600',
  },
  metaInfo: {
    gap: verticalScale(8),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    marginLeft: scale(8),
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  priceLabel: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    marginBottom: verticalScale(4),
    fontWeight: '500',
  },
  currentPrice: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
  },
  basePrice: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: THEME_COLORS.gray[700],
  },
  incrementPrice: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: THEME_COLORS.gray[700],
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  entryFeeSection: {
    alignItems: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: `${THEME_COLORS.warning}10`,
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
    alignItems: 'center',
  },
  noticeText: {
    flex: 1,
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[700],
    marginLeft: scale(16),
    lineHeight: scaleFont(24),
    fontWeight: '500',
  },
  bidForm: {
    alignItems: 'center',
  },
  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: scale(2),
    borderColor: THEME_COLORS.primary[200],
    borderRadius: scale(16),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: 'white',
    width: '100%',
    marginBottom: verticalScale(12),
  },
  bidInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    width: scale(40),
    height: scale(52),
    backgroundColor: THEME_COLORS.gray[100],
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  currencyText: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[700],
  },
  bidInput: {
    flex: 1,
    borderWidth: scale(1),
    borderColor: THEME_COLORS.gray[300],
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    backgroundColor: 'white',
  },
  bidButton: {
    backgroundColor: THEME_COLORS.primary[600],
    borderRadius: scale(16),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLORS.primary[600],
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 8,
    minWidth: scale(120),
  },
  minBidText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    textAlign: 'center',
  },
  description: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    lineHeight: scaleFont(26),
    fontWeight: '500',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: THEME_COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  sellerInitial: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(4),
  },
  sellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerBadgeText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.success,
    fontWeight: '600',
    marginLeft: scale(4),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  loadingCard: {
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
  loadingText: {
    fontSize: scaleFont(18),
    color: THEME_COLORS.gray[600],
    fontWeight: '600',
    marginTop: verticalScale(20),
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  errorCard: {
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
  errorTitle: {
    fontSize: scaleFont(20),
    color: THEME_COLORS.gray[600],
    fontWeight: '600',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  errorText: {
    fontSize: scaleFont(20),
    color: THEME_COLORS.gray[600],
    fontWeight: '600',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  primaryButton: {
    backgroundColor: THEME_COLORS.primary[600],
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: THEME_COLORS.primary[600],
    shadowColor: THEME_COLORS.primary[600],
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(20),
    borderWidth: scale(1),
    borderColor: THEME_COLORS.primary[200],
    borderRadius: scale(16),
    marginBottom: verticalScale(20),
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(8),
  },
  infoText: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    fontWeight: '500',
  },
  bidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    borderBottomWidth: scale(1),
    borderBottomColor: THEME_COLORS.gray[200],
  },
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidderAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: THEME_COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  bidderInitial: {
    color: 'white',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
  bidderDetails: {
    flex: 1,
  },
  bidderName: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(4),
  },
  bidTime: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  bidAmountContainer: {
    alignItems: 'flex-end',
  },
  bidAmount: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
  },
  winningBid: {
    fontWeight: 'bold',
    color: THEME_COLORS.success,
  },
  winningLabel: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    color: THEME_COLORS.success,
  },
  bidHistoryCard: {
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
  bidHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  noBidsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBidsText: {
    fontSize: scaleFont(18),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  bidSeparator: {
    height: scale(1),
    backgroundColor: THEME_COLORS.gray[200],
    marginVertical: verticalScale(8),
  },
  loadingBidContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(20),
  },
  loadingBidText: {
    fontSize: scaleFont(18),
    color: THEME_COLORS.gray[600],
    fontWeight: '600',
    marginTop: verticalScale(20),
  },
  paymentButton: {
    backgroundColor: THEME_COLORS.primary[500],
    borderRadius: scale(16),
    padding: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentBidContainer: {
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
  currentBidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  currentBidLabel: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  bidCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidCountText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.primary[600],
    fontWeight: '600',
    marginLeft: scale(4),
  },
  currentBidAmount: {
    fontSize: scaleFont(28),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
  },
  minBidInfo: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    textAlign: 'center',
  },
  bidInputSection: {
    marginBottom: verticalScale(20),
  },
  bidInputLabel: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(8),
  },
  bidButtonDisabled: {
    backgroundColor: THEME_COLORS.gray[200],
  },
  bidButtonText: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: 'white',
    marginLeft: scale(8),
  },
  quickBidSection: {
    marginBottom: verticalScale(20),
  },
  quickBidLabel: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(8),
  },
  quickBidButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBidButton: {
    backgroundColor: THEME_COLORS.gray[200],
    borderRadius: scale(12),
    padding: scale(16),
  },
  quickBidButtonSelected: {
    backgroundColor: THEME_COLORS.primary[200],
  },
  quickBidButtonText: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  quickBidButtonTextSelected: {
    fontWeight: 'bold',
    color: 'white',
  },
  bidInfoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidInfoText: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[500],
    marginLeft: scale(8),
  },
  infoIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: THEME_COLORS.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Professional Bid History Styles
  bidHistoryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 4,
    borderWidth: scale(1),
    borderColor: THEME_COLORS.gray[200],
    position: 'relative',
  },
  topBidItem: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
    borderWidth: scale(2),
  },
  winningBidItem: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: THEME_COLORS.success,
  },
  rankBadge: {
    position: 'absolute',
    top: scale(-8),
    right: scale(-8),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  goldRank: {
    backgroundColor: '#FFD700',
  },
  silverRank: {
    backgroundColor: '#C0C0C0',
  },
  bronzeRank: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: scaleFont(10),
    fontWeight: 'bold',
    color: 'white',
  },
  bidderProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: scale(12),
  },
  profileImage: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: THEME_COLORS.gray[200],
  },
  profileImagePlaceholder: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: THEME_COLORS.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBidAvatar: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: scale(2),
    borderColor: '#FFD700',
  },
  profileInitial: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
  },
  topBidInitial: {
    color: '#B8860B',
  },
  crownIcon: {
    position: 'absolute',
    top: scale(-4),
    right: scale(-4),
    backgroundColor: 'white',
    borderRadius: scale(8),
    padding: scale(2),
  },
  bidderInfoSection: {
    flex: 1,
  },
  bidderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bidderDisplayName: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    flex: 1,
  },
  topBidderName: {
    color: '#B8860B',
    fontWeight: 'bold',
  },
  winningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    marginLeft: scale(8),
  },
  winningBadgeText: {
    fontSize: scaleFont(12),
    fontWeight: 'bold',
    color: '#B8860B',
    marginLeft: scale(4),
  },
  bidTimeAgo: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    marginTop: verticalScale(2),
  },
  bidAmountSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bidAmountText: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
  },
  topBidAmount: {
    fontSize: scaleFont(24),
    color: '#B8860B',
  },
  winningBidAmount: {
    color: THEME_COLORS.success,
  },
  highestBidLabel: {
    fontSize: scaleFont(12),
    color: '#B8860B',
    fontWeight: '600',
    marginTop: verticalScale(2),
  },
  bidStatusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scale(4),
    backgroundColor: THEME_COLORS.primary[300],
    borderTopLeftRadius: scale(16),
    borderBottomLeftRadius: scale(16),
  },
  topBidIndicator: {
    backgroundColor: '#FFD700',
  },
  winningBidIndicator: {
    backgroundColor: THEME_COLORS.success,
  },
  // Image Slider Styles
  imageSliderContainer: {
    marginHorizontal: scale(20),
    borderRadius: scale(24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(32),
    elevation: 12,
    position: 'relative',
  },
  imageSlideContainer: {
    width: screenWidth - scale(40),
    height: scale(280),
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: scale(16),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: scale(4),
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
  },
  imageCounter: {
    position: 'absolute',
    top: scale(16),
    right: scale(16),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(16),
  },
  imageCounterText: {
    color: 'white',
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
});

export default ProductDetailScreen; 