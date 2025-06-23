import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutUser } from '../store/slices/authSlice';
import { fetchCategories, Category } from '../store/slices/categoriesSlice';
import { fetchFeaturedAuctions, FeaturedAuction } from '../store/slices/auctionsSlice';
import Toast from 'react-native-toast-message';
import { THEME_COLORS, getFullImageUrl } from '../constants/api';
import { scale, verticalScale, scaleFont, wp, hp } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';
import HomeSkeleton from '../components/skeletons/HomeSkeleton';
import { formatCurrency } from '../utils/formatCurrency';

interface CategoryWithIcon extends Category {
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
}

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { featuredAuctions, featuredLoading } = useAppSelector((state) => state.auctions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalUsers: 0,
    completedAuctions: 0,
  });

  // Helper function to convert Font Awesome icons to Ionicons
  const convertFontAwesomeToIonicon = (fontAwesomeIcon: string): keyof typeof Ionicons.glyphMap => {
    if (!fontAwesomeIcon) return 'grid-outline';
    
    // Font Awesome to Ionicons mapping
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      // Electronics & Tech
      'fas fa-laptop': 'laptop-outline',
      'fas fa-mobile-alt': 'phone-portrait-outline',
      'fas fa-mobile': 'phone-portrait-outline',
      'fas fa-desktop': 'desktop-outline',
      'fas fa-tablet-alt': 'tablet-landscape-outline',
      'fas fa-tablet': 'tablet-landscape-outline',
      'fas fa-headphones': 'headset-outline',
      'fas fa-camera': 'camera-outline',
      'fas fa-tv': 'tv-outline',
      'fas fa-gamepad': 'game-controller-outline',
      'fas fa-microchip': 'hardware-chip-outline',
      'fas fa-keyboard': 'keypad-outline',
      'fas fa-mouse': 'radio-outline',
      
      // Fashion & Accessories
      'fas fa-tshirt': 'shirt-outline',
      'fas fa-shoe-prints': 'footsteps-outline',
      'fas fa-glasses': 'glasses-outline',
      'fas fa-ring': 'diamond-outline',
      'fas fa-watch': 'watch-outline',
      
      // Home & Garden
      'fas fa-home': 'home-outline',
      'fas fa-house': 'home-outline',
      'fas fa-couch': 'bed-outline',
      'fas fa-seedling': 'leaf-outline',
      'fas fa-hammer': 'hammer-outline',
      'fas fa-tools': 'construct-outline',
      'fas fa-wrench': 'construct-outline',
      'fas fa-screwdriver': 'construct-outline',
      
      // Sports & Recreation
      'fas fa-football-ball': 'football-outline',
      'fas fa-basketball-ball': 'basketball-outline',
      'fas fa-bicycle': 'bicycle-outline',
      'fas fa-dumbbell': 'barbell-outline',
      'fas fa-swimming-pool': 'water-outline',
      'fas fa-running': 'walk-outline',
      'fas fa-trophy': 'trophy-outline',
      
      // Books & Media
      'fas fa-book': 'book-outline',
      'fas fa-music': 'musical-notes-outline',
      'fas fa-film': 'film-outline',
      'fas fa-compact-disc': 'disc-outline',
      'fas fa-headphones-alt': 'headset-outline',
      'fas fa-video': 'videocam-outline',
      
      // Art & Collectibles
      'fas fa-palette': 'color-palette-outline',
      'fas fa-paint-brush': 'brush-outline',
      'fas fa-gem': 'diamond-outline',
      'fas fa-star': 'star-outline',
      'fas fa-award': 'ribbon-outline',
      
      // Vehicles
      'fas fa-car': 'car-outline',
      'fas fa-motorcycle': 'bicycle-outline',
      'fas fa-truck': 'car-outline',
      'fas fa-plane': 'airplane-outline',
      'fas fa-ship': 'boat-outline',
      'fas fa-train': 'train-outline',
      
      // Toys & Games
      'fas fa-puzzle-piece': 'extension-puzzle-outline',
      'fas fa-dice': 'dice-outline',
      'fas fa-robot': 'hardware-chip-outline',
      'fas fa-chess': 'grid-outline',
      
      // Health & Beauty
      'fas fa-heart': 'heart-outline',
      'fas fa-spa': 'flower-outline',
      'fas fa-prescription-bottle': 'medical-outline',
      'fas fa-stethoscope': 'medical-outline',
      'fas fa-pills': 'medical-outline',
      
      // Food & Dining
      'fas fa-utensils': 'restaurant-outline',
      'fas fa-coffee': 'cafe-outline',
      'fas fa-wine-glass': 'wine-outline',
      'fas fa-pizza-slice': 'restaurant-outline',
      'fas fa-hamburger': 'restaurant-outline',
      
      // Business & Finance
      'fas fa-briefcase': 'briefcase-outline',
      'fas fa-chart-line': 'trending-up-outline',
      'fas fa-dollar-sign': 'cash-outline',
      'fas fa-credit-card': 'card-outline',
      'fas fa-coins': 'cash-outline',
      
      // Common icons from your form
      'fas fa-tag': 'pricetag-outline',
      'fas fa-tags': 'pricetags-outline',
      'fas fa-fire': 'flame-outline',
      'fas fa-bolt': 'flash-outline',
      'fas fa-leaf': 'leaf-outline',
      'fas fa-globe': 'globe-outline',
      'fas fa-map': 'map-outline',
      'fas fa-location-arrow': 'location-outline',
      'fas fa-envelope': 'mail-outline',
      'fas fa-phone': 'call-outline',
      'fas fa-user': 'person-outline',
      'fas fa-users': 'people-outline',
      'fas fa-cog': 'settings-outline',
      'fas fa-search': 'search-outline',
      'fas fa-plus': 'add-outline',
      'fas fa-minus': 'remove-outline',
      'fas fa-times': 'close-outline',
      'fas fa-check': 'checkmark-outline',
      'fas fa-arrow-up': 'arrow-up-outline',
      'fas fa-arrow-down': 'arrow-down-outline',
      'fas fa-arrow-left': 'arrow-back-outline',
      'fas fa-arrow-right': 'arrow-forward-outline',
      'fas fa-calendar': 'calendar-outline',
      'fas fa-clock': 'time-outline',
      'fas fa-eye': 'eye-outline',
      'fas fa-lock': 'lock-closed-outline',
      'fas fa-unlock': 'lock-open-outline',
      'fas fa-key': 'key-outline',
      'fas fa-shield': 'shield-outline',
      'fas fa-database': 'server-outline',
      'fas fa-cloud': 'cloud-outline',
      'fas fa-download': 'download-outline',
      'fas fa-upload': 'cloud-upload-outline',
      'fas fa-print': 'print-outline',
      'fas fa-copy': 'copy-outline',
      'fas fa-cut': 'cut-outline',
      'fas fa-paste': 'clipboard-outline',
      'fas fa-save': 'save-outline',
      'fas fa-edit': 'create-outline',
      'fas fa-trash': 'trash-outline',
      'fas fa-folder': 'folder-outline',
      'fas fa-file': 'document-outline',
      'fas fa-image': 'image-outline',
      'fas fa-link': 'link-outline',
      'fas fa-share': 'share-outline',
      'fas fa-thumbs-up': 'thumbs-up-outline',
      'fas fa-thumbs-down': 'thumbs-down-outline',
      'fas fa-comment': 'chatbubble-outline',
      'fas fa-bell': 'notifications-outline',
      'fas fa-volume-up': 'volume-high-outline',
      'fas fa-volume-down': 'volume-low-outline',
      'fas fa-volume-mute': 'volume-mute-outline',
      'fas fa-wifi': 'wifi-outline',
      'fas fa-battery-full': 'battery-full-outline',
      'fas fa-battery-half': 'battery-half-outline',
      'fas fa-battery-empty': 'battery-dead-outline',
      'fas fa-signal': 'cellular-outline',
      'fas fa-bluetooth': 'bluetooth-outline',
      'fas fa-usb': 'hardware-chip-outline',
      'fas fa-sd-card': 'card-outline',
      'fas fa-memory': 'hardware-chip-outline',
      'fas fa-hdd': 'server-outline',
      'fas fa-floppy-disk': 'save-outline',
    };
    
    // Try exact match first
    if (iconMap[fontAwesomeIcon]) {
      return iconMap[fontAwesomeIcon];
    }
    
    // Try partial matches for common patterns
    const lowerIcon = fontAwesomeIcon.toLowerCase();
    if (lowerIcon.includes('laptop') || lowerIcon.includes('computer')) return 'laptop-outline';
    if (lowerIcon.includes('phone') || lowerIcon.includes('mobile')) return 'phone-portrait-outline';
    if (lowerIcon.includes('car') || lowerIcon.includes('auto')) return 'car-outline';
    if (lowerIcon.includes('book')) return 'book-outline';
    if (lowerIcon.includes('music')) return 'musical-notes-outline';
    if (lowerIcon.includes('game')) return 'game-controller-outline';
    if (lowerIcon.includes('home') || lowerIcon.includes('house')) return 'home-outline';
    if (lowerIcon.includes('art') || lowerIcon.includes('paint')) return 'color-palette-outline';
    if (lowerIcon.includes('sport')) return 'football-outline';
    if (lowerIcon.includes('cloth') || lowerIcon.includes('shirt')) return 'shirt-outline';
    if (lowerIcon.includes('jewelry') || lowerIcon.includes('diamond')) return 'diamond-outline';
    
    // Default fallback
    return 'grid-outline';
  };

  // Helper function to get icon based on category name or backend icon
  const getCategoryIcon = (categoryName: string, backendIcon?: string): keyof typeof Ionicons.glyphMap => {
    // First try to use the backend icon if available
    if (backendIcon) {
      return convertFontAwesomeToIonicon(backendIcon);
    }
    
    // Fallback to name-based mapping
    if (!categoryName) return 'grid-outline';
    
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'computers': 'laptop-outline',
      'electronics': 'laptop-outline',
      'antiques': 'library-outline',
      'dvd': 'disc-outline',
      'retro games': 'game-controller-outline',
      'phones': 'phone-portrait-outline',
      'art': 'color-palette-outline',
      'books': 'book-outline',
      'clothing': 'shirt-outline',
      'jewelry': 'diamond-outline',
      'sports': 'football-outline',
      'toys': 'cube-outline',
      'home': 'home-outline',
      'garden': 'leaf-outline',
      'music': 'musical-notes-outline',
      'fashion': 'shirt-outline',
      'beauty': 'flower-outline',
      'health': 'heart-outline',
      'automotive': 'car-outline',
      'collectibles': 'trophy-outline',
    };
    
    const key = categoryName.toLowerCase();
    return iconMap[key] || 'grid-outline';
  };

  // Map categories to include icons (using backend icon or fallback)
  const categoriesWithIcons: CategoryWithIcon[] = (categories || [])
    .filter(category => category && category.id && category.name) // Filter out null/undefined items
    .map(category => ({
      ...category,
      icon: getCategoryIcon(category.name, category.icon),
      count: category.auctionCount || 0,
    }));

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('🔄 Loading homepage data...');
      
      // Dispatch Redux actions to fetch data
      const results = await Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchFeaturedAuctions()),
      ]);
      
      console.log('✅ Homepage data loaded:', {
        categories: results[0],
        featuredAuctions: results[1]
      });
      
      // Load stats (TODO: Create stats API)
      setStats({
        activeAuctions: 147,
        totalUsers: 1250,
        completedAuctions: 3200,
      });
    } catch (error) {
      console.error('❌ Error loading homepage data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data. Please try again.',
      });
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Products', { search: searchQuery });
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (categoryId) {
      navigation.navigate('Products', { category: categoryId });
    }
  };

  const handleAuctionPress = (auctionId: string) => {
    if (auctionId) {
      navigation.navigate('ProductDetail', { id: auctionId });
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const renderCategoryItem = ({ item }: { item: CategoryWithIcon }) => {
    if (!item || !item.id || !item.name) return null;
    
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.categoryIconContainer}>
          <Ionicons name={item.icon} size={scale(28)} color={THEME_COLORS.primary[600]} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.count || 0} items</Text>
      </TouchableOpacity>
    );
  };

  const renderFeaturedAuction = ({ item }: { item: FeaturedAuction }) => {
    if (!item || !item.id || !item.title) return null;
    
    // Get the primary image URL with proper base URL
    const imageUrl = item.images && item.images.length > 0 
      ? getFullImageUrl(item.images.find(img => img.isPrimary)?.url || item.images[0]?.url)
      : 'https://via.placeholder.com/300x200?text=No+Image';
    
    return (
      <TouchableOpacity
        style={styles.auctionCard}
        onPress={() => handleAuctionPress(item.id)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.auctionImage} 
        />
        <View style={styles.auctionInfo}>
          <Text style={styles.auctionTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'General'}</Text>
          </View>
          
          <View style={styles.auctionPricing}>
            <View>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.currentBid}>{formatCurrency(item.currentBid || 0)}</Text>
            </View>
            <View style={styles.auctionMeta}>
              <Text style={styles.timeLeft}>{item.timeRemaining || 'N/A'}</Text>
              <Text style={styles.bidsCount}>Active</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter out null/undefined items from featured auctions
  const validFeaturedAuctions = (featuredAuctions || [])
    .filter(auction => auction && auction.id && auction.title);

  console.log('🎯 HomeScreen State:', {
    featuredAuctions: featuredAuctions?.length || 0,
    validFeaturedAuctions: validFeaturedAuctions.length,
    featuredLoading,
    categoriesLoading,
    categories: categories?.length || 0
  });

  // Show skeleton loading while data is being fetched
  const isLoading = categoriesLoading || featuredLoading;
  if (isLoading && categoriesWithIcons.length === 0 && validFeaturedAuctions.length === 0) {
    return <HomeSkeleton />;
  }

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
              colors={[THEME_COLORS.primary[600]]}
              tintColor={THEME_COLORS.primary[600]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <View style={styles.logoIcon}>
                  <Ionicons name="hammer" size={scale(28)} color={THEME_COLORS.primary[600]} />
                </View>
                <Text style={styles.logoText}>
                  Pak<Text style={styles.logoHighlight}>Auction</Text>
                </Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={scale(22)} color={THEME_COLORS.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.welcomeText}>
              Welcome back, {user?.firstName || 'User'}! 👋
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchCard}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={scale(20)} color={THEME_COLORS.gray[500]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search auctions..."
                placeholderTextColor={THEME_COLORS.gray[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={scale(20)} color={THEME_COLORS.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Platform Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${THEME_COLORS.primary[600]}15` }]}>
                  <Ionicons name="hammer" size={scale(24)} color={THEME_COLORS.primary[600]} />
                </View>
                <Text style={styles.statNumber}>{stats.activeAuctions}</Text>
                <Text style={styles.statLabel}>Active Auctions</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${THEME_COLORS.success}15` }]}>
                  <Ionicons name="people" size={scale(24)} color={THEME_COLORS.success} />
                </View>
                <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Users</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${THEME_COLORS.warning}15` }]}>
                  <Ionicons name="checkmark-circle" size={scale(24)} color={THEME_COLORS.warning} />
                </View>
                <Text style={styles.statNumber}>{stats.completedAuctions}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <FlatList
              data={categoriesWithIcons}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item?.id || Math.random().toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesGrid}
            />
          </View>

          {/* Featured Auctions */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Auctions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {(validFeaturedAuctions || []).length > 0 ? (
              <FlatList
                data={validFeaturedAuctions || []}
                renderItem={renderFeaturedAuction}
                keyExtractor={(item) => item?.id || Math.random().toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.auctionsContainer}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={scale(48)} color={THEME_COLORS.gray[400]} />
                <Text style={styles.emptyStateText}>No featured auctions yet</Text>
                <Text style={styles.emptyStateSubtext}>Check back later for exciting auctions!</Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Dashboard', { screen: 'SellProduct' })}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, styles.sellActionIcon]}>
                  <Ionicons name="add-circle" size={scale(32)} color="white" />
                </View>
                <Text style={styles.quickActionText}>Sell Item</Text>
                <Text style={styles.quickActionSubtext}>List your product</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('MyBids')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, styles.bidsActionIcon]}>
                  <Ionicons name="trending-up" size={scale(32)} color="white" />
                </View>
                <Text style={styles.quickActionText}>My Bids</Text>
                <Text style={styles.quickActionSubtext}>Track bids</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Watchlist')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, styles.watchlistActionIcon]}>
                  <Ionicons name="heart" size={scale(32)} color="white" />
                </View>
                <Text style={styles.quickActionText}>Watchlist</Text>
                <Text style={styles.quickActionSubtext}>Saved items</Text>
              </TouchableOpacity>
            </View>
            
            {/* Additional Quick Actions Row */}
            <View style={styles.quickActionsSecondRow}>
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => navigation.navigate('Products')}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={scale(24)} color={THEME_COLORS.primary[600]} />
                <Text style={styles.secondaryActionText}>Browse All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={scale(24)} color={THEME_COLORS.primary[600]} />
                <Text style={styles.secondaryActionText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => navigation.navigate('Dashboard', { screen: 'Notifications' })}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications" size={scale(24)} color={THEME_COLORS.primary[600]} />
                <Text style={styles.secondaryActionText}>Alerts</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => navigation.navigate('Dashboard', { screen: 'Settings' })}
                activeOpacity={0.7}
              >
                <Ionicons name="settings" size={scale(24)} color={THEME_COLORS.primary[600]} />
                <Text style={styles.secondaryActionText}>Settings</Text>
              </TouchableOpacity>
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
    marginBottom: verticalScale(12),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: `${THEME_COLORS.primary[600]}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  logoText: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  logoHighlight: {
    color: THEME_COLORS.primary[600],
  },
  logoutButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: THEME_COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    fontWeight: '500',
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
    backgroundColor: THEME_COLORS.gray[50],
    borderRadius: scale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(12),
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[800],
    fontWeight: '500',
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
  statsTitle: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  statNumber: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[600],
    fontWeight: '500',
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
  sectionTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(16),
  },
  viewAllText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.primary[600],
    fontWeight: '600',
  },
  categoriesGrid: {
    gap: scale(12),
  },
  categoryCard: {
    flex: 1,
    backgroundColor: THEME_COLORS.gray[50],
    borderRadius: scale(20),
    padding: scale(16),
    alignItems: 'center',
    marginHorizontal: scale(6),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(8),
    elevation: 3,
  },
  categoryIconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 4,
  },
  categoryName: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(4),
  },
  categoryCount: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  auctionsContainer: {
    paddingLeft: scale(4),
  },
  auctionCard: {
    width: scale(280),
    backgroundColor: 'white',
    borderRadius: scale(20),
    marginRight: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(16),
    elevation: 8,
    overflow: 'hidden',
  },
  auctionImage: {
    width: '100%',
    height: scale(160),
  },
  auctionInfo: {
    padding: scale(16),
  },
  auctionTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(8),
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME_COLORS.primary[50],
    borderRadius: scale(12),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(12),
  },
  categoryText: {
    fontSize: scaleFont(10),
    color: THEME_COLORS.primary[600],
    fontWeight: '600',
  },
  auctionPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    marginBottom: verticalScale(2),
  },
  currentBid: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: THEME_COLORS.primary[600],
  },
  auctionMeta: {
    alignItems: 'flex-end',
  },
  timeLeft: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.error,
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  bidsCount: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyStateText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: THEME_COLORS.gray[600],
    marginTop: verticalScale(16),
  },
  emptyStateSubtext: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[500],
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: scale(8),
  },
  quickActionButton: {
    alignItems: 'center',
    padding: scale(16),
    flex: 1,
    maxWidth: scale(100),
  },
  quickActionIcon: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.2,
    shadowRadius: scale(12),
    elevation: 8,
  },
  quickActionText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[800],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  quickActionSubtext: {
    fontSize: scaleFont(11),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
    textAlign: 'center',
  },
  sellActionIcon: {
    backgroundColor: THEME_COLORS.primary[600],
    shadowColor: THEME_COLORS.primary[600],
  },
  bidsActionIcon: {
    backgroundColor: THEME_COLORS.warning,
    shadowColor: THEME_COLORS.warning,
  },
  watchlistActionIcon: {
    backgroundColor: THEME_COLORS.error,
    shadowColor: THEME_COLORS.error,
  },
  quickActionsSecondRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: verticalScale(20),
    paddingTop: verticalScale(20),
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.gray[200],
  },
  secondaryActionButton: {
    alignItems: 'center',
    padding: scale(12),
    backgroundColor: THEME_COLORS.gray[50],
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: THEME_COLORS.gray[200],
    minWidth: scale(70),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  secondaryActionText: {
    fontSize: scaleFont(11),
    color: THEME_COLORS.primary[600],
    fontWeight: '600',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
});

export default HomeScreen; 