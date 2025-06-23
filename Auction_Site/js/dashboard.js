/**
 * Professional Dashboard Manager
 * Handles all dashboard functionality with proper API integration
 */

class DashboardManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.currentUser = null;
    this.dashboardData = null;
    this.init();
  }

  async init() {
    console.log('🎯 Initializing Professional Dashboard Manager...');
    
    // Wait for auth manager to be ready
    await this.waitForAuth();
    
    if (!this.currentUser) {
      this.redirectToLogin();
      return;
    }

    // Load dashboard data
    await this.loadDashboardData();

    // Bind event listeners
    this.bindEventListeners();
    
    console.log('✅ Dashboard Manager initialized successfully');
  }

  async waitForAuth() {
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (window.authManager && window.authManager.isInitialized) {
          this.currentUser = window.authManager.currentUser;
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  }

  redirectToLogin() {
    console.log('❌ User not authenticated, redirecting to login');
    window.location.href = 'login.html';
      }

  async loadDashboardData() {
    console.log('📊 Loading complete dashboard data...');
    
    // Update welcome message
    const welcomeEl = document.getElementById('dashboard-welcome');
    if (welcomeEl) {
      welcomeEl.textContent = `Welcome back, ${this.currentUser.firstName}! Here's your auction activity overview`;
      }

    try {
      // Show loading states
      this.showLoadingStates();
      
      // Load dashboard data from backend
      const response = await this.makeAuthenticatedRequest('/users/dashboard');

      if (response.success) {
        this.dashboardData = response.data;
        console.log('✅ Dashboard data loaded:', this.dashboardData);
        
        // Update all dashboard sections
        this.updateStatistics();
        this.displayRecentAuctions();
        this.displayRecentBids();
        this.loadWatchlistPreview();
        this.loadRecentNotifications();
      } else {
        throw new Error(response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data. Please refresh the page.');
    }
  }

  showLoadingStates() {
    // Show loading for all sections
    const loadingHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
        <p>Loading...</p>
      </div>
    `;
    
    ['recent-auctions', 'recent-bids', 'watchlist-preview', 'recent-notifications'].forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.innerHTML = loadingHTML;
      }
    });
  }

  updateStatistics() {
    const stats = this.dashboardData?.stats || {};

    // Animate statistics
    const elements = [
      { id: 'stat-active-auctions', value: stats.activeAuctions || 0 },
      { id: 'stat-won-auctions', value: stats.wonAuctions || 0 },
      { id: 'stat-total-bids', value: stats.totalBids || 0 },
      { id: 'stat-watchlist', value: stats.watchlistItems || 0 }
    ];
    
    elements.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        this.animateNumber(element, 0, value);
      }
    });
  }

  animateNumber(element, start, end) {
    const duration = 1500;
    const startTime = performance.now();
    
    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
  }
    };
    
    requestAnimationFrame(updateNumber);
  }

  displayRecentAuctions() {
    const container = document.getElementById('recent-auctions');
    if (!container) return;

    const auctions = this.dashboardData?.recentAuctions || [];
    
    if (auctions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-store text-4xl mb-4 text-gray-300"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No auctions yet</h3>
          <p class="text-sm mb-6">Start selling your products to see them here</p>
          <a href="sell-product.html" class="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            <i class="fas fa-plus mr-2"></i>Sell Your First Product
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = auctions.map(auction => {
      const mainImage = auction.images && auction.images.length > 0 
        ? `${this.baseURL.replace('/api', '')}${auction.images[0].url}`
        : 'images/placeholder.jpg';
      
      return `
        <div class="group flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
          <div class="relative">
            <img src="${mainImage}" alt="${auction.title}" class="w-16 h-16 object-cover rounded-lg">
            <div class="absolute -top-1 -right-1">
              <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(auction.status)}">
                ${auction.status}
              </span>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">${auction.title}</h3>
            <div class="flex flex-col sm:flex-row sm:justify-between mt-1">
              <span class="text-sm text-gray-600">Starting: ${this.formatCurrency(auction.startingBid)}</span>
              <span class="text-sm text-gray-600">Current: ${this.formatCurrency(auction.currentBid || auction.startingBid)}</span>
            </div>
            <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span class="flex items-center">
                <i class="fas fa-hand-paper mr-1"></i>${auction._count?.bids || 0} bids
              </span>
              <span class="flex items-center">
                <i class="fas fa-heart mr-1"></i>${auction._count?.watchlist || 0} watching
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">
              ${this.formatCurrency(auction.currentBid || auction.startingBid)}
            </p>
            <p class="text-xs text-gray-500">
              ${auction.status === 'ACTIVE' ? `Ends ${this.formatDate(auction.endTime)}` : this.formatDate(auction.createdAt)}
            </p>
          </div>
      </div>
    `;
    }).join('');
  }

  displayRecentBids() {
    const container = document.getElementById('recent-bids');
    if (!container) return;

    const bids = this.dashboardData?.recentBids || [];

    if (bids.length === 0) {
    container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-hand-paper text-4xl mb-4 text-gray-300"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No bids yet</h3>
          <p class="text-sm mb-6">Start bidding on products to see your activity here</p>
          <a href="products.html" class="inline-flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            <i class="fas fa-search mr-2"></i>Browse Products
          </a>
      </div>
    `;
      return;
    }

    container.innerHTML = bids.map(bid => {
      const auction = bid.auction;
      const mainImage = auction.images && auction.images.length > 0 
        ? `${this.baseURL.replace('/api', '')}${auction.images[0].url}`
        : 'images/placeholder.jpg';
      
      const isWinning = auction.currentBid === bid.amount;
    
    return `
        <div class="group flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
          <div class="relative">
            <img src="${mainImage}" alt="${auction.title}" class="w-16 h-16 object-cover rounded-lg">
            ${isWinning ? `
              <div class="absolute -top-1 -right-1">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <i class="fas fa-crown mr-1"></i>Winning
            </span>
              </div>
            ` : ''}
          </div>
          <div class="ml-4 flex-1">
            <h3 class="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">${auction.title}</h3>
            <div class="flex flex-col sm:flex-row sm:justify-between mt-1">
              <span class="text-sm ${isWinning ? 'text-green-600 font-medium' : 'text-gray-600'}">
                Your bid: ${this.formatCurrency(bid.amount)}
              </span>
              <span class="text-sm text-gray-600">Current: ${this.formatCurrency(auction.currentBid)}</span>
            </div>
            <div class="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span class="flex items-center">
                <i class="fas fa-hand-paper mr-1"></i>${auction._count?.bids || 0} bids
              </span>
              <span class="flex items-center">
                <i class="fas fa-heart mr-1"></i>${auction._count?.watchlist || 0} watching
              </span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium ${isWinning ? 'text-green-600' : 'text-gray-900'}">
              ${isWinning ? 'WINNING' : 'OUTBID'}
            </p>
            <p class="text-xs text-gray-500">
              ${auction.status === 'ACTIVE' ? `Ends ${this.formatDate(auction.endTime)}` : 'Auction ended'}
            </p>
        </div>
      </div>
    `;
    }).join('');
  }

  async loadWatchlistPreview() {
    const container = document.getElementById('watchlist-preview');
    if (!container) return;

    try {
      const response = await this.makeAuthenticatedRequest('/users/watchlist?limit=4');
      
      if (response.success) {
        const watchlist = response.data.watchlist || [];
        
        if (watchlist.length === 0) {
          container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
              <i class="fas fa-heart text-4xl mb-4 text-gray-300"></i>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No items in watchlist</h3>
              <p class="text-sm mb-6">Add products to your watchlist to track them</p>
              <a href="products.html" class="inline-flex items-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="fas fa-search mr-2"></i>Browse Products
          </a>
      </div>
    `;
          return;
        }

        container.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${watchlist.map(item => {
              const auction = item.auction;
              const mainImage = auction.images && auction.images.length > 0 
                ? `${this.baseURL.replace('/api', '')}${auction.images[0].url}`
                : 'images/placeholder.jpg';
    
    return `
                <div class="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-primary-300 transition-all cursor-pointer">
                  <div class="relative">
                    <img src="${mainImage}" alt="${auction.title}" class="w-full h-32 object-cover">
                    <button onclick="dashboardManager.removeFromWatchlist('${item.id}')" class="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors">
                      <i class="fas fa-heart text-red-500 hover:text-red-600"></i>
                    </button>
                  </div>
                  <div class="p-3">
                    <h4 class="font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">${auction.title}</h4>
                    <div class="flex justify-between items-center mt-2">
                      <span class="text-sm font-medium text-primary-600">${this.formatCurrency(auction.currentBid || auction.startingBid)}</span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${this.getStatusColor(auction.status)}">
                        ${auction.status}
                      </span>
          </div>
                    ${auction.status === 'ACTIVE' ? `
                      <p class="text-xs text-gray-500 mt-1">Ends ${this.formatDate(auction.endTime)}</p>
                    ` : ''}
        </div>
      </div>
    `;
            }).join('')}
      </div>
    `;
  }
    } catch (error) {
      console.error('❌ Error loading watchlist:', error);
      container.innerHTML = `
        <div class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Failed to load watchlist</p>
        </div>
      `;
    }
  }

  async loadRecentNotifications() {
    const container = document.getElementById('recent-notifications');
    if (!container) return;

    try {
      const response = await this.makeAuthenticatedRequest('/users/notifications?limit=5');
      
      if (response.success) {
        const notifications = response.data.notifications || [];
        
        if (notifications.length === 0) {
          container.innerHTML = `
            <div class="text-center py-4 text-gray-500 text-sm">
              <i class="fas fa-bell-slash text-2xl mb-2 text-gray-300"></i>
              <p>No recent activity</p>
            </div>
          `;
          return;
        }

        container.innerHTML = notifications.map(notification => `
          <div class="flex items-start space-x-3 p-3 ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg">
            <div class="flex-shrink-0">
              <i class="fas ${this.getNotificationIcon(notification.type)} text-primary-600"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900">${notification.message}</p>
              <p class="text-xs text-gray-500 mt-1">${this.formatDate(notification.createdAt)}</p>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      container.innerHTML = `
        <div class="text-center py-4 text-red-500 text-sm">
          <i class="fas fa-exclamation-triangle mb-2"></i>
          <p>Failed to load notifications</p>
        </div>
      `;
    }
  }

  async removeFromWatchlist(itemId) {
    try {
      const response = await this.makeAuthenticatedRequest(`/users/watchlist/${itemId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        this.showMessage('Removed from watchlist', 'success');
        // Reload watchlist and update stats
        this.loadWatchlistPreview();
        this.loadDashboardData();
      }
    } catch (error) {
      console.error('❌ Error removing from watchlist:', error);
      this.showMessage('Failed to remove from watchlist', 'error');
    }
  }

  bindEventListeners() {
    // Add any additional event listeners here
    console.log('🔗 Dashboard event listeners bound');
  }

  // Utility methods
  getStatusColor(status) {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getNotificationIcon(type) {
    switch (type?.toLowerCase()) {
      case 'bid':
        return 'fa-hand-paper';
      case 'auction':
        return 'fa-gavel';
      case 'win':
        return 'fa-trophy';
      case 'outbid':
        return 'fa-exclamation-triangle';
      default:
        return 'fa-bell';
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  formatCurrency(amount) {
    // Use the utility manager if available, otherwise fallback to default formatting
    if (window.utilityManager) {
      return window.utilityManager.formatCurrency(amount);
    }
    
    // Fallback formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
    currency: this.settings?.currency || 'PKR'
    }).format(amount);
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, mergedOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${this.getMessageClass(type)}`;
    messageDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${this.getMessageIcon(type)} mr-3"></i>
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  getMessageClass(type) {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
}
  }

  getMessageIcon(type) {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      default:
        return 'fa-info-circle';
    }
  }
}

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth manager to be ready
  const initDashboard = () => {
    if (window.authManager) {
      window.dashboardManager = new DashboardManager();
    } else {
      setTimeout(initDashboard, 100);
    }
  };
  
  initDashboard();
}); 