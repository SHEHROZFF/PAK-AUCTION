/**
 * Profile Management System
 * Handles profile display, editing, photo upload, and activity tracking
 */

class ProfileManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://app-c0af435a-abc2-4026-951e-e39dfcfe27c9.cleverapps.io/api';
    this.currentUser = null;
    this.dashboardData = null;
    this.selectedFile = null;
    this.originalProfileData = {};
    this.init();
  }

  // Initialize profile manager
  init() {
    console.log('🔧 Initializing Profile Manager...');
    
    // Check authentication first
    if (!window.authManager || !window.authManager.currentUser) {
      console.log('❌ User not authenticated, redirecting to login');
      window.location.href = 'login.html';
      return;
    }

    this.currentUser = window.authManager.currentUser;
    this.bindEventListeners();
    this.loadProfileData();
    this.loadDashboardData();
    
    // Handle URL parameters for direct tab navigation
    this.handleURLParameters();
  }

  // Handle URL parameters for direct tab navigation
  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    
    if (tab) {
      const tabButton = document.getElementById(`tab-${tab}`);
      if (tabButton) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          this.switchTab(`tab-${tab}`);
        }, 100);
      }
    }
  }

  // Bind all event listeners
  bindEventListeners() {
    // Tab switching
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.id));
    });

    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    // Cancel profile changes
    const cancelBtn = document.getElementById('cancel-profile-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancelProfileChanges());
    }

    // Photo upload
    const photoUploadBtn = document.getElementById('photo-upload-btn');
    const photoUploadInput = document.getElementById('photo-upload-input');
    
    if (photoUploadBtn) {
      photoUploadBtn.addEventListener('click', () => photoUploadInput.click());
    }
    
    if (photoUploadInput) {
      photoUploadInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
    }

    // Photo upload modal
    this.bindPhotoModalEvents();

    // Change password
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => this.showChangePasswordModal());
    }

    // Change password modal
    this.bindPasswordModalEvents();

    // Resend verification
    const resendBtn = document.getElementById('resend-verification-btn');
    if (resendBtn) {
      resendBtn.addEventListener('click', () => this.resendVerification());
    }
  }

  // Switch between tabs
  switchTab(tabId) {
    // Remove active class from all tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
      tab.classList.remove('active', 'border-primary-600', 'text-primary-600');
      tab.classList.add('text-gray-500');
    });

    // Add active class to clicked tab
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add('active', 'border-primary-600', 'text-primary-600');
    activeTab.classList.remove('text-gray-500');

    // Hide all content
    document.querySelectorAll('.profile-content').forEach(content => {
      content.classList.add('hidden');
    });

    // Show active content
    const contentId = tabId.replace('tab-', 'content-');
    const activeContent = document.getElementById(contentId);
    if (activeContent) {
      activeContent.classList.remove('hidden');
    }

    // Load data for specific tabs
    if (tabId === 'tab-activity' && !this.dashboardData) {
      this.loadDashboardData();
    }
  }

  // Load profile data
  async loadProfileData() {
    try {
      console.log('📊 Loading profile data...');
      
      // Use current user data for immediate display
      this.displayProfileData(this.currentUser);
      this.populateProfileForm(this.currentUser);
      this.updateVerificationStatus(this.currentUser);

      // Fetch fresh data from backend
      const response = await this.makeAuthenticatedRequest('/auth/profile');
      
      if (response.success) {
        const userData = response.data.user;
        this.currentUser = userData;
        
        // Update displays with fresh data
        this.displayProfileData(userData);
        this.populateProfileForm(userData);
        this.updateVerificationStatus(userData);
        
        // Store original data for cancel functionality
        this.originalProfileData = { ...userData };
        
        console.log('✅ Profile data loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load profile data:', error);
      this.showMessage('Failed to load profile data', 'error');
    }
  }

  // Display profile data in header section
  displayProfileData(userData) {
    // Profile name
    const nameElement = document.getElementById('profile-name');
    if (nameElement && userData.firstName && userData.lastName) {
      nameElement.textContent = `${userData.firstName} ${userData.lastName}`;
    }

    // Profile email
    const emailElement = document.getElementById('profile-email');
    if (emailElement && userData.email) {
      emailElement.textContent = userData.email;
    }

    // Profile photo
    const profilePhoto = document.getElementById('profile-photo');
    if (profilePhoto) {
      console.log('🔍 DEBUG: userData.profilePhoto =', userData.profilePhoto);
      if (userData.profilePhoto) {
        // Simple: just add server URL to the image path
        const fullUrl = `http://localhost:5000${userData.profilePhoto}`;
        console.log('🔍 DEBUG: Setting profilePhoto.src =', fullUrl);
        profilePhoto.src = fullUrl;
      } else {
        console.log('🔍 DEBUG: No profilePhoto in userData, using placeholder');
        // Use local SVG placeholder instead of external service
        profilePhoto.src = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
            <rect width="150" height="150" fill="#e5e7eb"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">Profile</text>
          </svg>
        `);
      }
    }

    // Join date
    const joinDateElement = document.getElementById('profile-join-date');
    if (joinDateElement && userData.createdAt) {
      const joinDate = new Date(userData.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      joinDateElement.textContent = `Member since: ${joinDate}`;
    }

    // Verification status
    const statusElement = document.getElementById('profile-verification-status');
    if (statusElement) {
      if (userData.isEmailVerified) {
        statusElement.textContent = 'Verified';
        statusElement.className = 'px-2 py-1 rounded-full text-xs bg-green-100 text-green-800';
      } else {
        statusElement.textContent = 'Unverified';
        statusElement.className = 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-800';
      }
    }
  }

  // Populate profile form with user data
  populateProfileForm(userData) {
    const fields = ['firstName', 'lastName', 'email', 'username', 'phone', 'marketingEmails'];
    
    fields.forEach(field => {
      const element = document.getElementById(field);
      if (element && userData[field] !== undefined) {
        if (element.type === 'checkbox') {
          element.checked = userData[field];
        } else {
          element.value = userData[field] || '';
        }
      }
    });

    // Handle date of birth separately
    const dobElement = document.getElementById('dateOfBirth');
    if (dobElement && userData.dateOfBirth) {
      const date = new Date(userData.dateOfBirth);
      dobElement.value = date.toISOString().split('T')[0];
    }
  }

  // Update verification status
  updateVerificationStatus(userData) {
    const verificationText = document.getElementById('verification-text');
    const resendBtn = document.getElementById('resend-verification-btn');
    
    if (verificationText) {
      if (userData.isEmailVerified) {
        verificationText.innerHTML = '<i class="fas fa-check-circle text-green-500 mr-2"></i>Your email is verified';
        if (resendBtn) resendBtn.classList.add('hidden');
      } else {
        verificationText.innerHTML = '<i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>Your email is not verified';
        if (resendBtn) resendBtn.classList.remove('hidden');
      }
    }
  }

  // Handle profile form submission
  async handleProfileUpdate(e) {
    e.preventDefault();
    
    try {
      console.log('💾 Updating profile...');
      
      const formData = new FormData(e.target);
      const updateData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        marketingEmails: formData.has('marketingEmails')
      };

      // Remove empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key];
        }
      });

      const response = await this.makeAuthenticatedRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.success) {
        this.currentUser = response.data.user;
        this.originalProfileData = { ...response.data.user };
        
        // Update displays
        this.displayProfileData(this.currentUser);
        
        // Update stored user info
        localStorage.setItem('userInfo', JSON.stringify(this.currentUser));
        
        this.showMessage('Profile updated successfully!', 'success');
        console.log('✅ Profile updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      this.showMessage(error.message || 'Failed to update profile', 'error');
    }
  }

  // Cancel profile changes
  cancelProfileChanges() {
    this.populateProfileForm(this.originalProfileData);
    this.showMessage('Changes cancelled', 'info');
  }

  // Handle photo selection
  handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showMessage('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showMessage('File size must be less than 5MB', 'error');
      return;
    }

    this.selectedFile = file;
    this.showPhotoUploadModal(file);
  }

  // Show photo upload modal
  showPhotoUploadModal(file) {
    const modal = document.getElementById('photo-upload-modal');
    const previewImg = document.getElementById('preview-image');
    const placeholder = document.getElementById('preview-placeholder');

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.classList.remove('hidden');
      placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);

    modal.classList.remove('hidden');
  }

  // Bind photo modal events
  bindPhotoModalEvents() {
    const modal = document.getElementById('photo-upload-modal');
    const closeBtn = document.getElementById('close-photo-modal');
    const cancelBtn = document.getElementById('cancel-photo-btn');
    const uploadBtn = document.getElementById('upload-photo-btn');

    [closeBtn, cancelBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.hidePhotoUploadModal());
      }
    });

    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => this.uploadProfilePhoto());
    }

    // Close on backdrop click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hidePhotoUploadModal();
        }
      });
    }
  }

  // Hide photo upload modal
  hidePhotoUploadModal() {
    const modal = document.getElementById('photo-upload-modal');
    const previewImg = document.getElementById('preview-image');
    const placeholder = document.getElementById('preview-placeholder');

    modal.classList.add('hidden');
    previewImg.classList.add('hidden');
    placeholder.classList.remove('hidden');
    previewImg.src = '';
    this.selectedFile = null;
  }

  // Upload profile photo
  async uploadProfilePhoto() {
    if (!this.selectedFile) return;

    try {
      console.log('📸 Uploading profile photo...');
      
      const formData = new FormData();
      formData.append('images', this.selectedFile);

      const response = await this.makeAuthenticatedRequest('/images/upload', {
        method: 'POST',
        body: formData
      });

      if (response.success && response.data.images.length > 0) {
        const imageUrl = response.data.images[0].url;
        console.log('📷 Image uploaded successfully, URL:', imageUrl);
        
        // Update user profile with photo URL
        const profileUpdateResponse = await this.makeAuthenticatedRequest('/users/profile', {
          method: 'PUT',
          body: JSON.stringify({ profilePhoto: imageUrl })
        });

        console.log('📝 Profile update response:', profileUpdateResponse);

        if (profileUpdateResponse.success) {
          console.log('✅ Profile updated in database');
          
          // Update current user data
          this.currentUser.profilePhoto = imageUrl;
          localStorage.setItem('userInfo', JSON.stringify(this.currentUser));
          console.log('💾 Updated current user with photo:', imageUrl);
          
          // Update profile photo display immediately
          const profilePhoto = document.getElementById('profile-photo');
          if (profilePhoto) {
            const fullUrl = `http://localhost:5000${imageUrl}`;
            console.log('🖼️ Setting image src to:', fullUrl);
            profilePhoto.src = fullUrl;
          }

          // Force refresh profile data to make sure everything is updated
          await this.loadProfileData();

          this.hidePhotoUploadModal();
          this.showMessage('Profile photo updated successfully!', 'success');
          console.log('✅ Profile photo upload complete');
        } else {
          console.error('❌ Failed to update profile in database:', profileUpdateResponse);
          throw new Error('Failed to save photo to profile');
        }
      } else {
        console.error('❌ Upload response invalid:', response);
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('❌ Photo upload failed:', error);
      this.showMessage('Failed to upload photo', 'error');
    }
  }

  // Show change password modal
  showChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    modal.classList.remove('hidden');
  }

  // Bind password modal events
  bindPasswordModalEvents() {
    const modal = document.getElementById('change-password-modal');
    const closeBtn = document.getElementById('close-password-modal');
    const cancelBtn = document.getElementById('cancel-password-btn');
    const form = document.getElementById('change-password-form');

    [closeBtn, cancelBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => this.hideChangePasswordModal());
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => this.handleChangePassword(e));
    }

    // Close on backdrop click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideChangePasswordModal();
        }
      });
    }
  }

  // Hide change password modal
  hideChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    const form = document.getElementById('change-password-form');
    
    modal.classList.add('hidden');
    if (form) form.reset();
  }

  // Handle password change
  async handleChangePassword(e) {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.target);
      const currentPassword = formData.get('currentPassword');
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        this.showMessage('New passwords do not match', 'error');
        return;
      }

      // Validate password strength
      if (newPassword.length < 6) {
        this.showMessage('New password must be at least 6 characters long', 'error');
        return;
      }

      console.log('🔐 Changing password...');

      const response = await this.makeAuthenticatedRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (response.success) {
        this.hideChangePasswordModal();
        this.showMessage('Password changed successfully!', 'success');
        console.log('✅ Password changed successfully');
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Password change failed:', error);
      this.showMessage(error.message || 'Failed to change password', 'error');
    }
  }

  // Resend verification email
  async resendVerification() {
    try {
      console.log('📧 Resending verification email...');
      
      const response = await this.makeAuthenticatedRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: this.currentUser.email })
      });

      if (response.success) {
        this.showMessage('Verification email sent successfully!', 'success');
        console.log('✅ Verification email sent');
      } else {
        throw new Error(response.message || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('❌ Failed to resend verification:', error);
      this.showMessage(error.message || 'Failed to send verification email', 'error');
    }
  }

  // Load dashboard data for activity tab
  async loadDashboardData() {
    try {
      console.log('📊 Loading dashboard data...');
      
      const response = await this.makeAuthenticatedRequest('/users/dashboard');
      
      if (response.success) {
        this.dashboardData = response.data;
        this.displayActivityData(response.data);
        console.log('✅ Dashboard data loaded');
      }
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      this.showEmptyActivityState();
    }
  }

  // Display activity data
  displayActivityData(data) {
    // Update statistics
    const stats = data.stats || {};
    this.updateStat('stat-active-auctions', stats.activeAuctions || 0);
    this.updateStat('stat-won-auctions', stats.wonAuctions || 0);
    this.updateStat('stat-total-bids', stats.totalBids || 0);
    this.updateStat('stat-watchlist', stats.watchlistItems || 0);

    // Display recent auctions
    this.displayRecentAuctions(data.recentAuctions || []);
    
    // Display recent bids
    this.displayRecentBids(data.recentBids || []);
  }

  // Update statistic display
  updateStat(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }

  // Display recent auctions
  displayRecentAuctions(auctions) {
    const container = document.getElementById('recent-auctions');
    if (!container) return;

    if (auctions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-gavel text-2xl mb-2"></i>
          <p>No auctions yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = auctions.slice(0, 5).map(auction => `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium text-gray-900 truncate">${auction.title}</h4>
          <span class="text-xs px-2 py-1 rounded-full ${this.getStatusColor(auction.status)}">
            ${auction.status}
          </span>
        </div>
        <div class="text-sm text-gray-600 space-y-1">
          <p><i class="fas fa-tag mr-1"></i>Current Bid: ${this.formatCurrency(auction.currentBid || auction.startingBid)}</p>
          <p><i class="fas fa-eye mr-1"></i>Bids: ${auction._count?.bids || 0}</p>
          <p><i class="fas fa-clock mr-1"></i>Ends: ${new Date(auction.endTime).toLocaleDateString()}</p>
        </div>
      </div>
    `).join('');
  }

  // Display recent bids
  displayRecentBids(bids) {
    const container = document.getElementById('recent-bids');
    if (!container) return;

    if (bids.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-hand-paper text-2xl mb-2"></i>
          <p>No bids yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = bids.slice(0, 5).map(bid => `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium text-gray-900 truncate">${bid.auction?.title || 'Unknown Auction'}</h4>
          <span class="text-xs px-2 py-1 rounded-full ${this.getStatusColor(bid.auction?.status)}">
            ${bid.auction?.status || 'Unknown'}
          </span>
        </div>
        <div class="text-sm text-gray-600 space-y-1">
          <p><i class="fas fa-money-bill mr-1"></i>Your Bid: ${this.formatCurrency(bid.amount)}</p>
          <p><i class="fas fa-tag mr-1"></i>Current Bid: ${bid.auction?.currentBid ? this.formatCurrency(bid.auction.currentBid) : 'N/A'}</p>
          <p><i class="fas fa-clock mr-1"></i>Bid Time: ${new Date(bid.createdAt).toLocaleString()}</p>
        </div>
      </div>
    `).join('');
  }

  // Show empty activity state
  showEmptyActivityState() {
    const containers = ['recent-auctions', 'recent-bids'];
    containers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
            <p>Unable to load data</p>
          </div>
        `;
      }
    });
  }

  // Get status color class
  getStatusColor(status) {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Make authenticated API request
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers['Content-Type'] = 'application/json';
    }

    // Merge options
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

  // Show message to user
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

  // Get message styling class
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

  // Get message icon
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

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth manager to be ready
  const initProfile = () => {
    if (window.authManager && window.authManager.currentUser) {
      window.profileManager = new ProfileManager();
    } else {
      setTimeout(initProfile, 100);
    }
  };
  
  initProfile();
}); 