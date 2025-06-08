/**
 * Product Detail Page - Full API Integration with Payment & Watchlist
 * Shows auction details, bidding functionality, watchlist management, payment processing
 */

class ProductDetailManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.auctionId = null;
    this.auction = null;
    this.currentUser = null;
    this.isAuthenticated = false;
    this.bids = [];
    this.isInWatchlist = false;
    this.hasPaidEntryFee = false;
    this.userBidStatus = null; // Store user's current bid info
    
    // Initialize payment and watchlist managers
    this.paymentManager = null;
    this.watchlistManager = null;
    
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Product Detail Page...');
    
    // Get auction ID from URL
    this.auctionId = this.getAuctionIdFromURL();
    if (!this.auctionId) {
      this.showError('Invalid auction ID');
      return;
    }

    // Check authentication
    this.checkAuthentication();
    
    // Initialize managers
    this.paymentManager = new PaymentManager();
    this.watchlistManager = new WatchlistManager();
    
    // Load auction data
    await this.loadAuctionDetails();
    await this.loadBidHistory();
    
    // Check payment status if authenticated
    if (this.isAuthenticated) {
      await this.checkPaymentStatus();
      await this.checkWatchlistStatus();
      await this.checkUserBidStatus();
    }
    
    // Setup event listeners
    this.bindEventListeners();
    
    // Start countdown timer
    this.startCountdownTimer();
  }

  getAuctionIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  checkAuthentication() {
    const token = localStorage.getItem('accessToken');
    this.isAuthenticated = !!token;
    
    if (this.isAuthenticated) {
      // Get user info from localStorage or decode token
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        this.currentUser = JSON.parse(userInfo);
      }
    }
  }

  async loadAuctionDetails() {
    try {
      this.showLoading(true);
      
      const apiUrl = `${this.baseURL}/auctions/${this.auctionId}`;
      console.log('🔍 Loading auction from:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response data:', data);
        
        this.auction = data.data?.auction || data.auction || data;
        console.log('📦 Parsed auction data:', this.auction);
        
        if (this.auction) {
          this.renderAuctionDetails();
          console.log('✅ Auction details loaded and rendered');
        } else {
          console.error('❌ No auction data in response');
          this.showError('No auction data found');
        }
      } else if (response.status === 404) {
        console.error('❌ Auction not found (404)');
        this.showError('Auction not found');
      } else {
        console.error('❌ API Error:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('❌ Error details:', errorData);
        this.showError('Failed to load auction details');
      }
    } catch (error) {
      console.error('❌ Network error loading auction:', error);
      this.showError('Network error loading auction. Please check if the backend server is running.');
    } finally {
      this.showLoading(false);
    }
  }

  async loadBidHistory() {
    try {
      const response = await fetch(`${this.baseURL}/auctions/${this.auctionId}/bids`);
      
      if (response.ok) {
        const data = await response.json();
        this.bids = data.data.bids;
        this.renderBidHistory();
        console.log('✅ Bid history loaded');
      }
    } catch (error) {
      console.error('❌ Error loading bid history:', error);
    }
  }

  async checkPaymentStatus() {
    if (!this.isAuthenticated) return;
    
    try {
      console.log(`🚀 === PAYMENT STATUS CHECK STARTING ===`);
      console.log(`💳 Checking payment status for auction: ${this.auctionId}`);
      console.log(`👤 Current user:`, this.currentUser);
      
      // Force a fresh check every time
      this.hasPaidEntryFee = false;
      
      // Check payment status with the payment manager
      const paymentStatus = await this.paymentManager.checkPaymentStatus(this.auctionId);
      console.log(`💳 Payment manager returned: ${paymentStatus}`);
      
      this.hasPaidEntryFee = paymentStatus;
      console.log(`💳 Final payment status set to: ${this.hasPaidEntryFee}`);
      
      // Update the UI immediately
      this.updateBiddingSection();
      
      // If payment not confirmed, implement aggressive retry mechanism
      if (!this.hasPaidEntryFee) {
        console.log('💳 Payment not confirmed, starting aggressive retry sequence...');
        
        // Try multiple times with different approaches
        const retryAttempts = [
          { delay: 1000, method: 'standard' },
          { delay: 3000, method: 'standard' },
          { delay: 5000, method: 'history' }
        ];
        
        for (let i = 0; i < retryAttempts.length; i++) {
          const attempt = retryAttempts[i];
          console.log(`💳 Retry ${i + 1}/${retryAttempts.length}: Waiting ${attempt.delay}ms, method: ${attempt.method}`);
          
          await new Promise(resolve => setTimeout(resolve, attempt.delay));
          
          let retryStatus;
          if (attempt.method === 'history') {
            // Use payment history as a fallback
            retryStatus = await this.paymentManager.checkPaymentViaHistory(this.auctionId);
          } else {
            retryStatus = await this.paymentManager.checkPaymentStatus(this.auctionId);
          }
          
          console.log(`💳 Retry ${i + 1} result: ${retryStatus}`);
          
          if (retryStatus !== this.hasPaidEntryFee) {
            this.hasPaidEntryFee = retryStatus;
            this.updateBiddingSection();
            console.log(`✅ Payment status updated after retry ${i + 1}: ${retryStatus ? 'PAID' : 'NOT PAID'}`);
            
            if (retryStatus) {
              this.showSuccess('Payment verified! You can now place bids.');
              break;
            }
          }
        }
        
        // Final comprehensive check using debug info
        if (!this.hasPaidEntryFee) {
          console.warn('⚠️ Payment still not confirmed after all retries, running comprehensive debug...');
          await this.runComprehensivePaymentDebug();
        }
      } else {
        console.log('✅ Payment confirmed immediately on page load');
      }
      
      console.log(`🏁 === PAYMENT STATUS CHECK COMPLETED ===`);
      console.log(`🎯 Final Status: ${this.hasPaidEntryFee ? 'PAID ✅' : 'NOT PAID ❌'}`);
      
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      this.showError('Error checking payment status. Please refresh the page.');
    }
  }

  async runComprehensivePaymentDebug() {
    try {
      console.log('🔍 === COMPREHENSIVE PAYMENT DEBUG ===');
      
      // 1. Check local storage
      const token = localStorage.getItem('accessToken');
      const userInfo = localStorage.getItem('userInfo');
      console.log('🔍 Auth token exists:', !!token);
      console.log('🔍 User info exists:', !!userInfo);
      
      if (userInfo) {
        const user = JSON.parse(userInfo);
        console.log('🔍 User ID from localStorage:', user.id);
        console.log('🔍 Current user ID:', this.currentUser?.id);
      }
      
      // 2. Get and analyze payment history
      console.log('🔍 Fetching complete payment history...');
      const paymentHistory = await this.paymentManager.getPaymentHistory();
      console.log('🔍 Total payments in history:', paymentHistory.length);
      
      // 3. Filter payments for this auction
      const auctionPayments = paymentHistory.filter(p => p.auctionId === this.auctionId);
      console.log(`🔍 Payments for auction ${this.auctionId}:`, auctionPayments.length);
      
      auctionPayments.forEach((payment, index) => {
        console.log(`🔍 Payment ${index + 1}:`, {
          id: payment.id,
          auctionId: payment.auctionId,
          status: payment.status,
          type: payment.type,
          amount: payment.amountInDollars,
          createdAt: new Date(payment.createdAt).toLocaleString(),
          paidAt: payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'Not paid'
        });
      });
      
      // 4. Check for successful entry fee payments
      const successfulEntryFees = auctionPayments.filter(p => 
        p.status === 'SUCCEEDED' && p.type === 'ENTRY_FEE'
      );
      
      console.log(`🔍 Successful entry fee payments: ${successfulEntryFees.length}`);
      
      if (successfulEntryFees.length > 0) {
        console.log('🔍 ⚠️ FOUND SUCCESSFUL PAYMENT BUT STATUS CHECK FAILED!');
        console.log('🔍 Forcing payment status to TRUE');
        
        this.hasPaidEntryFee = true;
        this.updateBiddingSection();
        this.showSuccess('Payment found and verified! You can now place bids.');
        
        return true;
      }
      
      // 5. Show final debug summary
      console.log('🔍 === DEBUG SUMMARY ===');
      console.log(`🔍 Auction ID: ${this.auctionId}`);
      console.log(`🔍 User authenticated: ${this.isAuthenticated}`);
      console.log(`🔍 Total payments: ${paymentHistory.length}`);
      console.log(`🔍 Auction payments: ${auctionPayments.length}`);
      console.log(`🔍 Successful entry fees: ${successfulEntryFees.length}`);
      console.log(`🔍 Final payment status: ${this.hasPaidEntryFee}`);
      
      return false;
      
    } catch (error) {
      console.error('❌ Comprehensive payment debug failed:', error);
      return false;
    }
  }

  async checkUserBidStatus() {
    if (!this.isAuthenticated) return;
    
    try {
      console.log(`🎯 Checking user bid status for auction: ${this.auctionId}`);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/auctions/${this.auctionId}/user-bid`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.userBidStatus = data.data;
        console.log('🎯 User bid status:', this.userBidStatus);
        
        // Update bidding section to reflect current bid status
        this.updateBiddingSection();
      } else {
        console.error('❌ Failed to get user bid status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error checking user bid status:', error);
    }
  }

  async checkWatchlistStatus() {
    if (!this.isAuthenticated) return;
    
    try {
      console.log(`❤️ Checking watchlist status for auction: ${this.auctionId}`);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/auctions/${this.auctionId}/watchlist-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isInWatchlist = data.data.isWatched;
        console.log('❤️ Watchlist status:', this.isInWatchlist ? 'In watchlist' : 'Not in watchlist');
        this.updateWatchlistButton();
      } else {
        console.error('❌ Failed to get watchlist status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error checking watchlist status:', error);
      
      // Fallback to old method
      try {
        this.isInWatchlist = await this.watchlistManager.isInWatchlist(this.auctionId);
        this.updateWatchlistButton();
      } catch (fallbackError) {
        console.error('❌ Fallback watchlist check failed:', fallbackError);
      }
    }
  }

  renderAuctionDetails() {
    if (!this.auction) return;

    // Update page title
    document.title = `${this.auction.title} - PakAuction`;
    
    // Update breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb-title') || document.getElementById('breadcrumb-title');
    if (breadcrumb) {
      breadcrumb.textContent = this.auction.title;
    }

    // Update main image - using 'main-image' ID from HTML
    const mainImage = document.getElementById('main-image');
    if (mainImage && this.auction.images?.[0]) {
      const imageUrl = this.auction.images[0].url.startsWith('http') 
        ? this.auction.images[0].url 
        : `${this.baseURL.replace('/api', '')}${this.auction.images[0].url}`;
      mainImage.src = imageUrl;
      mainImage.alt = this.auction.title;
    }

    // Update image gallery
    this.renderImageGallery();

    // Update auction info
    this.updateAuctionInfo();
    
    // Update seller info
    this.updateSellerInfo();
    
    // Update bidding section
    this.updateBiddingSection();
    
    // Show the product detail section and hide loading
    const productDetail = document.getElementById('product-detail');
    const pageLoading = document.getElementById('page-loading');
    const pageError = document.getElementById('page-error');
    
    if (productDetail) productDetail.classList.remove('hidden');
    if (pageLoading) pageLoading.style.display = 'none';
    if (pageError) pageError.classList.add('hidden');
  }

  renderImageGallery() {
    const gallery = document.getElementById('image-gallery');
    if (!gallery || !this.auction.images?.length) return;

    gallery.innerHTML = this.auction.images.map((image, index) => {
      const imageUrl = image.url.startsWith('http') 
        ? image.url 
        : `${this.baseURL.replace('/api', '')}${image.url}`;
      
      return `
        <img 
          src="${imageUrl}" 
        alt="${this.auction.title} ${index + 1}"
          class="w-full h-20 object-cover rounded-lg cursor-pointer border-2 ${index === 0 ? 'border-primary-500' : 'border-gray-200'} hover:border-primary-500 transition-colors image-gallery-thumb"
          onclick="changeMainImage('${imageUrl}', this)"
      >
      `;
    }).join('');
  }

  updateAuctionInfo() {
    // Title - using 'product-name' ID from HTML
    const titleEl = document.getElementById('product-name');
    if (titleEl) titleEl.textContent = this.auction.title;

    // Description - using 'product-description' ID from HTML
    const descEl = document.getElementById('product-description');
    if (descEl) descEl.innerHTML = `<p>${this.auction.description}</p>`;

    // Category - using 'product-category' ID from HTML
    const categoryEl = document.getElementById('product-category');
    if (categoryEl && this.auction.category) {
      categoryEl.textContent = this.auction.category.name;
    }

    // Condition - add condition info if element exists
    const conditionEl = document.getElementById('auction-condition');
    if (conditionEl) conditionEl.textContent = this.auction.condition || 'Not specified';

    // Base price - matches HTML ID
    const basePriceEl = document.getElementById('base-price');
    if (basePriceEl) basePriceEl.textContent = `$${Number(this.auction.basePrice).toLocaleString()}`;

    // Current bid - matches HTML ID
    const currentBidEl = document.getElementById('current-bid');
    if (currentBidEl) {
      const currentBid = this.auction.currentBid || this.auction.basePrice;
      currentBidEl.textContent = `$${Number(currentBid).toLocaleString()}`;
    }

    // Bid increment
    const bidIncrementEl = document.getElementById('bid-increment');
    if (bidIncrementEl) bidIncrementEl.textContent = `$${Number(this.auction.bidIncrement || 10).toLocaleString()}`;

    // Entry fee
    const entryFeeEl = document.getElementById('entry-fee');
    if (entryFeeEl) entryFeeEl.textContent = `$${Number(this.auction.entryFee || 0).toLocaleString()}`;

    // Bid count - try multiple possible IDs
    const bidCountEl = document.getElementById('bid-count') || document.getElementById('bid-count-display');
    if (bidCountEl) bidCountEl.textContent = `${this.auction.bidCount || 0} bids`;

    // View count
    const viewCountEl = document.getElementById('view-count');
    if (viewCountEl) viewCountEl.textContent = this.auction.viewCount || 0;

    // End time - try multiple possible IDs
    const endTimeEl = document.getElementById('end-time') || document.getElementById('auction-end-time');
    if (endTimeEl) {
      endTimeEl.textContent = new Date(this.auction.endTime).toLocaleString();
    }

    // Status - try multiple possible IDs
    const statusEl = document.getElementById('auction-status') || document.getElementById('product-status');
    if (statusEl) {
      statusEl.textContent = this.auction.status;
      statusEl.className = `px-3 py-1 rounded-full text-sm font-medium ${this.getStatusClasses(this.auction.status)}`;
    }

    // Minimum bid amount for bid form
    const minBidEl = document.getElementById('min-bid');
    if (minBidEl) {
      const minimumBid = (this.auction.currentBid || this.auction.basePrice) + (this.auction.bidIncrement || 10);
      minBidEl.textContent = Number(minimumBid).toLocaleString();
    }

    // Fee amount for payment
    const feeAmountEl = document.getElementById('fee-amount');
    if (feeAmountEl) {
      feeAmountEl.textContent = `$${Number(this.auction.entryFee || 0).toLocaleString()}`;
    }
  }

  updateSellerInfo() {
    if (!this.auction.seller) return;

    const sellerNameEl = document.getElementById('seller-name');
    if (sellerNameEl) {
      sellerNameEl.textContent = `${this.auction.seller.firstName} ${this.auction.seller.lastName}`;
    }

    const sellerUsernameEl = document.getElementById('seller-username');
    if (sellerUsernameEl) {
      sellerUsernameEl.textContent = `@${this.auction.seller.username}`;
    }

    const sellerEmailEl = document.getElementById('seller-email');
    if (sellerEmailEl) {
      sellerEmailEl.textContent = this.auction.seller.email;
    }
  }

  updateBiddingSection() {
    // Hide all bidding sections first
    const notAuthSection = document.getElementById('not-authenticated-section');
    const notPaidSection = document.getElementById('not-paid-section');
    const canBidSection = document.getElementById('can-bid-section');
    const endedSection = document.getElementById('auction-ended-section');
    
    // Hide all sections
    [notAuthSection, notPaidSection, canBidSection, endedSection].forEach(section => {
      if (section) section.classList.add('hidden');
    });

    const canBid = this.auction.status === 'ACTIVE' && new Date(this.auction.endTime) > new Date();
    const isOwner = this.isAuthenticated && this.currentUser?.id === this.auction.sellerId;
    const isWinner = this.isAuthenticated && this.currentUser?.id === this.auction.winnerId;
    const auctionEnded = this.auction.status === 'ENDED';

    if (!this.isAuthenticated) {
      // Show not authenticated section
      if (notAuthSection) notAuthSection.classList.remove('hidden');
    } else if (isOwner) {
      // Owner cannot bid on their own auction
      if (endedSection) {
        endedSection.classList.remove('hidden');
        const endedContent = endedSection.querySelector('div > div > h3');
        const endedDesc = endedSection.querySelector('div > div > p');
        if (endedContent) endedContent.textContent = 'Your Auction';
        if (endedDesc) {
          if (auctionEnded && this.auction.winnerId) {
            endedDesc.textContent = 'Your auction has ended successfully. Waiting for winner payment.';
          } else {
            endedDesc.textContent = 'You cannot bid on your own auction.';
          }
        }
      }
    } else if (auctionEnded && isWinner) {
      // Winner needs to pay
      this.showWinnerPaymentSection();
    } else if (!canBid) {
      // Auction has ended
      if (endedSection) {
        endedSection.classList.remove('hidden');
        const endedContent = endedSection.querySelector('div > div > h3');
        const endedDesc = endedSection.querySelector('div > div > p');
        if (endedContent) {
          if (auctionEnded && this.auction.winnerId) {
            endedContent.textContent = 'Auction Ended';
            if (endedDesc) endedDesc.textContent = 'This auction has ended. Another user won with a higher bid.';
          } else {
            endedContent.textContent = 'Auction Ended';
            if (endedDesc) endedDesc.textContent = 'This auction has ended.';
          }
        }
      }
    } else if (!this.hasPaidEntryFee) {
      // Need to pay entry fee
      if (notPaidSection) {
        notPaidSection.classList.remove('hidden');
        
        // Add debug refresh button if not already present
        const existingRefreshBtn = document.getElementById('refresh-payment-btn');
        if (!existingRefreshBtn) {
          const refreshButton = document.createElement('button');
          refreshButton.id = 'refresh-payment-btn';
          refreshButton.className = 'mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm';
          refreshButton.innerHTML = '<i class="fas fa-refresh mr-2"></i>Check Payment Status';
          
          // Find the payment section and add the button
          const paymentContent = notPaidSection.querySelector('.bg-yellow-50, .bg-red-50, .p-6');
          if (paymentContent) {
            paymentContent.appendChild(refreshButton);
          }
        }
      }
    } else {
      // User can bid - show the bidding form with enhanced interface
      if (canBidSection) {
        canBidSection.classList.remove('hidden');
        
        // Update bidding interface based on user's current bid status
        this.updateBiddingInterface();
      }
    }

    // Update watchlist button
    this.updateWatchlistButton();
    
    // Log current bidding state for debugging
    console.log('🎯 Bidding Section Updated:', {
      isAuthenticated: this.isAuthenticated,
      isOwner,
      isWinner,
      canBid,
      auctionEnded,
      hasPaidEntryFee: this.hasPaidEntryFee,
      auctionStatus: this.auction?.status,
      userBidStatus: this.userBidStatus,
      sectionShown: this.isAuthenticated ? 
        (isOwner ? 'owner' : 
         (auctionEnded && isWinner ? 'winner-payment' :
          (!canBid ? 'ended' : 
           (!this.hasPaidEntryFee ? 'payment-required' : 'can-bid')))) : 
        'not-authenticated'
    });
  }

  updateBiddingInterface() {
    const bidInput = document.getElementById('bid-amount');
    const placeBidBtn = document.getElementById('place-bid-btn');
    const minBidEl = document.getElementById('min-bid');
    
    if (!bidInput || !placeBidBtn) return;

    const hasUserBid = this.userBidStatus?.hasUserBid || false;
    const userBidAmount = this.userBidStatus?.userBid?.amount || 0;
    const isWinning = this.userBidStatus?.userBid?.isWinning || false;
    const minBidAmount = this.userBidStatus?.minBidAmount || 
                        (this.auction.currentBid || this.auction.basePrice) + (this.auction.bidIncrement || 10);

    console.log('🎯 Updating bidding interface:', {
      hasUserBid,
      userBidAmount,
      isWinning,
      minBidAmount
    });

    // Update minimum bid display
    if (minBidEl) {
      minBidEl.textContent = Number(minBidAmount).toLocaleString();
    }

    // Update button design and text based on bid status
    if (hasUserBid) {
      // User has already bid - show update interface
      let buttonClasses, buttonText;
      
      if (isWinning) {
        buttonClasses = 'w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow-md';
        buttonText = 'You\'re Winning!';
      } else {
        buttonClasses = 'w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition duration-300 shadow-md';
        buttonText = 'Outbid';
      }
      
      placeBidBtn.className = buttonClasses;
      
      placeBidBtn.innerHTML = `
        <div class="flex items-center justify-center pointer-events-none">
          <i class="fas ${isWinning ? 'fa-trophy' : 'fa-arrow-up'} mr-2"></i>
          <span>Update Bid - Current: $${userBidAmount.toLocaleString()} (${buttonText})</span>
        </div>
      `;
      
      // Add current bid info above the form
      this.addCurrentBidInfo(userBidAmount, isWinning, minBidAmount);
      
      // Update input placeholder for existing bidders - be more specific about minimum
      const minimumRequired = userBidAmount + (this.auction.bidIncrement || 1);
      bidInput.placeholder = `Enter amount higher than $${userBidAmount.toLocaleString()} (min: $${minimumRequired.toLocaleString()})`;
      bidInput.min = minimumRequired;
      
      console.log('🎯 Updated bid interface for existing bidder:', {
        userBidAmount,
        minimumRequired,
        bidIncrement: this.auction.bidIncrement
      });
      
    } else {
      // New bidder - show place bid interface
      placeBidBtn.className = 'w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition duration-300 shadow-md';
      
      placeBidBtn.innerHTML = `
        <div class="flex items-center justify-center pointer-events-none">
          <i class="fas fa-gavel mr-2"></i>
          <span>Place Your Bid - Minimum: $${Number(minBidAmount).toLocaleString()}</span>
        </div>
      `;
      
      // Remove any existing current bid info
      const existingInfo = document.getElementById('current-bid-info');
      if (existingInfo) existingInfo.remove();
    }

    // Make input field consistent with button sizing
    bidInput.className = 'w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 text-lg font-semibold text-center transition-all duration-300';
  }

  addCurrentBidInfo(currentBid, isWinning, minBid) {
    // Remove existing info
    const existingInfo = document.getElementById('current-bid-info');
    if (existingInfo) existingInfo.remove();

    // Find the bidding form container
    const biddingForm = document.querySelector('#can-bid-section .bg-white') || 
                       document.querySelector('#can-bid-section > div') ||
                       document.getElementById('can-bid-section');
    
    if (!biddingForm) return;

    // Create enhanced current bid info element
    const bidInfo = document.createElement('div');
    bidInfo.id = 'current-bid-info';
    bidInfo.className = `mb-4 p-4 rounded-lg border-2 shadow-md ${
      isWinning ? 
        'bg-gradient-to-r from-green-50 to-green-100 border-green-300' : 
        'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
    }`;
    
    bidInfo.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="mr-3">
            <div class="w-10 h-10 rounded-full ${isWinning ? 'bg-green-500' : 'bg-orange-500'} flex items-center justify-center">
              <i class="fas ${isWinning ? 'fa-trophy' : 'fa-exclamation-triangle'} text-white"></i>
            </div>
          </div>
          <div>
            <h4 class="text-lg font-bold ${isWinning ? 'text-green-800' : 'text-orange-800'} mb-1">
              Your Current Bid
            </h4>
            <p class="text-sm ${isWinning ? 'text-green-600' : 'text-orange-600'}">
              ${isWinning ? 
                '🎉 You are currently winning!' : 
                '⚠️ You have been outbid.'}
            </p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold ${isWinning ? 'text-green-700' : 'text-orange-700'} mb-1">
            $${currentBid.toLocaleString()}
          </div>
          <div class="text-sm ${isWinning ? 'text-green-600' : 'text-orange-600'} font-medium">
            Min. increase: $${((minBid - currentBid) || this.auction.bidIncrement || 10).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div class="mt-3 p-3 ${isWinning ? 'bg-green-200' : 'bg-orange-200'} rounded-lg">
        <div class="flex items-center ${isWinning ? 'text-green-800' : 'text-orange-800'}">
          <i class="fas ${isWinning ? 'fa-lightbulb' : 'fa-clock'} mr-2"></i>
          <span class="text-sm font-medium">
            ${isWinning ? 
              'Keep monitoring - other bidders can still outbid you!' : 
              'Place a higher bid to regain your position.'}
          </span>
        </div>
        </div>
      `;

    // Insert at the beginning of the form
    biddingForm.insertBefore(bidInfo, biddingForm.firstChild);
  }

  updateWatchlistButton() {
    const watchlistBtn = document.getElementById('watchlist-btn');
    if (!watchlistBtn || !this.isAuthenticated) return;

    // Show the button for authenticated users
    watchlistBtn.classList.remove('hidden');
    
    const icon = watchlistBtn.querySelector('i');
    const text = watchlistBtn.querySelector('#watchlist-text');
    
    if (this.isInWatchlist) {
      icon.className = 'fas fa-heart mr-2';
      text.textContent = 'Remove from Watchlist';
      watchlistBtn.className = watchlistBtn.className.replace('bg-gray-100 text-gray-700', 'bg-red-100 text-red-700');
    } else {
      icon.className = 'far fa-heart mr-2';
      text.textContent = 'Add to Watchlist';
      watchlistBtn.className = watchlistBtn.className.replace('bg-red-100 text-red-700', 'bg-gray-100 text-gray-700');
    }
  }

  showWinnerPaymentSection() {
    // Create or update winner payment section
    let winnerSection = document.getElementById('winner-payment-section');
    
    if (!winnerSection) {
      // Create the section if it doesn't exist
      winnerSection = document.createElement('div');
      winnerSection.id = 'winner-payment-section';
      winnerSection.className = 'mb-6';
      
      // Insert after the auction ended section
      const endedSection = document.getElementById('auction-ended-section');
      if (endedSection) {
        endedSection.parentNode.insertBefore(winnerSection, endedSection.nextSibling);
      }
    }
    
    const winningAmount = this.auction.currentBid || this.auction.basePrice;
    
    winnerSection.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-6">
        <div class="flex items-start">
          <i class="fas fa-trophy text-green-500 text-2xl mt-1 mr-4"></i>
          <div class="flex-1">
            <h3 class="font-bold text-green-800 text-xl mb-2">🎉 Congratulations! You Won!</h3>
            <p class="text-green-700 mb-4">You are the winning bidder for this auction with a bid of <strong>$${winningAmount.toLocaleString()}</strong></p>
            
            <div class="bg-white border border-green-200 rounded-lg p-4 mb-4">
              <h4 class="font-semibold text-gray-800 mb-2">Payment Required</h4>
              <p class="text-gray-600 text-sm mb-3">You must complete payment within 48 hours to secure your purchase.</p>
              <div class="flex items-center justify-between">
          <div>
                  <span class="text-sm text-gray-500">Total Amount:</span>
                  <span class="text-2xl font-bold text-gray-800 ml-2">$${winningAmount.toLocaleString()}</span>
                </div>
              <button 
                  id="pay-winning-amount-btn" 
                  class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
              >
                  <i class="fas fa-credit-card mr-2"></i>Pay Now
              </button>
            </div>
            </div>
            
            <div class="text-sm text-gray-600">
              <p><strong>What happens next?</strong></p>
              <ol class="list-decimal list-inside mt-2 space-y-1">
                <li>Complete your payment using the button above</li>
                <li>The seller will be notified of your payment</li>
                <li>The seller will prepare and ship your item within 3 business days</li>
                <li>You'll receive tracking information via email</li>
              </ol>
            </div>
          </div>
          </div>
        </div>
      `;
    
    winnerSection.classList.remove('hidden');
    
    // Add event listener for payment button
    const payButton = document.getElementById('pay-winning-amount-btn');
    if (payButton) {
      payButton.addEventListener('click', () => {
        this.initiateWinnerPayment();
      });
    }
  }

  async initiateWinnerPayment() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        this.showError('Please login to complete payment');
        return;
      }

      console.log('💰 Initiating winner payment for auction:', this.auctionId);

      // Create winning payment intent
      const response = await fetch(`${this.baseURL}/payments/winning-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          auctionId: this.auctionId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment');
      }

      const data = await response.json();
      console.log('✅ Winning payment intent created:', data);

      // Show payment modal for winning payment
      this.showWinnerPaymentModal(data.data);

    } catch (error) {
      console.error('❌ Error initiating winner payment:', error);
      this.showError(error.message || 'Failed to initiate payment');
    }
  }

  showWinnerPaymentModal(paymentData) {
    // Ensure Stripe is loaded before showing modal
    if (typeof Stripe === 'undefined') {
      console.log('📦 Stripe not loaded, loading script...');
      // Load Stripe script if not already loaded
      const stripeScript = document.createElement('script');
      stripeScript.src = 'https://js.stripe.com/v3/';
      stripeScript.onload = () => {
        console.log('✅ Stripe script loaded, showing modal...');
        this.createWinnerPaymentModal(paymentData);
      };
      stripeScript.onerror = () => {
        console.error('❌ Failed to load Stripe script');
        this.showError('Failed to load payment system. Please check your internet connection.');
      };
      document.head.appendChild(stripeScript);
    } else {
      this.createWinnerPaymentModal(paymentData);
    }
  }

  createWinnerPaymentModal(paymentData) {
    // Create payment modal specifically for winning payment
    const modal = document.createElement('div');
    modal.id = 'winner-payment-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8 max-h-screen overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-800">Complete Your Purchase</h3>
          <button id="close-winner-modal" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Order Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-gray-800 mb-2">Order Summary</h4>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">${this.auction.title}</p>
              <p class="text-sm text-gray-600">Winning Bid Amount</p>
            </div>
            <p class="text-xl font-bold text-green-600">$${paymentData.amount.toLocaleString()}</p>
          </div>
        </div>
        
        <!-- Loading message for Stripe -->
        <div id="stripe-loading" class="text-center py-4 mb-4">
          <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i>
          <p class="text-gray-600">Loading payment system...</p>
        </div>
        
        <!-- Shipping Information Form -->
        <form id="winner-payment-form" class="space-y-6" style="display: none;">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold text-gray-800 mb-4">Shipping Information</h4>
              
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input type="text" id="shipping-first-name" required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                           value="${this.currentUser?.firstName || ''}" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input type="text" id="shipping-last-name" required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                           value="${this.currentUser?.lastName || ''}" />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" id="shipping-email" required 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                         value="${this.currentUser?.email || ''}" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input type="tel" id="shipping-phone" required 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                         value="${this.currentUser?.phone || ''}" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input type="text" id="shipping-address" required 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                         placeholder="123 Main Street" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite, etc.</label>
                  <input type="text" id="shipping-address-2" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                         placeholder="Apt 4B, Suite 100, etc." />
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" id="shipping-city" required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">State/Province *</label>
                    <input type="text" id="shipping-state" required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code *</label>
                    <input type="text" id="shipping-zip" required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select id="shipping-country" required 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="PK" selected>Pakistan</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IN">India</option>
                      <option value="JP">Japan</option>
                      <option value="CN">China</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-800 mb-4">Payment Information</h4>
              
              <div class="space-y-4">
                <!-- Billing Address Same as Shipping -->
                <div class="flex items-center">
                  <input type="checkbox" id="same-as-shipping" checked 
                         class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                  <label for="same-as-shipping" class="ml-2 text-sm text-gray-700">
                    Billing address same as shipping
                  </label>
                </div>
                
                <!-- Billing Address Fields (hidden by default) -->
                <div id="billing-address-fields" class="hidden space-y-4">
                  <h5 class="font-medium text-gray-700">Billing Address</h5>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input type="text" id="billing-first-name" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input type="text" id="billing-last-name" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                  <input type="text" id="billing-address" placeholder="Billing Address"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div class="grid grid-cols-3 gap-3">
                    <input type="text" id="billing-city" placeholder="City"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <input type="text" id="billing-state" placeholder="State"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <input type="text" id="billing-zip" placeholder="ZIP"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                
                <!-- Card Information -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Card Information *</label>
                  <div id="winner-card-element" class="p-3 border border-gray-300 rounded-md min-h-[50px]">
                    <!-- Stripe card element will be mounted here -->
                  </div>
                  <div id="winner-card-errors" class="text-red-600 text-sm mt-2"></div>
                </div>
                
                <!-- Special Instructions -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Special Delivery Instructions</label>
                  <textarea id="delivery-instructions" rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Any special instructions for delivery..."></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Terms and Conditions -->
          <div class="border-t pt-4">
            <div class="flex items-start">
              <input type="checkbox" id="terms-agreement" required 
                     class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1" />
              <label for="terms-agreement" class="ml-2 text-sm text-gray-700">
                I agree to the <a href="#" class="text-green-600 hover:underline">Terms of Service</a> 
                and <a href="#" class="text-green-600 hover:underline">Privacy Policy</a>. 
                I understand that this purchase is final and I am committed to paying the winning bid amount.
              </label>
            </div>
          </div>
          
          <!-- Submit Button -->
          <button type="submit" id="winner-submit-payment" 
                  class="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition duration-300 font-semibold text-lg">
            <i class="fas fa-credit-card mr-2"></i>Complete Purchase - $${paymentData.amount.toLocaleString()}
          </button>
        </form>
        </div>
      `;
    
    document.body.appendChild(modal);
    
    // Initialize form interactions
    this.initializeWinnerPaymentForm();
    
    // Initialize Stripe elements for this modal (this will hide loading and show form)
    this.initializeWinnerPaymentStripe(paymentData);
    
    // Close modal handler
    const closeBtn = document.getElementById('close-winner-modal');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  initializeWinnerPaymentForm() {
    // Toggle billing address fields
    const sameAsShippingCheckbox = document.getElementById('same-as-shipping');
    const billingFields = document.getElementById('billing-address-fields');
    
    sameAsShippingCheckbox.addEventListener('change', () => {
      if (sameAsShippingCheckbox.checked) {
        billingFields.classList.add('hidden');
      } else {
        billingFields.classList.remove('hidden');
      }
    });
    
    // Form validation
    const form = document.getElementById('winner-payment-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.processWinnerPayment();
    });
  }

  async initializeWinnerPaymentStripe(paymentData) {
    try {
      console.log('🔄 Initializing Stripe for winner payment...');
      
      // Wait for Stripe to be available
      if (typeof Stripe === 'undefined') {
        console.log('⏳ Waiting for Stripe to load...');
        await new Promise((resolve, reject) => {
          let attempts = 0;
          const checkStripe = () => {
            attempts++;
            if (typeof Stripe !== 'undefined') {
              console.log('✅ Stripe is now available');
              resolve();
            } else if (attempts > 20) {
              reject(new Error('Stripe failed to load after 10 seconds'));
            } else {
              setTimeout(checkStripe, 500);
            }
          };
          checkStripe();
        });
      }
      
      // Get Stripe public key from the public endpoint
      console.log('🔑 Fetching Stripe public key...');
      const stripeResponse = await fetch(`${this.baseURL}/payments/stripe-key`);
      
      if (!stripeResponse.ok) {
        throw new Error('Failed to load Stripe configuration');
      }
      
      const stripeData = await stripeResponse.json();
      console.log('🔑 Stripe response:', stripeData);
      
      if (!stripeData.success) {
        throw new Error(stripeData.message || 'Stripe not configured');
      }
      
      const stripePublishableKey = stripeData.data.publicKey;
      
      if (!stripePublishableKey) {
        throw new Error('Stripe public key not available');
      }
      
      console.log('🔧 Initializing Stripe with public key...');
      
      // Initialize Stripe
      const stripe = Stripe(stripePublishableKey);
      const elements = stripe.elements();
      
      // Create card element with better styling
      const cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
            fontFamily: 'Arial, sans-serif',
            fontSmoothing: 'antialiased',
            ':-webkit-autofill': {
              color: '#fce883',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        },
      });
      
      console.log('🎨 Created card element, attempting to mount...');
      
      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if the element exists
      const cardContainer = document.getElementById('winner-card-element');
      if (!cardContainer) {
        throw new Error('Card element container not found in DOM');
      }
      
      console.log('📍 Card container found, mounting card element...');
      
      // Mount card element
      try {
        cardElement.mount('#winner-card-element');
        console.log('✅ Card element mounted successfully');
      } catch (mountError) {
        console.error('❌ Error mounting card element:', mountError);
        throw new Error('Failed to mount payment form: ' + mountError.message);
      }
      
      // Store references for later use
      this.currentStripe = stripe;
      this.currentCardElement = cardElement;
      this.currentPaymentData = paymentData;
      
      // Handle card errors with enhanced logging
      cardElement.on('change', ({error}) => {
        const displayError = document.getElementById('winner-card-errors');
        if (error) {
          console.error('💳 Card validation error:', error.message);
          if (displayError) {
            displayError.textContent = error.message;
          }
        } else {
          console.log('💳 Card validation passed');
          if (displayError) {
            displayError.textContent = '';
          }
        }
      });
      
      // Add ready event
      cardElement.on('ready', () => {
        console.log('✅ Stripe card element is ready for input');
      });
      
      console.log('🎉 Stripe initialization completed successfully');
      
      // Hide loading and show the form
      const loadingEl = document.getElementById('stripe-loading');
      const formEl = document.getElementById('winner-payment-form');
      
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }
      
      if (formEl) {
        formEl.style.display = 'block';
      }
      
      console.log('✅ Payment form is now ready for user input');
      
    } catch (error) {
      console.error('❌ Stripe initialization error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        stripeAvailable: typeof Stripe !== 'undefined',
        cardContainer: !!document.getElementById('winner-card-element')
      });
      
      // Hide loading and show error
      const loadingEl = document.getElementById('stripe-loading');
      if (loadingEl) {
        loadingEl.innerHTML = `
          <div class="text-center py-4">
            <i class="fas fa-exclamation-triangle text-2xl text-red-500 mb-2"></i>
            <p class="text-red-600">Failed to load payment system</p>
            <button onclick="window.location.reload()" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Reload Page
            </button>
          </div>
        `;
      }
      
      this.showError('Payment system initialization failed: ' + error.message);
    }
  }

  async verifyWinnerPayment(paymentIntentId, shippingInfo, billingInfo) {
    try {
      console.log('🔍 Verifying winner payment:', {
        paymentIntentId,
        auctionId: this.auction._id,
        shippingInfo,
        billingInfo
      });
      
      const response = await fetch(`${this.baseURL}/payments/verify-winner-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          paymentIntentId,
          auctionId: this.auction._id,
          shippingInfo,
          billingInfo
        })
      });
      
      console.log('🔍 Backend response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Payment verification failed';
        try {
          const error = await response.json();
          console.error('❌ Backend error details:', error);
          errorMessage = error.message || error.error || errorMessage;
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          const errorText = await response.text();
          console.error('❌ Raw error response:', errorText);
          errorMessage = `Server error (${response.status}): ${errorText.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ Payment verified successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      throw error;
    }
  }

  renderBidHistory() {
    const bidHistoryList = document.getElementById('bid-history-list');
    const noBidsMessage = document.getElementById('no-bids-message');
    const bidHistoryLoading = document.getElementById('bid-history-loading');
    
    // Hide loading
    if (bidHistoryLoading) bidHistoryLoading.style.display = 'none';

    if (!this.bids || this.bids.length === 0) {
      // Show no bids message
      if (noBidsMessage) noBidsMessage.classList.remove('hidden');
      if (bidHistoryList) bidHistoryList.classList.add('hidden');
      return;
    }

    // Hide no bids message and show bid list
    if (noBidsMessage) noBidsMessage.classList.add('hidden');
    if (bidHistoryList) {
      bidHistoryList.classList.remove('hidden');
      bidHistoryList.innerHTML = this.bids.map(bid => `
        <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
            <p class="font-semibold text-lg text-gray-800">$${Number(bid.amount).toLocaleString()}</p>
            <p class="text-sm text-gray-600">by ${bid.bidder?.username || bid.bidder?.firstName || 'Anonymous'}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">${new Date(bid.createdAt).toLocaleDateString()}</p>
              <p class="text-xs text-gray-400">${new Date(bid.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
      `).join('');
    }
  }

  bindEventListeners() {
    // Enhanced click handler with proper event delegation
    document.addEventListener('click', (e) => {
      // Find the closest button element
      const payFeeBtn = e.target.closest('#pay-fee-btn');
      const placeBidBtn = e.target.closest('#place-bid-btn');
      const watchlistBtn = e.target.closest('#watchlist-btn');
      const refreshBtn = e.target.closest('#refresh-payment-btn');
      
      // Handle each button type
      if (payFeeBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.showPaymentModal();
      } else if (placeBidBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.placeBid();
      } else if (watchlistBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleWatchlist();
      } else if (refreshBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.manualRefreshPaymentStatus();
      }
    });

    // Enter key on bid input
    document.addEventListener('keypress', (e) => {
      if (e.target.id === 'bid-amount' && e.key === 'Enter') {
        e.preventDefault();
        this.placeBid();
      }
    });
  }

  showPaymentModal() {
    if (!this.isAuthenticated) {
      alert('Please log in to make payments');
      return;
    }

    if (!this.auction) {
      alert('Auction data not loaded');
      return;
    }

    this.paymentManager.createPaymentModal(
      this.auctionId, 
      this.auction.entryFee || 0, 
      this.auction.title
    );
  }

  async placeBid() {
    console.log('🎯 placeBid() function called');
    
    if (!this.isAuthenticated) {
      console.log('❌ User not authenticated');
      alert('Please log in to place bids');
      return;
    }

    if (!this.hasPaidEntryFee) {
      console.log('❌ Entry fee not paid');
      alert('Please pay the entry fee first');
      return;
    }

    const bidAmountInput = document.getElementById('bid-amount');
    const placeBidBtn = document.getElementById('place-bid-btn');
    
    if (!bidAmountInput) {
      console.error('❌ Bid amount input not found');
      alert('Bid input field not found');
      return;
    }
    
    if (!placeBidBtn) {
      console.error('❌ Place bid button not found');
      alert('Bid button not found');
      return;
    }
    
    // Check if button is already disabled
    if (placeBidBtn.disabled) {
      console.log('⚠️ Button is already disabled, ignoring click');
      return;
    }
    
    const bidAmount = parseFloat(bidAmountInput.value);
    const hasUserBid = this.userBidStatus?.hasUserBid || false;
    const currentUserBid = this.userBidStatus?.userBid?.amount || 0;
    
    console.log('🎯 Starting bid placement:', {
      bidAmount,
      hasUserBid,
      currentUserBid,
      userBidStatus: this.userBidStatus,
      auction: {
        currentBid: this.auction.currentBid,
        basePrice: this.auction.basePrice,
        bidIncrement: this.auction.bidIncrement
      }
    });
    
    // Enhanced validation
    if (isNaN(bidAmount) || bidAmount <= 0) {
      console.log('❌ Invalid bid amount:', bidAmount);
      alert('Please enter a valid bid amount');
      return;
    }

    // Calculate minimum required bid more carefully
    let minimumRequired;
    if (hasUserBid) {
      // For existing bidders, they must bid higher than their current bid
      minimumRequired = currentUserBid + (this.auction.bidIncrement || 1);
      
      if (bidAmount <= currentUserBid) {
        console.log('❌ Bid not higher than current bid');
        alert(`Your new bid must be higher than your current bid of $${currentUserBid.toLocaleString()}`);
        return;
      }
      
      if (bidAmount < minimumRequired) {
        console.log('❌ Bid below minimum required');
        alert(`Your new bid must be at least $${minimumRequired.toLocaleString()} (your current bid + bid increment)`);
        return;
      }
    } else {
      // For new bidders, use the auction's minimum bid rules
      const auctionHighestBid = this.auction.currentBid || this.auction.basePrice;
      minimumRequired = auctionHighestBid + (this.auction.bidIncrement || 10);
      
      if (bidAmount < minimumRequired) {
        console.log('❌ Bid below auction minimum');
        alert(`Your bid must be at least $${minimumRequired.toLocaleString()} (current highest bid + bid increment)`);
        return;
      }
    }

    console.log('🎯 Bid validation passed:', {
      bidAmount,
      minimumRequired,
      isUpdate: hasUserBid
    });

    // Show loading state
    const originalBtnContent = placeBidBtn.innerHTML;
    placeBidBtn.innerHTML = `
      <div class="flex items-center justify-center pointer-events-none">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        ${hasUserBid ? 'Updating Bid...' : 'Placing Bid...'}
      </div>
    `;
    placeBidBtn.disabled = true;
    
    console.log('🔄 Button disabled and showing loading state');

    try {
      const token = localStorage.getItem('accessToken');
      console.log('🌐 Making API request...');
      
      const response = await fetch(`${this.baseURL}/auctions/${this.auctionId}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: bidAmount })
      });

      console.log('🎯 Bid API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🎯 Bid API response data:', data);
        
        const isUpdate = data.data.isUpdate;
        const previousAmount = data.data.previousAmount;
        
        // Show success message
        const successMessage = isUpdate ? 
          `🎉 Bid updated successfully! From $${previousAmount.toLocaleString()} to $${bidAmount.toLocaleString()}` :
          `🎉 Bid placed successfully! Amount: $${bidAmount.toLocaleString()}`;
        
        this.showSuccess(successMessage);
        
        // Refresh data to get latest bid status
        console.log('🔄 Refreshing auction data after successful bid...');
        await Promise.all([
          this.loadAuctionDetails(),
          this.loadBidHistory(),
          this.checkUserBidStatus()
        ]);
        
        // Clear bid input
        bidAmountInput.value = '';
        
        console.log(`✅ ${isUpdate ? 'Updated' : 'Placed'} bid successfully`);
        
      } else {
        const error = await response.json();
        console.error('❌ Bid API error response:', error);
        throw new Error(error.message || 'Failed to place bid');
      }
    } catch (error) {
      console.error('❌ Error placing bid:', error);
      this.showError(error.message || 'Network error placing bid');
    } finally {
      // Always restore button state
      console.log('🔄 Restoring button state');
      placeBidBtn.innerHTML = originalBtnContent;
      placeBidBtn.disabled = false;
    }
  }

  async toggleWatchlist() {
    if (!this.isAuthenticated) {
      alert('Please login to manage watchlist');
      return;
    }

    const success = await this.watchlistManager.toggleWatchlist(this.auctionId);
    if (success) {
        this.isInWatchlist = !this.isInWatchlist;
        this.updateWatchlistButton();
    }
  }

  startCountdownTimer() {
    if (!this.auction?.endTime) return;

    const countdownEl = document.getElementById('countdown-timer');
    if (!countdownEl) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = new Date(this.auction.endTime).getTime();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        countdownEl.innerHTML = '<span class="text-red-500 font-bold">AUCTION ENDED</span>';
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `
        <div class="flex space-x-2 text-center">
          <div class="bg-primary-600 text-white px-2 py-1 rounded">
            <div class="font-bold">${days}</div>
            <div class="text-xs">days</div>
          </div>
          <div class="bg-primary-600 text-white px-2 py-1 rounded">
            <div class="font-bold">${hours}</div>
            <div class="text-xs">hrs</div>
          </div>
          <div class="bg-primary-600 text-white px-2 py-1 rounded">
            <div class="font-bold">${minutes}</div>
            <div class="text-xs">min</div>
          </div>
          <div class="bg-primary-600 text-white px-2 py-1 rounded">
            <div class="font-bold">${seconds}</div>
            <div class="text-xs">sec</div>
          </div>
        </div>
      `;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  getStatusClasses(status) {
    const classes = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'ENDED': 'bg-red-100 text-red-800',
      'CANCELLED': 'bg-gray-100 text-gray-800',
      'DRAFT': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  showLoading(show) {
    const loader = document.getElementById('product-loader');
    const content = document.querySelector('.product-detail-content');
    
    if (show) {
      // Create loader if it doesn't exist
      if (!loader) {
        const loaderDiv = document.createElement('div');
        loaderDiv.id = 'product-loader';
        loaderDiv.innerHTML = `
          <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
              <i class="fas fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
              <p class="text-gray-600">Loading auction details...</p>
            </div>
          </div>
        `;
        document.body.appendChild(loaderDiv);
      } else {
        loader.style.display = 'block';
      }
      
      if (content) content.style.display = 'none';
    } else {
      if (loader) loader.style.display = 'none';
      if (content) content.style.display = 'block';
    }
  }

  showError(message) {
    console.error('🚨 Error:', message);
    
    // Try to find a main content area to show the error
    const mainContent = document.querySelector('.product-detail-container') || 
                       document.querySelector('.container') || 
                       document.querySelector('main') || 
                       document.body;
    
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="max-w-2xl mx-auto text-center py-16">
          <div class="bg-red-50 border border-red-200 rounded-lg p-8">
            <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-red-700 mb-4">Error Loading Auction</h2>
            <p class="text-red-600 mb-6">${message}</p>
            <div class="space-y-3">
              <button onclick="window.location.reload()" 
                      class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors mr-4">
                <i class="fas fa-redo mr-2"></i>Try Again
              </button>
              <a href="products.html" 
                 class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block">
                <i class="fas fa-arrow-left mr-2"></i>Back to Products
              </a>
            </div>
            <div class="mt-6 text-sm text-gray-600">
              <p>Troubleshooting tips:</p>
              <ul class="list-disc list-inside text-left mt-2 space-y-1">
                <li>Make sure the backend server is running on <code class="bg-gray-100 px-1 rounded">http://localhost:5000</code></li>
                <li>Check the browser console for more detailed error information</li>
                <li>Verify the auction ID in the URL is correct</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }
  }

  showSuccess(message) {
    // Simple success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  async handlePaymentCompletion(success) {
    if (success) {
      console.log('💳 Payment completed successfully, updating status...');
      
      // Mark as paid locally first for immediate UI update
      this.hasPaidEntryFee = true;
      this.updateBiddingSection();
      this.showSuccess('Entry fee paid successfully! You can now place bids.');
      
      // Wait a moment for payment to be processed on backend
      setTimeout(async () => {
        try {
          // Refresh payment status from backend to ensure persistence
          const actualStatus = await this.paymentManager.checkPaymentStatus(this.auctionId);
          this.hasPaidEntryFee = actualStatus;
          
          if (actualStatus) {
            console.log('✅ Payment status confirmed from backend');
          } else {
            console.warn('⚠️ Payment status not confirmed from backend, retrying...');
            
            // Retry after another delay
            setTimeout(async () => {
              const retryStatus = await this.paymentManager.checkPaymentStatus(this.auctionId);
              this.hasPaidEntryFee = retryStatus;
              this.updateBiddingSection();
              
              if (!retryStatus) {
                this.showError('Payment verification failed. Please refresh the page or contact support.');
              }
            }, 3000);
          }
          
          this.updateBiddingSection();
        } catch (error) {
          console.error('❌ Error verifying payment status:', error);
          this.showError('Error verifying payment. Please refresh the page.');
        }
      }, 2000);
    } else {
      this.showError('Payment failed. Please try again.');
    }
  }

  async manualRefreshPaymentStatus() {
    console.log('🔄 Manual payment status refresh triggered');
    
    // Show loading indicator
    const refreshBtn = document.getElementById('refresh-payment-btn');
    if (refreshBtn) {
      const originalText = refreshBtn.innerHTML;
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Checking...';
      refreshBtn.disabled = true;
      
      // Force check payment status
      await this.checkPaymentStatus();
      
      // Restore button
      setTimeout(() => {
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
      }, 1000);
    } else {
      await this.checkPaymentStatus();
    }
  }

  async processWinnerPayment() {
    // Collect shipping information
    const shippingInfo = this.collectShippingInfo();
    
    // Validate required fields
    if (!this.validateShippingInfo(shippingInfo)) {
      return;
    }
    
    // Get billing information
    const billingInfo = this.collectBillingInfo(shippingInfo);
    
    // Get Stripe elements
    const cardElement = this.currentCardElement;
    const stripe = this.currentStripe;
    
    if (!cardElement || !stripe) {
      this.showModalError('Payment system not initialized');
      return;
    }
    
    const submitButton = document.getElementById('winner-submit-payment');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing Payment...';
    
    try {
      // Clear any previous errors
      const errorDiv = document.getElementById('modal-error-message');
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
      
      // Get payment data from the current modal
      const paymentData = this.currentPaymentData;
      
      console.log('💳 Confirming card payment with Stripe...');
      
      const {error, paymentIntent} = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${billingInfo.firstName} ${billingInfo.lastName}`,
            email: billingInfo.email,
            phone: billingInfo.phone,
            address: {
              line1: billingInfo.address,
              line2: billingInfo.address2,
              city: billingInfo.city,
              state: billingInfo.state,
              postal_code: billingInfo.zip,
              country: billingInfo.country
            }
          }
        },
        shipping: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          phone: shippingInfo.phone,
          address: {
            line1: shippingInfo.address,
            line2: shippingInfo.address2,
            city: shippingInfo.city,
            state: shippingInfo.state,
            postal_code: shippingInfo.zip,
            country: shippingInfo.country
          }
        }
      });
      
      if (error) {
        console.error('❌ Stripe payment error:', error);
        throw new Error(error.message);
      }
      
      console.log('✅ Stripe payment confirmed:', paymentIntent.status);
      
      if (paymentIntent.status === 'succeeded') {
        console.log('💳 Verifying payment with backend...');
        // Verify payment on backend with shipping info
        await this.verifyWinnerPayment(paymentData.paymentIntentId, shippingInfo, billingInfo);
        
        // Close modal and show success
        document.body.removeChild(document.getElementById('winner-payment-modal'));
        this.showSuccess('Payment successful! You will receive a confirmation email with shipping details.');
        
        // Reload page to update status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      this.showModalError(error.message || 'Payment failed. Please try again.');
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-credit-card mr-2"></i>Complete Purchase - $' + this.currentPaymentData.amount.toLocaleString();
    }
  }

  collectShippingInfo() {
    return {
      firstName: document.getElementById('shipping-first-name').value.trim(),
      lastName: document.getElementById('shipping-last-name').value.trim(),
      email: document.getElementById('shipping-email').value.trim(),
      phone: document.getElementById('shipping-phone').value.trim(),
      address: document.getElementById('shipping-address').value.trim(),
      address2: document.getElementById('shipping-address-2').value.trim(),
      city: document.getElementById('shipping-city').value.trim(),
      state: document.getElementById('shipping-state').value.trim(),
      zip: document.getElementById('shipping-zip').value.trim(),
      country: document.getElementById('shipping-country').value,
      deliveryInstructions: document.getElementById('delivery-instructions').value.trim()
    };
  }

  collectBillingInfo(shippingInfo) {
    const sameAsShipping = document.getElementById('same-as-shipping').checked;
    
    if (sameAsShipping) {
      return {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        address2: shippingInfo.address2,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zip: shippingInfo.zip,
        country: shippingInfo.country
      };
    } else {
      return {
        firstName: document.getElementById('billing-first-name').value.trim(),
        lastName: document.getElementById('billing-last-name').value.trim(),
        email: shippingInfo.email, // Email always from shipping
        phone: shippingInfo.phone, // Phone always from shipping
        address: document.getElementById('billing-address').value.trim(),
        address2: '', // Not collected for billing
        city: document.getElementById('billing-city').value.trim(),
        state: document.getElementById('billing-state').value.trim(),
        zip: document.getElementById('billing-zip').value.trim(),
        country: shippingInfo.country // Country same as shipping
      };
    }
  }

  validateShippingInfo(shippingInfo) {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        missingFields.push(field.replace(/([A-Z])/g, ' $1').toLowerCase());
      }
    }
    
    if (missingFields.length > 0) {
      this.showModalError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      this.showModalError('Please enter a valid email address');
      return false;
    }
    
    // Validate phone format (more permissive)
    const cleanPhone = shippingInfo.phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
      this.showModalError('Please enter a valid phone number (10-15 digits)');
      return false;
    }
    
    // Check terms agreement
    const termsAgreed = document.getElementById('terms-agreement').checked;
    if (!termsAgreed) {
      this.showModalError('Please agree to the terms and conditions');
      return false;
    }
    
    return true;
  }

  showModalError(message) {
    // Show error within the modal instead of replacing the page
    let errorDiv = document.getElementById('modal-error-message');
    
    if (!errorDiv) {
      // Create error message div if it doesn't exist
      errorDiv = document.createElement('div');
      errorDiv.id = 'modal-error-message';
      errorDiv.className = 'mb-4 p-3 bg-red-50 border border-red-200 rounded-lg';
      
      // Insert at the top of the form
      const form = document.getElementById('winner-payment-form');
      if (form) {
        form.insertBefore(errorDiv, form.firstChild);
      }
    }
    
    errorDiv.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
        <span class="text-red-700 font-medium">${message}</span>
      </div>
    `;
    
    // Scroll to top of modal to show error
    const modal = document.getElementById('winner-payment-modal');
    if (modal) {
      modal.querySelector('.bg-white').scrollTop = 0;
    }
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
    }, 5000);
  }
}

// Global function for image gallery
function changeMainImage(src, thumbnailEl) {
  const mainImage = document.getElementById('main-image');
  if (mainImage) {
    mainImage.src = src;
  }
  
  // Update thumbnail borders - look for thumbnails in the image gallery
  const gallery = document.getElementById('image-gallery');
  if (gallery) {
    gallery.querySelectorAll('img').forEach(img => {
    img.classList.remove('border-primary-500');
    img.classList.add('border-gray-200');
  });
  }
  
  if (thumbnailEl) {
  thumbnailEl.classList.remove('border-gray-200');
  thumbnailEl.classList.add('border-primary-500');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductDetailManager();
}); 