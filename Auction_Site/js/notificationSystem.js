/**
 * Real-time Notification System for Website
 * Handles WebSocket connections, notification display, and user interactions
 */

class NotificationSystem {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://app-c0af435a-abc2-4026-951e-e39dfcfe27c9.cleverapps.io/api';
    // this.wsURL = 'ws://localhost:5000';
    this.wsURL = 'wss://app-c0af435a-abc2-4026-951e-e39dfcfe27c9.cleverapps.io';
    
    this.socket = null;
    this.notifications = [];
    this.unreadCount = 0;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    this.init();
  }

  async init() {
    try {
      // Check if user is authenticated first
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🔒 No auth token found, skipping notification system initialization');
        return;
      }

      await this.loadNotifications();
      
      // Try to create notification UI immediately, then retry if needed
      this.createNotificationUI();
      
      // Set up a retry mechanism for UI creation
      this.setupUIRetry();
      
      this.connectWebSocket();
      this.setupEventListeners();
    } catch (error) {
      console.error('❌ Error initializing notification system:', error);
    }
  }

  // Setup retry mechanism for UI creation
  setupUIRetry() {
    let retryCount = 0;
    const maxRetries = 20; // Try for up to 2 seconds
    
    const retryCreateUI = () => {
      if (retryCount >= maxRetries) {
        console.log('⏰ Max retries reached for notification UI creation');
        return;
      }
      
      // Check if bell already exists
      if (document.querySelector('#notification-bell')) {
        console.log('✅ Notification bell found, stopping retry');
        return;
      }
      
      // Try to create the bell
      this.createNotificationBell();
      
      // If still not found, retry
      if (!document.querySelector('#notification-bell')) {
        retryCount++;
        setTimeout(retryCreateUI, 100);
      }
    };
    
    // Start retry after a short delay
    setTimeout(retryCreateUI, 500);
  }

  createNotificationBell() {
    // Check if notification bell already exists
    if (document.querySelector('#notification-bell')) {
      return;
    }

    // Wait for header to be rendered if needed
    setTimeout(() => {
      // Strategy 1: Try to find the authenticated user menu (when logged in)
      const userMenu = document.querySelector('#user-menu');
      if (userMenu && !userMenu.classList.contains('hidden')) {
        return this.createBellInUserMenu(userMenu);
      }

      // Strategy 2: Try to find the auth buttons container (when not logged in)
      const authButtons = document.querySelector('#auth-buttons');
      if (authButtons && !authButtons.classList.contains('hidden')) {
        return this.createBellInAuthButtons(authButtons);
      }

      // Strategy 3: Fallback to header container
      const headerContainer = document.querySelector('header .container .flex');
      if (headerContainer) {
        return this.createBellInHeaderContainer(headerContainer);
      }
    }, 100);
  }

  createBellInUserMenu(userMenu) {
    const sellProductLink = userMenu.querySelector('.sell-your-product_Navbar');
    const bellContainer = this.createBellElement();
    
    if (sellProductLink) {
      userMenu.insertBefore(bellContainer, sellProductLink.nextSibling);
    } else {
      userMenu.insertBefore(bellContainer, userMenu.firstChild);
    }
    
    this.updateNotificationBadge();
    return true;
  }

  createBellInAuthButtons(authButtons) {
    const sellProductLink = authButtons.querySelector('.sell-your-product_Navbar');
    const bellContainer = this.createBellElement();
    
    if (sellProductLink) {
      authButtons.insertBefore(bellContainer, sellProductLink);
    } else {
      authButtons.appendChild(bellContainer);
    }
    
    this.updateNotificationBadge();
    return true;
  }

  createBellInHeaderContainer(headerContainer) {
    // Find the auth section (last child) and add before it
    const authSection = headerContainer.querySelector('.hidden.md\\:flex');
    if (authSection) {
      const bellContainer = this.createBellElement();
      headerContainer.insertBefore(bellContainer, authSection);
      
      this.updateNotificationBadge();
      return true;
    }
    return false;
  }

  createBellElement() {
    const bellContainer = document.createElement('div');
    bellContainer.className = 'relative flex items-center mr-4';
    bellContainer.innerHTML = `
      <button class="relative p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 focus:outline-none rounded-lg flex items-center justify-center w-10 h-10 hover:bg-primary-50" id="notification-bell" title="Notifications">
        <i class="fas fa-bell text-lg"></i>
        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center transform scale-0 transition-transform duration-200 border-2 border-white" id="notification-badge" style="display: none;">0</span>
      </button>
    `;
    return bellContainer;
  }

  // WebSocket Connection
  connectWebSocket() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('🔒 No auth token found, skipping WebSocket connection');
      return;
    }

    try {
      // Close existing connection if any
      if (this.socket) {
        this.socket.close();
      }

      console.log('🔗 Attempting WebSocket connection to:', this.wsURL);
      console.log('🔑 Using token:', token.substring(0, 20) + '...');
      this.socket = new WebSocket(`${this.wsURL}?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data);
          console.log('📨 Message type:', data.type);
          console.log('📨 Full message data:', JSON.stringify(data, null, 2));
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.updateConnectionStatus(false);
        
        // Only attempt reconnection if it wasn't a manual close
        if (event.code !== 1000) {
          this.handleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.isConnected = false;
        this.updateConnectionStatus(false);
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  handleWebSocketMessage(data) {
    console.log('🔄 Processing WebSocket message type:', data.type);
    
    switch (data.type) {
      case 'connection_confirmed':
        console.log('✅ WebSocket connection confirmed');
        break;
      case 'notification':
        console.log('🔔 New notification received:', data.notification);
        this.addNewNotification(data.notification);
        break;
      case 'notification_read':
        console.log('👀 Notification marked as read:', data.notificationId);
        this.markNotificationAsRead(data.notificationId);
        break;
      case 'unread_count':
        console.log('🔢 Unread count update:', data.count);
        this.updateUnreadCount(data.count);
        break;
      default:
        console.log('❓ Unknown WebSocket message type:', data.type, data);
    }
  }

  // API Methods
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async loadNotifications() {
    try {
      const response = await this.makeAuthenticatedRequest('/users/notifications?limit=20');
      
      if (response.success) {
        this.notifications = response.data.notifications || [];
        this.unreadCount = response.data.unreadCount || 0;
        this.updateNotificationUI();
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await this.makeAuthenticatedRequest(`/users/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      if (response.success) {
        this.markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  async markAllAsRead() {
    try {
      const response = await this.makeAuthenticatedRequest('/users/notifications/read-all', {
        method: 'PUT'
      });

      if (response.success) {
        this.notifications.forEach(notification => {
          notification.isRead = true;
        });
        this.unreadCount = 0;
        this.updateNotificationUI();
        this.showToast('All notifications marked as read', 'success');
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      this.showToast('Failed to mark all notifications as read', 'error');
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await this.makeAuthenticatedRequest(`/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateNotificationUI();
        this.showToast('Notification deleted', 'success');
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      this.showToast('Failed to delete notification', 'error');
    }
  }

  // UI Methods
  createNotificationUI() {
    // Create notification bell in header
    this.createNotificationBell();
    
    // Create notification dropdown
    this.createNotificationDropdown();
    
    // Create notification modal
    this.createNotificationModal();
  }

  createNotificationDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'fixed top-16 right-4 w-96 max-h-96 bg-white rounded-xl shadow-2xl border border-primary-100 z-50 hidden overflow-hidden';
    dropdown.id = 'notification-dropdown';
    dropdown.innerHTML = `
      <div class="absolute -top-2 right-8 w-4 h-4 bg-white border border-primary-100 border-b-0 border-r-0 transform rotate-45 z-10"></div>
      <div class="px-6 py-5 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-primary-100 relative z-20">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-primary-600 font-poppins">Notifications</h3>
          <div class="flex gap-2">
            <button class="bg-white border border-primary-200 text-primary-600 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 transform hover:-translate-y-0.5" id="mark-all-read">Mark All Read</button>
            <button class="bg-primary-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-primary-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-primary-200" id="view-all-notifications">View All</button>
          </div>
        </div>
      </div>
      <div class="max-h-80 overflow-y-auto" id="notification-dropdown-list" style="scrollbar-width: thin; scrollbar-color: #bae6fd #f0f9ff;">
        <div class="flex flex-col items-center justify-center py-12 text-gray-500">
          <i class="fas fa-bell text-3xl mb-4 text-primary-200"></i>
          <span class="text-sm">Loading notifications...</span>
        </div>
      </div>
    `;

    document.body.appendChild(dropdown);
  }

  createNotificationModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4';
    modal.id = 'notification-modal';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden relative">
        <div class="px-6 py-5 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-primary-100 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-primary-600 font-poppins">All Notifications</h2>
          <button class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors" id="close-notification-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="px-6 py-4 border-b border-primary-100 bg-white flex justify-between items-center">
          <button class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium" id="modal-mark-all-read">Mark All as Read</button>
          <div class="flex items-center gap-2 text-sm text-gray-600" id="connection-status">
            <i class="fas fa-circle text-green-500"></i>
            <span>Connected</span>
          </div>
        </div>
        <div class="max-h-96 overflow-y-auto bg-white" id="notification-modal-list">
          <div class="flex flex-col items-center justify-center py-12 text-gray-500">
            <i class="fas fa-bell text-4xl mb-4 text-primary-200"></i>
            <span class="text-sm">Loading notifications...</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  setupEventListeners() {
    // Notification bell click
    document.addEventListener('click', (e) => {
      if (e.target.closest('#notification-bell')) {
        this.toggleNotificationDropdown();
      } else if (!e.target.closest('.notification-dropdown')) {
        this.hideNotificationDropdown();
      }
    });

    // Mark all as read buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('#mark-all-read') || e.target.closest('#modal-mark-all-read')) {
        this.markAllAsRead();
      }
    });

    // View all notifications
    document.addEventListener('click', (e) => {
      if (e.target.closest('#view-all-notifications')) {
        this.showNotificationModal();
      }
    });

    // Close modal
    document.addEventListener('click', (e) => {
      if (e.target.closest('#close-notification-modal') || 
          e.target.closest('.notification-modal-backdrop')) {
        this.hideNotificationModal();
      }
    });

    // Notification item clicks
    document.addEventListener('click', (e) => {
      const notificationItem = e.target.closest('.notification-item');
      if (notificationItem) {
        const notificationId = notificationItem.dataset.notificationId;
        const auctionId = notificationItem.dataset.auctionId;
        
        this.handleNotificationClick(notificationId, auctionId);
      }
    });

    // Delete notification
    document.addEventListener('click', (e) => {
      if (e.target.closest('.notification-delete')) {
        e.stopPropagation();
        const notificationId = e.target.closest('.notification-item').dataset.notificationId;
        this.deleteNotification(notificationId);
      }
    });
  }

  toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    const isVisible = dropdown.style.display === 'block';
    
    if (isVisible) {
      this.hideNotificationDropdown();
    } else {
      this.showNotificationDropdown();
    }
  }

  showNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    const bell = document.getElementById('notification-bell');
    
    if (!dropdown || !bell) return;

    // Position dropdown
    const rect = bell.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + 10}px`;
    dropdown.style.right = `${window.innerWidth - rect.right}px`;
    dropdown.style.display = 'block';

    // Update dropdown content
    this.updateDropdownContent();
  }

  hideNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  }

  showNotificationModal() {
    const modal = document.getElementById('notification-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.updateModalContent();
    }
    this.hideNotificationDropdown();
  }

  hideNotificationModal() {
    const modal = document.getElementById('notification-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  updateNotificationUI() {
    this.updateNotificationBadge();
    this.updateDropdownContent();
    this.updateModalContent();
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    if (this.unreadCount > 0) {
      badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      badge.style.display = 'flex';
      badge.classList.remove('scale-0');
      badge.classList.add('scale-100', 'animate-pulse');
      
      // Remove pulse after 2 seconds
      setTimeout(() => {
        badge.classList.remove('animate-pulse');
      }, 2000);
    } else {
      badge.classList.add('scale-0');
      badge.classList.remove('scale-100', 'animate-pulse');
      setTimeout(() => {
        if (badge.classList.contains('scale-0')) {
          badge.style.display = 'none';
        }
      }, 200);
    }
  }

  updateDropdownContent() {
    const list = document.getElementById('notification-dropdown-list');
    if (!list) return;

    const recentNotifications = this.notifications.slice(0, 5);
    
    if (recentNotifications.length === 0) {
      list.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-bell-slash"></i>
          <span>No notifications</span>
        </div>
      `;
      return;
    }

    list.innerHTML = recentNotifications.map(notification => 
      this.renderNotificationItem(notification)
    ).join('');
  }

  updateModalContent() {
    const list = document.getElementById('notification-modal-list');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-bell-slash"></i>
          <span>No notifications</span>
        </div>
      `;
      return;
    }

    list.innerHTML = this.notifications.map(notification => 
      this.renderNotificationItem(notification, true)
    ).join('');
  }

  renderNotificationItem(notification, showDelete = false) {
    const timeAgo = this.getTimeAgo(notification.createdAt);
    const iconClass = this.getNotificationIcon(notification.type);
    const isUnread = !notification.isRead;
    
    return `
      <div class="flex items-start gap-3 p-4 border-b border-primary-50 cursor-pointer transition-all duration-200 hover:bg-primary-50 hover:translate-x-1 ${isUnread ? 'bg-primary-100 border-l-4 border-l-primary-600' : 'bg-white'}" 
           onclick="window.notificationSystem.handleNotificationClick('${notification.id}', '${notification.auction?.id || ''}')"
           data-notification-id="${notification.id}">
        
        <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${isUnread ? 'bg-primary-600 text-white border-primary-600' : 'bg-primary-50 text-primary-600 border-primary-200'}">
          <i class="fas ${iconClass}"></i>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold ${isUnread ? 'text-primary-600' : 'text-gray-900'} mb-1 leading-tight font-poppins">
            ${notification.title}
          </div>
          <div class="text-sm text-gray-600 mb-2 leading-relaxed">
            ${notification.message}
          </div>
          ${notification.auction ? `
            <div class="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-md inline-block mb-2">
              ${notification.auction.title}
            </div>
          ` : ''}
          <div class="text-xs text-gray-400">
            ${timeAgo}
          </div>
        </div>
        
        ${isUnread ? `
          <div class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2"></div>
        ` : ''}
        
        ${showDelete ? `
          <button class="text-gray-400 hover:text-red-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110" 
                  onclick="event.stopPropagation(); window.notificationSystem.deleteNotification('${notification.id}')">
            <i class="fas fa-trash text-xs"></i>
          </button>
        ` : ''}
      </div>
    `;
  }

  getNotificationIcon(type) {
    switch (type) {
      case 'BID_PLACED': return 'fa-hand-paper';
      case 'BID_OUTBID': return 'fa-exclamation-triangle';
      case 'AUCTION_WON': return 'fa-trophy';
      case 'AUCTION_ENDED': return 'fa-clock';
      case 'AUCTION_STARTING': return 'fa-play';
      default: return 'fa-bell';
    }
  }

  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  }

  // Event Handlers
  handleNotificationClick(notificationId, auctionId) {
    // Mark as read
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      this.markAsRead(notificationId);
    }

    // Navigate to auction if available
    if (auctionId) {
      window.location.href = `/product-detail.html?id=${auctionId}`;
    }

    // Hide dropdown
    this.hideNotificationDropdown();
  }

  updateConnectionStatus(isConnected) {
    const status = document.getElementById('connection-status');
    if (!status) return;

    const icon = status.querySelector('i');
    const text = status.querySelector('span');

    if (isConnected) {
      icon.className = 'fas fa-circle text-success';
      text.textContent = 'Connected';
      status.className = 'notification-connection-status connected';
    } else {
      icon.className = 'fas fa-circle text-danger';
      text.textContent = 'Disconnected';
      status.className = 'notification-connection-status disconnected';
    }
  }

  // Notification Management
  addNewNotification(notification) {
    console.log('➕ Adding new notification:', notification);
    this.notifications.unshift(notification);
    if (!notification.isRead) {
      this.unreadCount++;
      console.log('📊 Unread count increased to:', this.unreadCount);
    }
    
    console.log('🔄 Updating notification UI...');
    this.updateNotificationUI();
    console.log('🔔 Showing in-app notification...');
    this.showInAppNotification(notification);
  }

  markNotificationAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.updateNotificationUI();
    }
  }

  updateUnreadCount(count) {
    this.unreadCount = count;
    this.updateNotificationBadge();
  }

  showInAppNotification(notification) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 w-80 bg-white rounded-xl shadow-2xl border border-primary-100 z-50 transform translate-x-full opacity-0 transition-all duration-300 font-poppins';
    toast.innerHTML = `
      <div class="flex items-start gap-3 p-4">
        <div class="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0">
          <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-semibold text-gray-900 mb-1 leading-tight">
            ${notification.title}
          </div>
          <div class="text-sm text-gray-600 leading-relaxed">
            ${notification.message}
          </div>
        </div>
        <button class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Add click handler
    toast.addEventListener('click', () => {
      this.handleNotificationClick(notification.id, notification.auction?.id);
      toast.remove();
    });

    // Add close handler
    toast.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      toast.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-primary-600';
    const icon = type === 'success' ? 'fa-check' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info';
    
    toast.className = `fixed bottom-8 right-8 ${bgColor} text-white px-6 py-4 rounded-lg shadow-xl z-50 transform translate-y-24 opacity-0 transition-all duration-300 font-poppins`;
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas ${icon}"></i>
        <span class="font-medium">${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-24', 'opacity-0');
    }, 100);

    setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Debug function to test WebSocket connection
  testWebSocketConnection() {
    console.log('🧪 Testing WebSocket connection...');
    console.log('📍 WebSocket URL:', this.wsURL);
    console.log('🔌 Connection status:', this.isConnected);
    console.log('🔑 Auth token exists:', !!localStorage.getItem('accessToken'));
    
    if (this.socket) {
      console.log('📡 WebSocket state:', this.socket.readyState);
      console.log('📡 WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3');
    } else {
      console.log('❌ No WebSocket instance found');
    }
    
    // Try to reconnect
    this.connectWebSocket();
  }

  // Cleanup
  destroy() {
    if (this.socket) {
      this.socket.close();
    }
    
    // Remove UI elements
    const elements = [
      'notification-dropdown',
      'notification-modal',
      'notification-bell-container'
    ];
    
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.remove();
      }
    });
  }
}

// Initialize notification system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for header to be loaded first
  setTimeout(() => {
    // Only initialize if user is logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      window.notificationSystem = new NotificationSystem();
    }
    
    // Listen for login events to initialize notifications
    window.addEventListener('userLoggedIn', () => {
      if (!window.notificationSystem) {
        setTimeout(() => {
          window.notificationSystem = new NotificationSystem();
        }, 500);
      }
    });
    
    // Listen for logout events to cleanup notifications
    window.addEventListener('userLoggedOut', () => {
      if (window.notificationSystem) {
        window.notificationSystem.destroy();
        window.notificationSystem = null;
      }
    });
  }, 1000);
});

// Export for use in other scripts
window.NotificationSystem = NotificationSystem;

// Add method to manually initialize (for debugging)
window.initNotifications = () => {
  if (window.notificationSystem) {
    window.notificationSystem.destroy();
  }
  window.notificationSystem = new NotificationSystem();
};

// Debug function to test notification bell creation
window.testNotificationBell = () => {
  console.log('🔍 Testing notification bell creation...');
  
  // Check authentication
  const token = localStorage.getItem('accessToken');
  console.log('Token exists:', !!token);
  
  // Check various header elements
  const authButtons = document.querySelector('#auth-buttons');
  console.log('Auth buttons found:', !!authButtons);
  if (authButtons) {
    console.log('Auth buttons is hidden:', authButtons.classList.contains('hidden'));
  }
  
  const userMenu = document.querySelector('#user-menu');
  console.log('User menu found:', !!userMenu);
  if (userMenu) {
    console.log('User menu is hidden:', userMenu.classList.contains('hidden'));
  }
  
  const headerContainer = document.querySelector('header .container .flex');
  console.log('Header container found:', !!headerContainer);
  
  const existingBell = document.querySelector('#notification-bell');
  console.log('Existing bell found:', !!existingBell);
  
  // Try to create bell manually
  if (window.notificationSystem) {
    window.notificationSystem.createNotificationBell();
  }
}; 