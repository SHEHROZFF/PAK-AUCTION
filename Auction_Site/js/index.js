/**
 * Index Page - Dynamic Featured Auctions
 * Loads featured auctions from API for homepage
 */

class IndexManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.featuredAuctions = [];
    this.categories = [];
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Index Page...');
    
    // Run diagnostics
    await this.runDiagnostics();
    
    try {
      // Show loading state
      this.showLoading();
      
      // Load featured auctions and categories
    await Promise.all([
      this.loadFeaturedAuctions(),
      this.loadCategories()
    ]);

      // Update any static currency values on the page
      this.updateStaticCurrencyValues();
      
      // Hide loading state
      this.hideLoading();
    } catch (error) {
      console.error('❌ Error initializing index page:', error);
      this.showEmpty();
    }
  }

  async runDiagnostics() {
    try {
      console.group('🔍 Running Featured Auctions Diagnostics');
      
      // Check all auctions
      const allAuctionsResponse = await fetch(`${this.baseURL}/auctions?limit=50`);
      if (allAuctionsResponse.ok) {
        const allData = await allAuctionsResponse.json();
        const allAuctions = allData.data.auctions || [];
        
        const featuredCount = allAuctions.filter(a => a.isFeatured === true).length;
        const activeCount = allAuctions.filter(a => a.status === 'ACTIVE').length;
        const activeAndFeaturedCount = allAuctions.filter(a => a.isFeatured === true && a.status === 'ACTIVE' && a.isActive === true).length;
        
        console.log(`📊 Database Status:
          - Total auctions: ${allAuctions.length}
          - Featured auctions: ${featuredCount}
          - Active auctions: ${activeCount}  
          - Active + Featured: ${activeAndFeaturedCount}`);
          
        if (featuredCount === 0) {
          console.warn('⚠️ No auctions are marked as featured in the database!');
          console.log('💡 To fix: Set isFeatured=true on some auctions in the database');
        }
        
        if (activeAndFeaturedCount === 0 && featuredCount > 0) {
          console.warn('⚠️ Featured auctions exist but none are ACTIVE!');
          console.log('💡 Check auction status and endTime fields');
        }
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
    }
  }

  async loadFeaturedAuctions() {
    try {
      this.showLoading();
      
      // Load ONLY featured auctions that are ACTIVE with proper status validation
      const response = await fetch(`${this.baseURL}/auctions?limit=8&isFeatured=true&status=ACTIVE&sortBy=createdAt&sortOrder=desc`);
      
      if (response.ok) {
        const data = await response.json();
        const rawAuctions = data.data.auctions || [];
        
        // Additional filtering to ensure data integrity
        this.featuredAuctions = rawAuctions.filter(auction => {
          const isValidFeatured = auction.isFeatured === true;
          const isValidStatus = auction.status === 'ACTIVE';
          const isValidActive = auction.isActive === true;
          const isValidEndTime = new Date(auction.endTime) > new Date();
          
          const isValid = isValidFeatured && isValidStatus && isValidActive && isValidEndTime;
          
          if (!isValid) {
            console.warn(`🚫 Filtered out auction "${auction.title}":`, {
              isFeatured: isValidFeatured,
              status: auction.status,
              isActive: auction.isActive,
              endTime: auction.endTime,
              isValidEndTime
            });
          }
          
          return isValid;
        });
        
        console.log('✅ Featured auctions API response:', data);
        console.log(`📊 Found ${rawAuctions.length} featured auctions, ${this.featuredAuctions.length} valid after filtering`);
      } else {
        console.error('❌ Featured auctions API error:', response.status, response.statusText);
        this.featuredAuctions = [];
      }
      
      this.hideLoading();
      this.renderFeaturedAuctions();
      console.log('✅ Featured auctions loaded:', this.featuredAuctions.length);
      
    } catch (error) {
      console.error('❌ Error loading featured auctions:', error);
      this.featuredAuctions = [];
      this.hideLoading();
      this.showEmpty();
    }
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`);
      
      if (response.ok) {
        const data = await response.json();
        this.categories = data.data.categories || data.data || [];
        this.renderCategories();
        console.log('✅ Categories loaded:', this.categories.length);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      this.renderCategoriesOffline();
    }
  }

  showLoading() {
    const loading = document.getElementById('featured-loading');
    const grid = document.getElementById('featured-auctions-grid');
    const empty = document.getElementById('featured-empty');
    const viewAll = document.getElementById('featured-view-all');
    
    if (loading) loading.classList.remove('hidden');
    if (grid) grid.classList.add('hidden');
    if (empty) empty.classList.add('hidden');
    if (viewAll) viewAll.classList.add('hidden');
  }

  hideLoading() {
    const loading = document.getElementById('featured-loading');
    if (loading) loading.classList.add('hidden');
  }

  showEmpty() {
    const grid = document.getElementById('featured-auctions-grid');
    const empty = document.getElementById('featured-empty');
    
    if (grid) grid.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
  }

  renderFeaturedAuctions() {
    const container = document.getElementById('featured-auctions-grid');
    const empty = document.getElementById('featured-empty');
    const viewAll = document.getElementById('featured-view-all');
    
    if (!container) {
      console.error('❌ Featured auctions container not found');
      return;
    }

    console.log(`🎯 Rendering ${this.featuredAuctions.length} valid featured auctions`);

    if (this.featuredAuctions.length === 0) {
      console.log('📭 No valid featured auctions to display - showing empty state');
      container.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      return;
    }

    // Show the grid and hide empty state
    container.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    if (viewAll) viewAll.classList.remove('hidden');

    // Professional status report for each auction
    console.group('📊 Featured Auctions Status Report');
    this.featuredAuctions.forEach((auction, index) => {
      const statusReport = {
        index: index + 1,
        title: auction.title,
        id: auction._id || auction.id,
        isFeatured: auction.isFeatured,
        status: auction.status,
        isActive: auction.isActive,
        endTime: auction.endTime,
        timeRemaining: this.getTimeLeft(auction.endTime),
        currentBid: auction.currentBid || auction.basePrice,
        bidCount: auction.bidCount || 0
      };
      
      const isValid = auction.isFeatured && auction.status === 'ACTIVE' && auction.isActive;
      console.log(`${isValid ? '✅' : '❌'} Auction ${index + 1}:`, statusReport);
    });
    console.groupEnd();

    container.innerHTML = this.featuredAuctions.map(auction => this.renderAuctionCard(auction)).join('');
    console.log(`✅ Successfully rendered ${this.featuredAuctions.length} featured auction cards`);
  }

  renderAuctionCard(auction) {
    const imageUrl = auction.images?.[0]?.url 
      ? `${this.baseURL.replace('/api', '')}${auction.images[0].url}` 
      : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
    const timeLeft = this.getTimeLeft(auction.endTime);
    const currentBid = auction.currentBid || auction.basePrice;
    const condition = auction.condition || 'New';
    
    // Professional validation and logging
    const validationReport = {
      isFeatured: auction.isFeatured === true,
      status: auction.status === 'ACTIVE',
      isActive: auction.isActive === true,
      endTime: new Date(auction.endTime) > new Date(),
      title: auction.title
    };
    
    const isFullyValid = Object.values(validationReport).every(v => v === true || typeof v === 'string');
    
    if (!isFullyValid) {
      console.warn(`⚠️ Auction "${auction.title}" has validation issues:`, validationReport);
    }
    
    // Determine status badge
    const statusBadge = auction.isFeatured && auction.status === 'ACTIVE' && auction.isActive
      ? `<div class="absolute top-3 left-3">
          <span class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center animate-pulse">
            <i class="fas fa-star mr-1"></i> FEATURED
          </span>
        </div>`
      : `<div class="absolute top-3 left-3">
          <span class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
            <i class="fas fa-exclamation-triangle mr-1"></i> INVALID
          </span>
        </div>`;

    // Determine timer badge color based on auction status
    const timerBadgeClass = auction.status === 'ACTIVE' && auction.isActive 
      ? 'bg-primary-600' 
      : 'bg-red-600';
    
    return `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up">
        <div class="relative">
          <img src="${imageUrl}" alt="${auction.title}" class="w-full h-48 object-cover">
          <div class="absolute top-3 right-3">
            <span class="${timerBadgeClass} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              ${timeLeft}
            </span>
          </div>
          ${statusBadge}
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-bold text-lg text-gray-800 line-clamp-2 flex-1">${auction.title}</h3>
            <button class="ml-2 text-gray-400 hover:text-red-500 transition-colors">
              <i class="far fa-heart"></i>
            </button>
          </div>
          
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">${auction.description || 'No description available'}</p>
          
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Current Bid</p>
              <p class="font-bold text-2xl text-primary-600">${this.formatCurrency(currentBid)}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 uppercase tracking-wide">Bids</p>
              <p class="font-semibold text-lg text-gray-700">${auction.bidCount || 0}</p>
            </div>
          </div>
          
          <div class="flex items-center justify-between mb-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              ${auction.category?.name || 'Uncategorized'}
            </span>
            <span class="text-xs ${auction.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'} font-medium">
              Status: ${auction.status} ${auction.isActive ? '✓' : '✗'}
            </span>
          </div>
          
          <!-- Stats row with views and watchlist -->
          <div class="flex items-center justify-between mb-4 text-xs text-gray-500">
            <span class="flex items-center">
              <i class="fas fa-eye mr-1"></i>
              ${auction.viewCount || 0} views
            </span>
            <span class="flex items-center">
              <i class="fas fa-heart mr-1"></i>
              ${auction._count?.watchlist || 0} watching
            </span>
          </div>
          
          <div class="flex gap-3">
            <a href="product-detail.html?id=${auction.id || auction._id}" 
               class="flex-1 ${auction.status === 'ACTIVE' && auction.isActive ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'} text-white px-4 py-3 rounded-lg transition-colors text-sm font-medium text-center">
              <i class="fas fa-gavel mr-2"></i>${auction.status === 'ACTIVE' && auction.isActive ? 'Bid Now' : 'Inactive'}
            </a>
            <button class="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderCategories() {
    const container = document.getElementById('category-cards-container');
    const loading = document.getElementById('categories-loading');
    const grid = document.getElementById('categories-grid');
    
    if (loading) loading.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    
    if (!container) return;

    if (this.categories.length === 0) {
      this.renderCategoriesOffline();
      return;
    }

    // Show only first 6 categories for homepage
    const displayCategories = this.categories.slice(0, 6);
    
    container.innerHTML = displayCategories.map(category => `
      <a href="products.html?category=${category._id || category.id}" 
         class="group relative bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          <i class="${category.icon || 'fas fa-tag'}"></i>
        </div>
        <h3 class="font-semibold text-white mb-2">${category.name}</h3>
        <p class="text-white/80 text-sm">${category.auctionCount || '50+'} items</p>
      </a>
    `).join('');
  }

  renderCategoriesOffline() {
    // Fallback categories when API is not available
    const container = document.getElementById('category-cards-container');
    const loading = document.getElementById('categories-loading');
    const grid = document.getElementById('categories-grid');
    
    if (loading) loading.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    
    if (!container) return;

    const defaultCategories = [
      { name: 'Computers', icon: 'fas fa-laptop', count: '120+' },
      { name: 'Antiques', icon: 'fas fa-crown', count: '85+' },
      { name: 'Art', icon: 'fas fa-palette', count: '200+' },
      { name: 'Electronics', icon: 'fas fa-mobile-alt', count: '150+' },
      { name: 'Games', icon: 'fas fa-gamepad', count: '90+' },
      { name: 'Jewelry', icon: 'fas fa-gem', count: '65+' }
    ];

    container.innerHTML = defaultCategories.map(category => `
      <a href="products.html?category=${category.name.toLowerCase()}" 
         class="group relative bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
        <div class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          <i class="${category.icon}"></i>
        </div>
        <h3 class="font-semibold text-white mb-2">${category.name}</h3>
        <p class="text-white/80 text-sm">${category.count} items</p>
      </a>
    `).join('');
  }

  getTimeLeft(endTime) {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return 'Ended';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
  
  // Format currency using utility manager
  formatCurrency(amount) {
    // Use the utility manager if available, otherwise fallback to default formatting
    if (window.utilityManager) {
      return window.utilityManager.formatCurrency(amount);
    }
    
    // Fallback formatting
    return 'Rs. ' + Number(amount).toLocaleString();
  }

  updateStaticCurrencyValues() {
    // Find all elements with the currency-value class and update them
    const currencyElements = document.querySelectorAll('.currency-value');
    
    currencyElements.forEach(element => {
      // Get the current text content which should be in the format "Rs. 1,250"
      const currentText = element.textContent;
      // Extract the number part
      const numberMatch = currentText.match(/[\d,]+/);
      
      if (numberMatch) {
        const number = parseFloat(numberMatch[0].replace(/,/g, ''));
        // Format with the utility manager
        if (window.utilityManager) {
          element.textContent = window.utilityManager.formatCurrency(number);
        }
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new IndexManager();
}); 