/**
 * User Dashboard - Full API Integration
 * Shows user's auctions, bids, watchlist, profile info
 */

class DashboardManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.currentUser = null;
    this.userAuctions = [];
    this.userBids = [];
    this.watchlist = [];
    this.notifications = [];
    this.currentTab = 'overview';
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Dashboard...');
    
    // Check authentication
    if (!this.checkAuthentication()) {
      window.location.href = 'login.html';
      return;
    }

    // Load all dashboard data
    await Promise.all([
      this.loadUserProfile(),
      this.loadUserAuctions(),
      this.loadUserBids(),
      this.loadWatchlist(),
      this.loadNotifications()
    ]);

    // Setup event listeners
    this.bindEventListeners();
    
    // Initialize tabs
    this.initTabs();
  }

  checkAuthentication() {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      this.currentUser = JSON.parse(userInfo);
    }
    
    return true;
  }

  async loadUserProfile() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.data.user;
        this.updateUserInfo();
        console.log('✅ User profile loaded');
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    }
  }

  async loadUserAuctions() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/auctions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.userAuctions = data.data.auctions;
        this.renderUserAuctions();
        console.log('✅ User auctions loaded');
      }
    } catch (error) {
      console.error('❌ Error loading auctions:', error);
    }
  }

  async loadUserBids() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/bids`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.userBids = data.data.bids;
        this.renderUserBids();
        console.log('✅ User bids loaded');
      }
    } catch (error) {
      console.error('❌ Error loading bids:', error);
    }
  }

  async loadWatchlist() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/watchlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.watchlist = data.data.watchlist;
        this.renderWatchlist();
        console.log('✅ Watchlist loaded');
      }
    } catch (error) {
      console.error('❌ Error loading watchlist:', error);
    }
  }

  async loadNotifications() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.notifications = data.data.notifications;
        this.renderNotifications();
        console.log('✅ Notifications loaded');
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  }

  updateUserInfo() {
    if (!this.currentUser) return;

    // Update user name displays
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    });

    // Update user email displays
    document.querySelectorAll('.user-email').forEach(el => {
      el.textContent = this.currentUser.email;
    });

    // Update user avatar displays
    document.querySelectorAll('.user-avatar').forEach(el => {
      el.textContent = this.currentUser.firstName.charAt(0);
    });

    // Update profile form if exists
    this.updateProfileForm();
  }

  updateProfileForm() {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm || !this.currentUser) return;

    const fields = ['firstName', 'lastName', 'username', 'email', 'phone'];
    fields.forEach(field => {
      const input = profileForm.querySelector(`[name="${field}"]`);
      if (input && this.currentUser[field]) {
        input.value = this.currentUser[field];
      }
    });
  }

  renderUserAuctions() {
    const container = document.getElementById('user-auctions');
    if (!container) return;

    if (this.userAuctions.length === 0) {
      container.innerHTML = this.getEmptyState('auctions', 'You haven\'t created any auctions yet', 'sell-product.html', 'Create Auction');
      return;
    }

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.userAuctions.map(auction => this.renderAuctionCard(auction)).join('')}
      </div>
    `;
  }

  renderUserBids() {
    const container = document.getElementById('user-bids');
    if (!container) return;

    if (this.userBids.length === 0) {
      container.innerHTML = this.getEmptyState('bids', 'You haven\'t placed any bids yet', 'products.html', 'Browse Auctions');
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${this.userBids.map(bid => this.renderBidItem(bid)).join('')}
      </div>
    `;
  }

  renderWatchlist() {
    const container = document.getElementById('watchlist');
    if (!container) return;

    if (this.watchlist.length === 0) {
      container.innerHTML = this.getEmptyState('watchlist', 'Your watchlist is empty', 'products.html', 'Browse Auctions');
      return;
    }

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.watchlist.map(item => this.renderAuctionCard(item.auction)).join('')}
      </div>
    `;
  }

  renderNotifications() {
    const container = document.getElementById('notifications');
    if (!container) return;

    if (this.notifications.length === 0) {
      container.innerHTML = this.getEmptyState('notifications', 'No notifications yet', null, null);
      return;
    }

    container.innerHTML = `
      <div class="space-y-3">
        ${this.notifications.map(notification => this.renderNotificationItem(notification)).join('')}
      </div>
    `;
  }

  renderAuctionCard(auction) {
    const imageUrl = auction.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image';
    const statusColor = this.getStatusColor(auction.status);
    
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <img src="${imageUrl}" alt="${auction.title}" class="w-full h-48 object-cover">
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-lg line-clamp-2">${auction.title}</h3>
            <span class="px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">
              ${auction.status}
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">${auction.description || ''}</p>
          <div class="flex justify-between items-center mb-3">
            <div>
              <p class="text-sm text-gray-500">Current Bid</p>
              <p class="font-bold text-lg">${auction.currentBid || auction.basePrice}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Bids</p>
              <p class="font-medium">${auction.bidCount || 0}</p>
            </div>
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
          <div class="flex space-x-2">
            <a href="product-detail.html?id=${auction.id}" 
               class="flex-1 bg-primary-600 text-white text-center py-2 rounded-lg hover:bg-primary-700 transition-colors">
              View Details
            </a>
            ${auction.sellerId === this.currentUser?.id ? 
              `<button onclick="editAuction('${auction.id}')" class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <i class="fas fa-edit"></i>
              </button>` : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  renderBidItem(bid) {
    const auction = bid.auction;
    const isWinning = bid.amount === auction.currentBid;
    
    return `
      <div class="bg-white p-4 rounded-lg shadow-md border-l-4 ${isWinning ? 'border-green-500' : 'border-gray-300'}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-lg mb-1">${auction.title}</h3>
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span>Your bid: <strong>$${bid.amount}</strong></span>
              <span>Current bid: <strong>$${auction.currentBid || auction.basePrice}</strong></span>
              <span class="px-2 py-1 rounded-full text-xs font-medium ${isWinning ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                ${isWinning ? 'Winning' : 'Outbid'}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Bid placed: ${new Date(bid.createdAt).toLocaleDateString()}</p>
          </div>
          <a href="product-detail.html?id=${auction.id}" class="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            View Auction
          </a>
        </div>
      </div>
    `;
  }

  renderNotificationItem(notification) {
    const typeIcons = {
      'BID_PLACED': 'fas fa-gavel',
      'AUCTION_WON': 'fas fa-trophy',
      'AUCTION_ENDED': 'fas fa-flag-checkered',
      'OUTBID': 'fas fa-exclamation-triangle'
    };
    
    return `
      <div class="bg-white p-4 rounded-lg shadow-md ${notification.isRead ? 'opacity-75' : 'border-l-4 border-primary-500'}">
        <div class="flex items-start space-x-3">
          <i class="${typeIcons[notification.type] || 'fas fa-bell'} text-primary-600 mt-1"></i>
          <div class="flex-1">
            <p class="font-medium">${notification.title}</p>
            <p class="text-gray-600 text-sm">${notification.message}</p>
            <p class="text-xs text-gray-500 mt-1">${new Date(notification.createdAt).toLocaleDateString()}</p>
          </div>
          ${!notification.isRead ? 
            `<button onclick="markAsRead('${notification.id}')" class="text-primary-600 hover:text-primary-800">
              <i class="fas fa-check"></i>
            </button>` : ''
          }
        </div>
      </div>
    `;
  }

  getEmptyState(type, message, link, linkText) {
    return `
      <div class="text-center py-12">
        <i class="fas fa-${type === 'auctions' ? 'gavel' : type === 'bids' ? 'hand-holding-usd' : type === 'watchlist' ? 'heart' : 'bell'} text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-600 mb-2">${message}</h3>
        ${link ? `<a href="${link}" class="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">${linkText}</a>` : ''}
      </div>
    `;
  }

  getStatusColor(status) {
    const colors = {
      'ACTIVE': 'green',
      'ENDED': 'red',
      'CANCELLED': 'gray',
      'DRAFT': 'yellow'
    };
    return colors[status] || 'gray';
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show target tab content
        tabContents.forEach(content => {
          content.style.display = content.id === targetTab ? 'block' : 'none';
        });
        
        this.currentTab = targetTab;
      });
    });
  }

  bindEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateProfile();
      });
    }

    // Mark all notifications as read
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        this.markAllNotificationsRead();
      });
    }
  }

  async updateProfile() {
    try {
      const formData = new FormData(document.getElementById('profile-form'));
      const profileData = Object.fromEntries(formData);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.data.user;
        localStorage.setItem('userInfo', JSON.stringify(this.currentUser));
        this.showSuccess('Profile updated successfully!');
      } else {
        this.showError('Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      this.showError('Network error updating profile');
    }
  }

  async markAllNotificationsRead() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        this.notifications.forEach(n => n.isRead = true);
        this.renderNotifications();
        this.showSuccess('All notifications marked as read');
      }
    } catch (error) {
      console.error('❌ Error marking notifications read:', error);
    }
  }

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
}

// Global functions
function editAuction(auctionId) {
  window.location.href = `sell-product.html?edit=${auctionId}`;
}

function markAsRead(notificationId) {
  // Implementation for marking single notification as read
  console.log('Mark notification as read:', notificationId);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  new DashboardManager();
}); 