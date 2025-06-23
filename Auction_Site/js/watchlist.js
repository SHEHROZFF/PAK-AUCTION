/**
 * Watchlist Management Module
 * Handles adding/removing items from watchlist, viewing watchlist
 */

class WatchlistManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.watchlist = [];
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    console.log('🚀 Initializing Watchlist Manager...');
    this.checkAuthentication();
  }

  checkAuthentication() {
    const token = localStorage.getItem('accessToken');
    this.isAuthenticated = !!token;
  }

  /**
   * Add item to watchlist
   */
  async addToWatchlist(auctionId) {
    if (!this.isAuthenticated) {
      this.showError('Please login to add items to watchlist');
      return false;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/auctions/${auctionId}/watchlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Added to watchlist:', data);
        this.showSuccess('Added to watchlist!');
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to watchlist');
      }
    } catch (error) {
      console.error('❌ Error adding to watchlist:', error);
      this.showError(error.message || 'Failed to add to watchlist');
      return false;
    }
  }

  /**
   * Remove item from watchlist
   */
  async removeFromWatchlist(auctionId) {
    if (!this.isAuthenticated) {
      this.showError('Please login to manage watchlist');
      return false;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/auctions/${auctionId}/watchlist`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Removed from watchlist:', data);
        this.showSuccess('Removed from watchlist!');
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove from watchlist');
      }
    } catch (error) {
      console.error('❌ Error removing from watchlist:', error);
      this.showError(error.message || 'Failed to remove from watchlist');
      return false;
    }
  }

  /**
   * Check if item is in watchlist
   */
  async isInWatchlist(auctionId) {
    if (!this.isAuthenticated) {
      return false;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // Try the new specific endpoint first
      const statusResponse = await fetch(`${this.baseURL}/auctions/${auctionId}/watchlist-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('✅ Watchlist status from new endpoint:', statusData.data);
        return statusData.data.isWatched;
      }

      // Fallback to getting full watchlist
      console.log('⚠️ Falling back to watchlist endpoint');
      const response = await fetch(`${this.baseURL}/users/watchlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.watchlist = data.data.watchlist;
        return this.watchlist.some(item => item.auctionId === auctionId);
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking watchlist status:', error);
      return false;
    }
  }

  /**
   * Get user's full watchlist
   */
  async getWatchlist() {
    if (!this.isAuthenticated) {
      return [];
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/users/watchlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.watchlist = data.data.watchlist;
        return this.watchlist;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error getting watchlist:', error);
      return [];
    }
  }

  /**
   * Toggle watchlist status for an auction
   */
  async toggleWatchlist(auctionId) {
    if (!this.isAuthenticated) {
      this.showError('Please login to manage watchlist');
      return false;
    }

    try {
      console.log(`❤️ Toggling watchlist for auction: ${auctionId}`);
      
      // Check current status first
      const currentStatus = await this.isInWatchlist(auctionId);
      console.log(`❤️ Current watchlist status: ${currentStatus ? 'In watchlist' : 'Not in watchlist'}`);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/auctions/${auctionId}/watchlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newStatus = data.data.isWatched;
        
        console.log(`✅ Watchlist toggled successfully:`, data);
        console.log(`❤️ New status: ${newStatus ? 'Added to watchlist' : 'Removed from watchlist'}`);
        
        // Show appropriate success message
        const message = newStatus ? 'Added to watchlist!' : 'Removed from watchlist!';
        this.showSuccess(message);
        
        // Update local watchlist cache if we have it
        if (this.watchlist && Array.isArray(this.watchlist)) {
          if (newStatus) {
            // Add to local cache if not already present
            const exists = this.watchlist.some(item => item.auctionId === auctionId);
            if (!exists) {
              this.watchlist.push({ auctionId, addedAt: new Date() });
            }
          } else {
            // Remove from local cache
            this.watchlist = this.watchlist.filter(item => item.auctionId !== auctionId);
          }
        }
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle watchlist');
      }
    } catch (error) {
      console.error('❌ Error toggling watchlist:', error);
      this.showError(error.message || 'Failed to update watchlist');
      return false;
    }
  }

  /**
   * Update watchlist button UI
   */
  updateWatchlistButton(auctionId, isInWatchlist) {
    const watchlistBtn = document.getElementById('watchlist-btn');
    const watchlistText = document.getElementById('watchlist-text');
    
    if (!watchlistBtn) return;

    if (!this.isAuthenticated) {
      watchlistBtn.style.display = 'none';
      return;
    }

    watchlistBtn.style.display = 'block';
    
    if (isInWatchlist) {
      watchlistBtn.className = 'w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-md hover:bg-red-100 transition duration-300 flex items-center justify-center';
      watchlistBtn.innerHTML = '<i class="fas fa-heart text-red-500 mr-2"></i><span>Remove from Watchlist</span>';
    } else {
      watchlistBtn.className = 'w-full bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition duration-300 flex items-center justify-center';
      watchlistBtn.innerHTML = '<i class="far fa-heart mr-2"></i><span>Add to Watchlist</span>';
    }
  }

  /**
   * Create watchlist page/modal content
   */
  createWatchlistModal() {
    const modal = document.createElement('div');
    modal.id = 'watchlist-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900 flex items-center">
              <i class="fas fa-heart text-red-500 mr-2"></i>
              My Watchlist
            </h3>
            <button onclick="closeWatchlistModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <!-- Loading state -->
          <div id="watchlist-loading" class="text-center py-8">
            <div class="inline-flex items-center space-x-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span class="text-gray-600">Loading watchlist...</span>
            </div>
          </div>

          <!-- Watchlist items -->
          <div id="watchlist-items" class="hidden">
            <!-- Items will be populated dynamically -->
          </div>

          <!-- Empty state -->
          <div id="empty-watchlist" class="text-center py-12 hidden">
            <i class="fas fa-heart text-gray-300 text-6xl mb-4"></i>
            <h3 class="text-xl font-medium text-gray-600 mb-2">Your watchlist is empty</h3>
            <p class="text-gray-500 mb-6">Start adding auctions to keep track of items you're interested in.</p>
            <a href="products.html" class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Browse Auctions
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Load watchlist items
    this.loadWatchlistModal();
    
    return modal;
  }

  async loadWatchlistModal() {
    const loadingEl = document.getElementById('watchlist-loading');
    const itemsEl = document.getElementById('watchlist-items');
    const emptyEl = document.getElementById('empty-watchlist');
    
    try {
      const watchlist = await this.getWatchlist();
      
      // Hide loading
      if (loadingEl) loadingEl.style.display = 'none';
      
      if (watchlist.length === 0) {
        // Show empty state
        if (emptyEl) emptyEl.classList.remove('hidden');
      } else {
        // Show watchlist items
        if (itemsEl) {
          itemsEl.classList.remove('hidden');
          itemsEl.innerHTML = this.renderWatchlistItems(watchlist);
        }
      }
    } catch (error) {
      console.error('❌ Error loading watchlist modal:', error);
      if (loadingEl) {
        loadingEl.innerHTML = `
          <div class="text-center py-8">
            <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-2"></i>
            <p class="text-red-600">Failed to load watchlist</p>
          </div>
        `;
      }
    }
  }

  renderWatchlistItems(watchlist) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${watchlist.map(item => this.renderWatchlistItem(item)).join('')}
      </div>
    `;
  }

  renderWatchlistItem(item) {
    const auction = item.auction;
    const imageUrl = auction.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image';
    const timeLeft = this.getTimeLeft(auction.endTime);
    
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div class="relative">
          <img src="${imageUrl}" alt="${auction.title}" class="w-full h-48 object-cover">
          <button 
            onclick="removeFromWatchlistModal('${auction.id}')"
            class="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            title="Remove from watchlist"
          >
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-2 line-clamp-2">${auction.title}</h3>
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">Current Bid</span>
            <span class="font-bold text-lg text-primary-600">${this.formatCurrency(Number(auction.currentBid || auction.basePrice))}</span>
          </div>
          <div class="flex justify-between items-center mb-4">
            <span class="text-sm text-gray-500">Time Left</span>
            <span class="text-sm font-medium ${timeLeft.expired ? 'text-red-500' : 'text-green-600'}">${timeLeft.text}</span>
          </div>
          <div class="flex space-x-2">
            <a 
              href="product-detail.html?id=${auction.id}" 
              class="flex-1 bg-primary-600 text-white text-center py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Auction
            </a>
            <button 
              onclick="removeFromWatchlistModal('${auction.id}')"
              class="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Remove from watchlist"
            >
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getTimeLeft(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      return { expired: true, text: 'Ended' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h` };
    } else {
      return { expired: false, text: `${minutes}m` };
    }
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

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
    notification.innerHTML = `
      <i class="fas fa-check-circle mr-2"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle mr-2"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
}

// Global functions
function closeWatchlistModal() {
  const modal = document.getElementById('watchlist-modal');
  if (modal) {
    modal.remove();
  }
}

async function removeFromWatchlistModal(auctionId) {
  const watchlistManager = window.watchlistManager || new WatchlistManager();
  const success = await watchlistManager.removeFromWatchlist(auctionId);
  
  if (success) {
    // Reload the modal content
    watchlistManager.loadWatchlistModal();
  }
}

function openWatchlistModal() {
  const watchlistManager = window.watchlistManager || new WatchlistManager();
  watchlistManager.createWatchlistModal();
}

// Export for use in other modules
window.WatchlistManager = WatchlistManager; 