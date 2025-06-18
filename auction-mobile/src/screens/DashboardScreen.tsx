import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import Toast from 'react-native-toast-message';
import { THEME_COLORS } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stats, recentAuctions, recentBids, loading } = useAppSelector((state) => state.dashboard);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Loading dashboard data...');
      const result = await dispatch(fetchDashboardData());
      console.log('✅ Dashboard data loaded:', result);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data. Please try again.',
      });
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, gradient }: any) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={scale(32)} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
    </View>
  );

  const ActionCard = ({ icon, title, subtitle, onPress, iconColor }: any) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIconWrapper, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={scale(32)} color={iconColor} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ icon, title, subtitle, time, iconColor }: any) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconWrapper, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={scale(20)} color={iconColor} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );

  // Show skeleton loading while data is being fetched
  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  // Default stats if not loaded yet
  const displayStats = stats || {
    activeAuctions: 0,
    wonAuctions: 0,
    totalBids: 0,
    watchlistItems: 0,
  };

  console.log('📊 Dashboard State:', { 
    stats, 
    recentAuctions: recentAuctions?.length || 0, 
    recentBids: recentBids?.length || 0,
    loading 
  });

  // Convert recent auctions and bids to activity format
  const realActivity: Array<{
    id: string;
    type: 'bid' | 'auction' | 'won' | 'watchlist';
    title: string;
    subtitle: string;
    time: string;
    auctionId?: string;
    icon: string;
    iconColor: string;
  }> = [];
  
  // Add recent bids to activity
  if (recentBids && recentBids.length > 0) {
    recentBids.forEach((bid: any, index: number) => {
      realActivity.push({
        id: `bid-${bid._id || index}`,
        type: 'bid' as const,
        title: 'You placed a bid',
        subtitle: bid.auction?.title || 'Unknown auction',
        time: new Date(bid.createdAt).toLocaleDateString(),
        auctionId: bid.auction?._id,
        icon: 'hand-left',
        iconColor: THEME_COLORS.primary[600],
      });
    });
  }

  // Add recent auctions to activity
  if (recentAuctions && recentAuctions.length > 0) {
    recentAuctions.slice(0, 3).forEach((auction: any, index: number) => {
      realActivity.push({
        id: `auction-${auction._id || index}`,
        type: 'auction' as const,
        title: 'Your auction is active',
        subtitle: auction.title || 'Unknown auction',
        time: new Date(auction.createdAt).toLocaleDateString(),
        auctionId: auction._id,
        icon: 'hammer',
        iconColor: THEME_COLORS.success,
      });
    });
  }

  // Limit to 5 items
  const displayActivity = realActivity.slice(0, 5);

  // Fallback activity ONLY if no real data AND not loading
  const fallbackActivity = [
    {
      id: '1',
      type: 'bid' as const,
      title: 'You placed a bid',
      subtitle: 'Samsung Galaxy S22 Ultra',
      time: '2 hours ago',
      auctionId: '1',
      icon: 'hand-left',
      iconColor: THEME_COLORS.primary[600],
    },
    {
      id: '2',
      type: 'won' as const,
      title: 'Auction won!',
      subtitle: 'MacBook Pro M2',
      time: '1 day ago',
      auctionId: '2',
      icon: 'trophy',
      iconColor: THEME_COLORS.success,
    },
    {
      id: '3',
      type: 'watchlist' as const,
      title: 'Added to watchlist',
      subtitle: 'Vintage Camera',
      time: '3 days ago',
      auctionId: '3',
      icon: 'heart',
      iconColor: THEME_COLORS.error,
    },
  ];

  // Show real data if available, otherwise show empty state or fallback
  const finalActivity = displayActivity.length > 0 ? displayActivity : 
    (!loading && stats ? [] : fallbackActivity); // Only show fallback if we haven't loaded data yet

  console.log('🎯 Final Activity:', { 
    realActivityCount: displayActivity.length, 
    finalActivityCount: finalActivity.length,
    showingFallback: finalActivity === fallbackActivity 
  });

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={onRefresh}
              tintColor={THEME_COLORS.primary[600]}
              colors={[THEME_COLORS.primary[600]]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning! ☀️</Text>
              <Text style={styles.username}>{user?.firstName} {user?.lastName}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Activity</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Active Auctions"
                value={displayStats.activeAuctions}
                icon="hammer"
                color={THEME_COLORS.primary[600]}
              />
              <StatCard
                title="Won Auctions"
                value={displayStats.wonAuctions}
                icon="trophy"
                color={THEME_COLORS.success}
              />
              <StatCard
                title="Total Bids"
                value={displayStats.totalBids}
                icon="hand-left"
                color={THEME_COLORS.warning}
              />
              <StatCard
                title="Watchlist"
                value={displayStats.watchlistItems}
                icon="heart"
                color={THEME_COLORS.error}
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <ActionCard
                icon="add-circle"
                title="Sell Product"
                subtitle="List your item"
                iconColor={THEME_COLORS.primary[600]}
                onPress={() => navigation.navigate('SellProduct')}
              />

              <ActionCard
                icon="search"
                title="Browse"
                subtitle="Find auctions"
                iconColor={THEME_COLORS.success}
                onPress={() => navigation.navigate('Products')}
              />

              <ActionCard
                icon="notifications"
                title="Notifications"
                subtitle="View updates"
                iconColor={THEME_COLORS.warning}
                onPress={() => console.log('Notifications')}
              />

              <ActionCard
                icon="settings"
                title="Settings"
                subtitle="Account settings"
                iconColor={THEME_COLORS.gray[600]}
                onPress={() => navigation.navigate('Profile')}
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              {finalActivity.length > 0 ? (
                finalActivity.map((item: any, index: number) => (
                  <ActivityItem
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    subtitle={item.subtitle}
                    time={item.time}
                    iconColor={item.iconColor}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={scale(48)} color={THEME_COLORS.gray[400]} />
                  <Text style={styles.emptyStateTitle}>No Recent Activity</Text>
                  <Text style={styles.emptyStateText}>
                    Start bidding on auctions to see your activity here!
                  </Text>
                </View>
              )}
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
    paddingBottom: verticalScale(120), // Space for bottom navigation
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
  greeting: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    marginBottom: verticalScale(4),
    fontWeight: '500',
  },
  username: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 5,
  },
  avatar: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: THEME_COLORS.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: 'white',
  },
  statsSection: {
    marginTop: verticalScale(16),
  },
  section: {
    marginTop: verticalScale(16),
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(20),
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
  statIconContainer: {
    opacity: 0.8,
  },
  statValue: {
    fontSize: scaleFont(32),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: verticalScale(4),
  },
  statTitle: {
    fontSize: scaleFont(14),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
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
  actionIconWrapper: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  actionTitle: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
    textAlign: 'center',
  },
  activityList: {
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
  activityIconWrapper: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(2),
  },
  activitySubtitle: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[600],
    marginBottom: verticalScale(4),
    fontWeight: '500',
  },
  activityTime: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyStateTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[600],
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptyStateText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
});

export default DashboardScreen; 