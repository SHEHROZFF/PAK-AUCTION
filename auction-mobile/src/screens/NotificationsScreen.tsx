import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  clearError 
} from '../store/slices/notificationsSlice';
import { THEME_COLORS } from '../constants/api';
import { scale, verticalScale, scaleFont } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading, error } = useAppSelector((state) => state.notifications);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      console.log('🔄 Loading notifications...');
      const result = await dispatch(fetchNotifications({ page: 1, limit: 50 }));
      console.log('📱 Notifications result:', result);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleNotificationPress = async (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification.id));
    }

    // Navigate based on notification type
    if (notification.auction?.id) {
      navigation.navigate('ProductDetail', { id: notification.auction.id });
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      Alert.alert(
        'Mark All as Read',
        `Mark all ${unreadCount} unread notifications as read?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Mark All', 
            onPress: () => dispatch(markAllNotificationsAsRead())
          }
        ]
      );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BID_PLACED':
        return 'hand-right';
      case 'BID_OUTBID':
        return 'warning';
      case 'AUCTION_WON':
        return 'trophy';
      case 'AUCTION_ENDED':
        return 'time';
      case 'AUCTION_STARTING':
        return 'play';
      case 'SYSTEM':
        return 'settings';
      case 'ANNOUNCEMENT':
        return 'megaphone';
      case 'GENERAL':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'BID_PLACED':
        return THEME_COLORS.primary[600];
      case 'BID_OUTBID':
        return THEME_COLORS.warning;
      case 'AUCTION_WON':
        return THEME_COLORS.success;
      case 'AUCTION_ENDED':
        return THEME_COLORS.gray[600];
      case 'AUCTION_STARTING':
        return THEME_COLORS.primary[500];
      case 'SYSTEM':
        return THEME_COLORS.error;
      case 'ANNOUNCEMENT':
        return THEME_COLORS.primary[700];
      case 'GENERAL':
        return THEME_COLORS.gray[500];
      default:
        return THEME_COLORS.gray[500];
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: `${getNotificationIconColor(item.type)}15` }
        ]}>
          <Ionicons 
            name={getNotificationIcon(item.type)} 
            size={scale(24)} 
            color={getNotificationIconColor(item.type)} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.notificationTitle,
            !item.isRead && styles.unreadText
          ]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          {item.auction && (
            <Text style={styles.auctionTitle} numberOfLines={1}>
              📦 {item.auction.title}
            </Text>
          )}
          <Text style={styles.timeText}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
        
        {!item.isRead && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateCard}>
        <Ionicons 
          name="notifications-outline" 
          size={scale(64)} 
          color={THEME_COLORS.gray[300]} 
        />
        <Text style={styles.emptyStateText}>No Notifications</Text>
        <Text style={styles.emptyStateSubtext}>
          You're all caught up! New notifications will appear here.
        </Text>
      </View>
    </View>
  );

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={scale(24)} color={THEME_COLORS.gray[700]} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Notifications</Text>
          
          {unreadCount > 0 && (
            <TouchableOpacity 
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Mark All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <View style={styles.unreadBanner}>
            <Ionicons name="notifications" size={scale(16)} color={THEME_COLORS.primary[600]} />
            <Text style={styles.unreadBannerText}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsListContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLORS.primary[600]]}
              tintColor={THEME_COLORS.primary[600]}
            />
          }
          ListEmptyComponent={!loading ? <EmptyState /> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: scale(20),
    marginTop: verticalScale(20),
    borderRadius: scale(20),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(16),
    elevation: 6,
  },
  backButton: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    flex: 1,
    textAlign: 'center',
  },
  markAllButton: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: THEME_COLORS.primary[600],
    borderRadius: scale(12),
  },
  markAllText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: 'white',
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${THEME_COLORS.primary[600]}10`,
    marginHorizontal: scale(20),
    marginTop: verticalScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: `${THEME_COLORS.primary[600]}20`,
  },
  unreadBannerText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: THEME_COLORS.primary[600],
    marginLeft: scale(8),
  },
  notificationsList: {
    flex: 1,
    marginTop: verticalScale(16),
  },
  notificationsListContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(120),
  },
  notificationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(8),
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: scale(4),
    borderLeftColor: THEME_COLORS.primary[600],
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: scale(16),
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(4),
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[600],
    lineHeight: scaleFont(20),
    marginBottom: verticalScale(6),
  },
  auctionTitle: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.primary[600],
    fontWeight: '500',
    marginBottom: verticalScale(4),
  },
  timeText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[400],
    fontWeight: '500',
  },
  unreadDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: THEME_COLORS.primary[600],
    marginTop: verticalScale(4),
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  emptyStateText: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: THEME_COLORS.gray[600],
    marginTop: verticalScale(20),
    marginBottom: verticalScale(8),
  },
  emptyStateSubtext: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default NotificationsScreen; 