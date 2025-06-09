/**
 * Products/Auctions Listing Functionality
 * Professional integration with backend auction API
 */

class ProductsManager {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    // this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.categories = [];
    this.auctions = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalCount = 0;
    this.isLoading = false;
    this.currentFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.init();
  }

  // Initialize the products system
  async init() {
    console.log('🚀 Initializing Products System...');
    
    this.loadFiltersFromURL();
    await Promise.all([
      this.loadCategories(),
      this.loadAuctions()
    ]);
    this.bindEventListeners();
    this.setupSearch();
  }

  // Load filters from URL parameters
  loadFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    this.currentFilters.search = urlParams.get('search') || '';
    this.currentFilters.category = urlParams.get('category') || '';
    this.currentFilters.minPrice = urlParams.get('minPrice') || '';
    this.currentFilters.maxPrice = urlParams.get('maxPrice') || '';
    this.currentPage = parseInt(urlParams.get('page')) || 1;

    // Update form fields
    this.updateFilterInputs();
  }

  // Update filter inputs with current values
  updateFilterInputs() {
    const searchInput = document.querySelector('input[name="search"]');
    const categorySelect = document.getElementById('categoryFilter');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    if (searchInput) searchInput.value = this.currentFilters.search;
    if (minPriceInput) minPriceInput.value = this.currentFilters.minPrice;
    if (maxPriceInput) maxPriceInput.value = this.currentFilters.maxPrice;
    
    // Category will be set after categories are loaded
  }

  // Load categories from API
  async loadCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`);
      
      if (response.ok) {
        const data = await response.json();
        this.categories = data.data.categories;
        this.populateCategoryFilter();
        console.log('✅ Categories loaded:', this.categories.length);
      } else {
        console.error('❌ Failed to load categories');
      }
    } catch (error) {
      console.error('❌ Category loading error:', error);
    }
  }

  // Populate category filter dropdown
  populateCategoryFilter() {
    const categorySelect = document.getElementById('categoryFilter');
    if (!categorySelect) return;

    // Clear existing options except the first one
    const firstOption = categorySelect.querySelector('option[value=""]');
    categorySelect.innerHTML = '';
    if (firstOption) {
      categorySelect.appendChild(firstOption);
    } else {
      categorySelect.innerHTML = '<option value="">All Categories</option>';
    }

    // Add categories from API
    this.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      option.setAttribute('data-slug', category.slug);
      
      if (category.id === this.currentFilters.category) {
        option.selected = true;
      }
      
      categorySelect.appendChild(option);
    });
  }

  // Load auctions from API
  async loadAuctions() {
    try {
      this.setLoadingState(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: 12,
        sortBy: this.currentFilters.sortBy,
        sortOrder: this.currentFilters.sortOrder
      });

      // Add optional filters only if they have values
      if (this.currentFilters.search) params.append('search', this.currentFilters.search);
      if (this.currentFilters.category) params.append('category', this.currentFilters.category);
      if (this.currentFilters.minPrice) params.append('minPrice', this.currentFilters.minPrice);
      if (this.currentFilters.maxPrice) params.append('maxPrice', this.currentFilters.maxPrice);
      if (this.currentFilters.status) params.append('status', this.currentFilters.status);

      const apiUrl = `${this.baseURL}/auctions?${params}`;
      console.log('🔍 Loading auctions from:', apiUrl);

      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response received:', data);
        
        this.auctions = data.data.auctions || [];
        this.currentPage = data.data.pagination?.currentPage || 1;
        this.totalPages = data.data.pagination?.totalPages || 1;
        this.totalCount = data.data.pagination?.totalCount || 0;
        
        this.renderAuctions();
        this.renderPagination();
        this.updateResultsCount();
        
        console.log('✅ Auctions loaded:', this.auctions.length, 'Total count:', this.totalCount);
      } else {
        console.error('❌ API Error Response:', response.status, response.statusText);
        this.showError('Failed to load auctions. Please try again.');
      }
    } catch (error) {
      console.error('❌ Auctions loading error:', error);
      this.showError('Network error loading auctions. Please check your connection.');
    } finally {
      this.setLoadingState(false);
    }
  }

  // Render auctions in the grid
  renderAuctions() {
    const auctionsGrid = document.querySelector('.auctions-grid, .products-grid');
    if (!auctionsGrid) {
      console.error('❌ Auctions grid container not found');
      return;
    }

    if (this.auctions.length === 0) {
      auctionsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-medium text-gray-600 mb-2">No auctions found</h3>
          <p class="text-gray-500">Try adjusting your search filters</p>
        </div>
      `;
      return;
    }

    auctionsGrid.innerHTML = this.auctions.map(auction => this.renderAuctionCard(auction)).join('');
    
    // Add click handlers
    this.addAuctionClickHandlers();
  }

  // Render individual auction card
  renderAuctionCard(auction) {
    const imageUrl = auction.images?.[0]?.url 
      ? `${this.baseURL.replace('/api', '')}${auction.images[0].url}` 
      : 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
    const timeLeft = this.getTimeLeft(auction.endTime);
    const currentBid = auction.currentBid || auction.basePrice;
    const auctionId = auction.id || auction._id;
    
    return `
      <div class="auction-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer" 
           data-auction-id="${auctionId}">
        <div class="relative">
          <img src="${imageUrl}" alt="${auction.title}" 
               class="w-full h-48 object-cover" 
               onerror="this.src='https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'">
          
          <!-- Status Badge -->
          <div class="absolute top-2 left-2">
            <span class="bg-${this.getStatusColor(auction.status)}-100 text-${this.getStatusColor(auction.status)}-800 px-2 py-1 rounded-full text-xs font-medium">
              ${this.formatStatus(auction.status)}
            </span>
          </div>
          
          <!-- Featured Badge -->
          ${auction.isFeatured ? `
            <div class="absolute top-2 right-2">
              <span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <i class="fas fa-star mr-1"></i> Featured
              </span>
            </div>
          ` : ''}
          
          <!-- Time Left for Active Auctions -->
          ${auction.status === 'ACTIVE' && !auction.isFeatured ? `
            <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ${timeLeft}
            </div>
          ` : ''}
          
          <!-- Time Left for Featured Active Auctions -->
          ${auction.status === 'ACTIVE' && auction.isFeatured ? `
            <div class="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              ${timeLeft}
            </div>
          ` : ''}
        </div>
        
        <div class="p-4">
          <h3 class="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">${auction.title}</h3>
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">${auction.brand ? `${auction.brand} • ` : ''}${auction.condition || ''}</p>
          
          <div class="flex justify-between items-center mb-3">
            <div>
              <p class="text-xs text-gray-500">Current Bid</p>
              <p class="text-xl font-bold text-green-600">$${Number(currentBid).toLocaleString()}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">Bids</p>
              <p class="text-lg font-semibold text-gray-700">${auction.bidCount || auction._count?.bids || 0}</p>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span class="flex items-center">
              <i class="fas fa-user mr-1"></i>
              ${auction.seller?.firstName || auction.sellerId?.firstName || 'Anonymous'}
            </span>
            <span class="flex items-center">
              <i class="fas fa-tag mr-1"></i>
              ${auction.category?.name || auction.categoryId?.name || 'Uncategorized'}
            </span>
          </div>
          
          <!-- Stats row with views and watchlist -->
          <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span class="flex items-center">
              <i class="fas fa-eye mr-1"></i>
              ${auction.viewCount || 0} views
            </span>
            <span class="flex items-center">
              <i class="fas fa-heart mr-1"></i>
              ${auction._count?.watchlist || 0} watching
            </span>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-2">
            ${auction.status === 'ACTIVE' ? `
              <button class="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-300 bid-now-btn" 
                      data-auction-id="${auctionId}">
                <i class="fas fa-gavel mr-2"></i>Place Bid
              </button>
            ` : `
              <button class="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed" disabled>
                <i class="fas fa-clock mr-2"></i>${this.formatStatus(auction.status)}
              </button>
            `}
            <button class="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition duration-300 view-btn" 
                    data-auction-id="${auctionId}">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Add click handlers to auction cards
  addAuctionClickHandlers() {
    // Card click handlers
    document.querySelectorAll('.auction-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on buttons
        if (e.target.closest('.bid-now-btn') || e.target.closest('.view-btn')) return;
        
        const auctionId = card.getAttribute('data-auction-id');
        window.location.href = `product-detail.html?id=${auctionId}`;
      });
    });

    // Bid button handlers
    document.querySelectorAll('.bid-now-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const auctionId = btn.getAttribute('data-auction-id');
        window.location.href = `product-detail.html?id=${auctionId}#bid`;
      });
    });
    
    // View button handlers
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const auctionId = btn.getAttribute('data-auction-id');
        window.location.href = `product-detail.html?id=${auctionId}`;
      });
    });
  }

  // Get time left for auction
  getTimeLeft(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Get status color
  getStatusColor(status) {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'ENDED': return 'red';
      case 'SOLD': return 'blue';
      case 'CANCELLED': return 'gray';
      default: return 'yellow';
    }
  }

  // Format status text
  formatStatus(status) {
    switch (status) {
      case 'ACTIVE': return 'Live';
      case 'ENDED': return 'Ended';
      case 'SOLD': return 'Sold';
      case 'CANCELLED': return 'Cancelled';
      case 'DRAFT': return 'Draft';
      case 'SCHEDULED': return 'Scheduled';
      default: return status;
    }
  }

  // Render pagination
  renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    if (this.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `
        <button class="pagination-btn" data-page="${this.currentPage - 1}">
          <i class="fas fa-chevron-left"></i> Previous
        </button>
      `;
    }

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    if (startPage > 1) {
      paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
      paginationHTML += `<button class="pagination-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
    }

    // Next button
    if (this.currentPage < this.totalPages) {
      paginationHTML += `
        <button class="pagination-btn" data-page="${this.currentPage + 1}">
          Next <i class="fas fa-chevron-right"></i>
        </button>
      `;
    }

    paginationContainer.innerHTML = paginationHTML;

    // Add click handlers
    paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'));
        this.changePage(page);
      });
    });
  }

  // Update results count
  updateResultsCount() {
    const countElement = document.querySelector('.results-count');
    if (countElement) {
      const start = (this.currentPage - 1) * 12 + 1;
      const end = Math.min(this.currentPage * 12, this.totalCount);
      countElement.textContent = `Showing ${start}-${end} of ${this.totalCount} auctions`;
    }
  }

  // Change page
  changePage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    
    this.currentPage = page;
    this.updateURL();
    this.loadAuctions();
    this.scrollToTop();
  }

  // Bind event listeners
  bindEventListeners() {
    // Search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSearch();
      });
    }

    // Filter form
    const filterForm = document.querySelector('.filter-form');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
    }

    // Category filter change
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const [sortBy, sortOrder] = sortSelect.value.split('-');
        this.currentFilters.sortBy = sortBy;
        this.currentFilters.sortOrder = sortOrder;
        this.currentPage = 1;
        this.updateURL();
        this.loadAuctions();
      });
    }

    // Clear filters
    const clearFiltersBtn = document.querySelector('.clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }
  }

  // Setup search functionality
  setupSearch() {
    const searchInputs = document.querySelectorAll('input[name="search"]');
    searchInputs.forEach(input => {
      // Real-time search with debounce
      let searchTimeout;
      input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.currentFilters.search = input.value.trim();
          this.currentPage = 1;
          this.updateURL();
          this.loadAuctions();
        }, 500);
      });
    });
  }

  // Handle search
  handleSearch() {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
      this.currentFilters.search = searchInput.value.trim();
      this.currentPage = 1;
      this.updateURL();
      this.loadAuctions();
    }
  }

  // Apply filters
  applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    if (categoryFilter) this.currentFilters.category = categoryFilter.value;
    if (minPriceInput) this.currentFilters.minPrice = minPriceInput.value;
    if (maxPriceInput) this.currentFilters.maxPrice = maxPriceInput.value;

    this.currentPage = 1;
    this.updateURL();
    this.loadAuctions();
  }

  // Clear all filters
  clearFilters() {
    this.currentFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.currentPage = 1;
    
    this.updateFilterInputs();
    this.updateURL();
    this.loadAuctions();
  }

  // Update URL with current filters
  updateURL() {
    const params = new URLSearchParams();
    
    if (this.currentFilters.search) params.set('search', this.currentFilters.search);
    if (this.currentFilters.category) params.set('category', this.currentFilters.category);
    if (this.currentFilters.minPrice) params.set('minPrice', this.currentFilters.minPrice);
    if (this.currentFilters.maxPrice) params.set('maxPrice', this.currentFilters.maxPrice);
    if (this.currentPage > 1) params.set('page', this.currentPage);

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', newURL);
  }

  // Set loading state
  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    const loadingIndicator = document.querySelector('.loading-indicator');
    const auctionsGrid = document.querySelector('.auctions-grid, .products-grid');

    if (isLoading) {
      if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
      } else if (auctionsGrid) {
        auctionsGrid.innerHTML = `
          <div class="col-span-full text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
            <p class="text-gray-600">Loading auctions...</p>
          </div>
        `;
      }
    } else {
      if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
      }
    }
  }

  // Show error message
  showError(message) {
    const auctionsGrid = document.querySelector('.auctions-grid, .products-grid');
    if (auctionsGrid) {
      auctionsGrid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-800 mb-2">Error Loading Auctions</h3>
          <p class="text-gray-600 mb-4">${message}</p>
          <button onclick="window.productsManager.loadAuctions()" 
                  class="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition duration-300">
            Try Again
          </button>
        </div>
      `;
    }
  }

  // Scroll to top
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Initialize products manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the products page
  if (document.querySelector('.auctions-grid, .products-grid')) {
    window.productsManager = new ProductsManager();
  }
}); 