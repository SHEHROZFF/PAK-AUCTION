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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAuctions, Auction } from '../store/slices/auctionsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import Toast from 'react-native-toast-message';
import { THEME_COLORS, getFullImageUrl } from '../constants/api';
import { scale, verticalScale, scaleFont, wp, hp } from '../utils/responsive';
import PatternBackground from '../components/common/PatternBackground';
import ProductsSkeleton from '../components/skeletons/ProductsSkeleton';
import { formatCurrency } from '../utils/formatCurrency';

interface ProductsScreenProps {
  navigation: any;
  route?: {
    params?: {
      category?: string;
      search?: string;
    };
  };
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { auctions, loading } = useAppSelector((state) => state.auctions);
  const { categories } = useAppSelector((state) => state.categories);
  
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchQuery, setSearchQuery] = useState(route?.params?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || 'all');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Map categories from Redux state and add "All Categories" option
  const categoriesWithAll = [
    { id: 'all', name: 'All Categories' },
    ...(categories || [])
      .filter(cat => cat && cat.id && cat.name) // Filter out null/undefined items
      .map(cat => ({ id: cat.id, name: cat.name }))
  ];

  const sortOptions = [
    { id: 'ending-soon', name: 'Ending Soon' },
    { id: 'newest', name: 'Newest First' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'most-bids', name: 'Most Bids' },
  ];

  useEffect(() => {
    loadAuctions();
  }, []);

  useEffect(() => {
    // Reload auctions when filters change
    loadAuctions();
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    // Always filter and sort when auctions data changes
    filterAndSortAuctions();
  }, [auctions, sortBy]);

  const loadAuctions = async () => {
    try {
      const filterParams = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy: getSortByParam(),
        sortOrder: getSortOrderParam(),
        status: 'ACTIVE', // Only show active auctions
        page: 1,
        limit: 50, // Get more items since we're not paginating yet
      };

      console.log('🔄 Loading auctions with filters:', filterParams);
      console.log('🔍 Selected category ID:', selectedCategory);

      // Dispatch Redux actions to fetch data with proper backend filtering
      await Promise.all([
        dispatch(fetchAuctions(filterParams)),
        dispatch(fetchCategories()),
      ]);
      
      console.log('✅ Auctions loaded from backend');
    } catch (error) {
      console.error('❌ Error loading auctions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load auctions. Please try again.',
      });
    }
  };

  // Convert frontend sort options to backend parameters
  const getSortByParam = () => {
    switch (sortBy) {
      case 'newest':
        return 'createdAt';
      case 'price-low':
      case 'price-high':
        return 'basePrice';
      case 'ending-soon':
        return 'endTime';
      case 'most-bids':
        return 'createdAt'; // Backend doesn't support bid count sorting yet
      default:
        return 'createdAt';
    }
  };

  const getSortOrderParam = (): 'asc' | 'desc' => {
    switch (sortBy) {
      case 'price-low':
        return 'asc';
      case 'ending-soon':
        return 'asc'; // Ending soon = earliest end time first
      case 'newest':
      case 'price-high':
      case 'most-bids':
      default:
        return 'desc';
    }
  };

  const filterAndSortAuctions = () => {
    // Since we're now using backend filtering, we just need to filter out invalid items
    // and do minimal client-side processing for items the backend doesn't handle
    let filtered = (auctions || [])
      .filter(auction => auction && auction.id && auction.title && auction.category);

    // For 'most-bids' sorting, we need to do it client-side since backend doesn't support it yet
    if (sortBy === 'most-bids') {
      filtered.sort((a, b) => (b._count?.bids || 0) - (a._count?.bids || 0));
    }

    setFilteredAuctions(filtered);
    console.log('📊 Filtered auctions:', filtered.length);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAuctions();
    setIsRefreshing(false);
  };

  const handleAuctionPress = (auctionId: string) => {
    if (auctionId) {
      navigation.navigate('ProductDetail', { id: auctionId });
    }
  };

  const renderAuctionItem = ({ item }: { item: Auction }) => {
    if (!item || !item.id || !item.title) return null;
    
    // Get the first image URL with proper base URL
    const imageUrl = item.images && item.images.length > 0 && item.images[0].url
      ? getFullImageUrl(item.images[0].url)
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
        
        <View style={styles.auctionContent}>
          <View style={styles.auctionHeader}>
            <Text style={styles.auctionTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {(item.category && item.category.name) || 'General'}
              </Text>
            </View>
          </View>

          <View style={styles.auctionMeta}>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={scale(14)} color={THEME_COLORS.gray[500]} />
              <Text style={styles.locationText}>Pakistan</Text>
              <Text style={styles.conditionText}>• {item.condition || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.auctionPricing}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.currentBid}>{formatCurrency(item.currentBid || 0)}</Text>
              <Text style={styles.basePrice}>Base: {formatCurrency(item.basePrice || 0)}</Text>
            </View>
            
            <View style={styles.auctionStats}>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={scale(16)} color={THEME_COLORS.error} />
                <Text style={styles.timeLeft}>
                  {item.endTime ? new Date(item.endTime) > new Date() ? 'Active' : 'Ended' : 'N/A'}
                </Text>
              </View>
              <Text style={styles.bidsCount}>{item._count?.bids || 0} bids</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={scale(24)} color={THEME_COLORS.gray[600]} />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {categoriesWithAll.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterOption,
                      selectedCategory === category.id && styles.selectedFilter
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedCategory === category.id && styles.selectedFilterText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortOption,
                    sortBy === option.id && styles.selectedSort
                  ]}
                  onPress={() => setSortBy(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.id && styles.selectedSortText
                  ]}>
                    {option.name}
                  </Text>
                  {sortBy === option.id && (
                    <Ionicons name="checkmark" size={scale(20)} color={THEME_COLORS.primary[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Show skeleton loading while data is being fetched
  if (loading) {
    return <ProductsSkeleton />;
  }

  return (
    <PatternBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={scale(24)} color={THEME_COLORS.gray[800]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Auctions</Text>
            <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
              <Ionicons name="options-outline" size={scale(24)} color={THEME_COLORS.gray[800]} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={scale(20)} color={THEME_COLORS.gray[500]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search auctions..."
                placeholderTextColor={THEME_COLORS.gray[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={scale(20)} color={THEME_COLORS.gray[400]} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Active Filters */}
          <View style={styles.activeFilters}>
            {selectedCategory !== 'all' && (
              <View style={styles.activeFilter}>
                <Text style={styles.activeFilterText}>
                  {categoriesWithAll.find(c => c.id === selectedCategory)?.name}
                </Text>
                <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                  <Ionicons name="close" size={scale(16)} color={THEME_COLORS.primary[600]} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.resultsCount}>
              {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>

        {/* Auctions List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Ionicons name="hourglass-outline" size={scale(48)} color={THEME_COLORS.primary[600]} />
              <Text style={styles.loadingText}>Loading auctions...</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredAuctions}
            renderItem={renderAuctionItem}
            keyExtractor={(item) => item?.id || Math.random().toString()}
            style={styles.auctionsList}
            contentContainerStyle={styles.auctionsListContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[THEME_COLORS.primary[600]]}
                tintColor={THEME_COLORS.primary[600]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyStateCard}>
                  <Ionicons name="search-outline" size={scale(64)} color={THEME_COLORS.gray[400]} />
                  <Text style={styles.emptyStateText}>No auctions found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try adjusting your search or filters
                  </Text>
                </View>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        <FilterModal />
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
    marginBottom: verticalScale(16),
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: THEME_COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
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
  searchContainer: {
    marginBottom: verticalScale(16),
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
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.primary[50],
    borderRadius: scale(20),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    marginRight: scale(8),
  },
  activeFilterText: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.primary[600],
    marginRight: scale(6),
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
  },
  auctionsList: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  auctionsListContent: {
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(120),
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
  categoryBadge: {
    backgroundColor: THEME_COLORS.primary[50],
    borderRadius: scale(16),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },
  categoryText: {
    fontSize: scaleFont(10),
    color: THEME_COLORS.primary[600],
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  auctionMeta: {
    marginBottom: verticalScale(16),
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
  conditionText: {
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
    color: THEME_COLORS.error,
    fontWeight: '600',
    marginLeft: scale(4),
  },
  bidsCount: {
    fontSize: scaleFont(12),
    color: THEME_COLORS.gray[500],
    fontWeight: '500',
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
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[600],
    fontWeight: '600',
    marginTop: verticalScale(16),
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: scale(32),
    borderTopRightRadius: scale(32),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(24),
    maxHeight: hp(80),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(-8) },
    shadowOpacity: 0.2,
    shadowRadius: scale(32),
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  modalTitle: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: THEME_COLORS.gray[800],
  },
  filterSection: {
    marginBottom: verticalScale(32),
  },
  filterTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: THEME_COLORS.gray[800],
    marginBottom: verticalScale(16),
  },
  filterOptions: {
    flexDirection: 'row',
    paddingRight: scale(20),
  },
  filterOption: {
    backgroundColor: THEME_COLORS.gray[100],
    borderRadius: scale(24),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    marginRight: scale(12),
  },
  selectedFilter: {
    backgroundColor: THEME_COLORS.primary[600],
  },
  filterOptionText: {
    fontSize: scaleFont(14),
    color: THEME_COLORS.gray[700],
    fontWeight: '600',
  },
  selectedFilterText: {
    color: 'white',
  },
  sortOptions: {
    gap: verticalScale(12),
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    borderRadius: scale(16),
    backgroundColor: THEME_COLORS.gray[50],
  },
  selectedSort: {
    backgroundColor: THEME_COLORS.primary[50],
  },
  sortOptionText: {
    fontSize: scaleFont(16),
    color: THEME_COLORS.gray[700],
    fontWeight: '600',
  },
  selectedSortText: {
    color: THEME_COLORS.primary[600],
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: THEME_COLORS.primary[600],
    borderRadius: scale(20),
    paddingVertical: verticalScale(20),
    alignItems: 'center',
    marginTop: verticalScale(24),
    shadowColor: THEME_COLORS.primary[600],
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(12),
    elevation: 8,
  },
  applyButtonText: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: 'white',
  },
});

export default ProductsScreen; 