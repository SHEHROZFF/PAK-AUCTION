/**
 * Payment Processing Module - Stripe Integration
 * Handles entry fee payments, payment verification, and Stripe integration
 */

class PaymentManager {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.stripe = null;
    this.elements = null;
    this.card = null;
    this.isProcessing = false;
    this.stripeInitialized = false;
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Payment Manager...');
    
    // Initialize Stripe - get public key from backend
    await this.initializeStripe();
  }

  async initializeStripe() {
    try {
      // Get Stripe public key from backend
      const response = await fetch(`${this.baseURL}/payments/stripe-key`);
      if (response.ok) {
        const data = await response.json();
        
        // Use the actual Stripe public key from backend
        const publicKey = data.data.publicKey;
        
        // For development, use a test key if the backend returns a placeholder
        if (publicKey === 'pk_test_51234567890abcdef') {
          console.warn('⚠️ Using placeholder Stripe key - Replace with real test key');
          // You can replace this with a real Stripe test key
          // this.stripe = Stripe('pk_test_YOUR_ACTUAL_TEST_KEY_HERE');
          this.stripe = Stripe(publicKey); // Use placeholder for now
        } else {
          this.stripe = Stripe(publicKey);
        }
        
        this.stripeInitialized = true;
        console.log('✅ Stripe initialized successfully');
      } else {
        console.error('❌ Failed to get Stripe public key');
        this.handleStripeInitError('Failed to get Stripe public key from server');
      }
    } catch (error) {
      console.error('❌ Error initializing Stripe:', error);
      this.handleStripeInitError(error.message);
    }
  }

  handleStripeInitError(errorMessage) {
    this.stripeInitialized = false;
    console.error('💳 Stripe initialization failed:', errorMessage);
    
    // Show a user-friendly error message
    this.showError('Payment system is currently unavailable. Please try again later.');
  }

  /**
   * Create payment modal for entry fees
   */
  createPaymentModal(auctionId, entryFee, auctionTitle) {
    // Check if Stripe is initialized
    if (!this.stripeInitialized) {
      this.showError('Payment system is not available. Please refresh the page and try again.');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'payment-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Pay Entry Fee</h3>
            <button onclick="closePaymentModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <!-- Auction Info -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-900 mb-2">Auction Details</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-800 mb-1">${auctionTitle}</h5>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Entry Fee (10%):</span>
                <span class="font-bold text-lg text-primary-600">$${Number(entryFee).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <form id="payment-form">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <div id="card-element" class="border border-gray-300 rounded-md p-3 bg-white">
                <!-- Stripe Elements will create form elements here -->
              </div>
              <div id="card-errors" class="text-red-600 text-sm mt-2"></div>
            </div>

            <!-- Security Notice -->
            <div class="mb-6">
              <div class="flex items-start space-x-2 text-sm text-gray-600">
                <i class="fas fa-shield-alt text-green-600 mt-0.5"></i>
                <div>
                  <p class="font-medium">Secure Payment</p>
                  <p>Your payment is secured by Stripe. We don't store card details.</p>
                </div>
              </div>
            </div>

            <!-- Payment Button -->
            <button 
              type="submit" 
              id="payment-submit-btn"
              class="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              <span id="payment-btn-text">Pay $${Number(entryFee).toLocaleString()}</span>
              <i id="payment-loading" class="fas fa-spinner fa-spin ml-2 hidden"></i>
            </button>
          </form>
          
          <!-- Demo Notice for Development -->
          <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex">
              <i class="fas fa-info-circle text-yellow-600 mt-0.5 mr-2"></i>
              <div class="text-yellow-800 text-sm">
                <p class="font-medium">Demo Mode</p>
                <p>This is a test payment system. Use test card: 4242 4242 4242 4242</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="text-xs text-gray-500">
            <p>• Entry fees are non-refundable</p>
            <p>• Payment is required to participate in bidding</p>
            <p>• Secure payment powered by Stripe</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Initialize Stripe Elements after modal is added to DOM
    setTimeout(() => this.initializeStripeElements(), 100);
    
    // Setup form submission
    document.getElementById('payment-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePayment(auctionId, entryFee);
    });

    return modal;
  }

  initializeStripeElements() {
    if (!this.stripe) {
      console.error('❌ Stripe not initialized');
      this.showError('Payment system error. Please close and try again.');
      return;
    }

    // Create an instance of Elements
    this.elements = this.stripe.elements();

    // Create card element
    this.card = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    });

    // Mount the card element
    this.card.mount('#card-element');

    // Handle real-time validation errors from the card Element
    this.card.on('change', ({error}) => {
      const displayError = document.getElementById('card-errors');
      if (error) {
        displayError.textContent = error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

  async handlePayment(auctionId, entryFee) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.updatePaymentButton(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Create payment intent on backend
      const paymentIntentResponse = await fetch(`${this.baseURL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          auctionId: auctionId,
          amount: Math.round(entryFee * 100), // Convert to cents
          type: 'ENTRY_FEE'
        })
      });

      if (!paymentIntentResponse.ok) {
        const error = await paymentIntentResponse.json();
        throw new Error(error.message || 'Failed to create payment intent');
      }

      const { data } = await paymentIntentResponse.json();
      const { clientSecret } = data;

      // Confirm payment with Stripe
      const {error, paymentIntent} = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            // You can add billing details here if needed
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful - verify on backend and wait for confirmation
        console.log('💳 Payment succeeded, verifying on backend...');
        await this.verifyPayment(auctionId, paymentIntent.id);
        
        // Close modal first
        this.closePaymentModal();
        this.showSuccess('Payment successful! Verifying payment status...');
        
        // Wait for backend to process and then verify payment status
        await this.waitForPaymentConfirmation(auctionId, 3);
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      this.showError(error.message || 'Payment failed. Please try again.');
    } finally {
      this.isProcessing = false;
      this.updatePaymentButton(false);
    }
  }

  /**
   * Wait for payment confirmation with retries
   */
  async waitForPaymentConfirmation(auctionId, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      console.log(`💳 Checking payment confirmation attempt ${i + 1}/${maxRetries}...`);
      
      // Wait 2 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const hasPaid = await this.checkPaymentStatus(auctionId);
      
      if (hasPaid) {
        console.log('✅ Payment confirmed! Reloading page...');
        this.showSuccess('Payment confirmed! You can now place bids.');
        
        // Wait a moment then reload
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }
    }
    
    // If we get here, payment wasn't confirmed
    console.warn('⚠️ Payment verification timeout - showing manual refresh option');
    this.showPaymentVerificationError();
  }

  showPaymentVerificationError() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 max-w-md bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-start">
        <i class="fas fa-exclamation-triangle mr-3 mt-1"></i>
        <div class="flex-1">
          <p class="font-medium mb-2">Payment Processing</p>
          <p class="text-sm mb-3">Your payment was successful but verification is taking longer than expected.</p>
          <button onclick="window.location.reload()" 
                  class="bg-white text-yellow-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
            Refresh Page
          </button>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    document.body.appendChild(notification);
  }

  async verifyPayment(auctionId, paymentIntentId) {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseURL}/payments/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        auctionId: auctionId,
        paymentIntentId: paymentIntentId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    return response.json();
  }

  updatePaymentButton(loading) {
    const btn = document.getElementById('payment-submit-btn');
    const btnText = document.getElementById('payment-btn-text');
    const loadingIcon = document.getElementById('payment-loading');
    
    if (loading) {
      btn.disabled = true;
      btnText.textContent = 'Processing...';
      loadingIcon.classList.remove('hidden');
    } else {
      btn.disabled = false;
      btnText.textContent = btnText.textContent.replace('Processing...', 'Pay');
      loadingIcon.classList.add('hidden');
    }
  }

  closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Check if user has paid entry fee for an auction
   */
  async checkPaymentStatus(auctionId) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('💳 No auth token found for payment status check');
        return false;
      }

      console.log(`💳 Checking payment status for auction: ${auctionId}`);
      console.log(`💳 Using token: ${token.substring(0, 20)}...`);
      
      const response = await fetch(`${this.baseURL}/payments/status/${auctionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`💳 Payment status API response: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('💳 Payment status data:', data);
        
        const hasPaid = data.data?.hasPaid || false;
        console.log(`💳 User has paid entry fee: ${hasPaid}`);
        
        if (hasPaid && data.data.payment) {
          console.log(`💳 Payment details:`, {
            id: data.data.payment.id,
            amount: data.data.payment.amount,
            paidAt: data.data.payment.paidAt,
            paymentIntentId: data.data.payment.paymentIntentId
          });
        }
        
        // If payment not found, let's check payment history to see if there's a payment
        if (!hasPaid) {
          console.log('💳 Payment not found via status endpoint, checking payment history...');
          await this.debugPaymentForAuction(auctionId);
        }
        
        return hasPaid;
      } else {
        const errorData = await response.text();
        console.error('💳 Payment status check failed:', response.status, errorData);
        
        // If status check failed, try checking payment history as fallback
        console.log('💳 Status endpoint failed, trying payment history fallback...');
        return await this.checkPaymentViaHistory(auctionId);
      }
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      
      // Fallback: check payment history
      console.log('💳 Primary status check failed, trying payment history fallback...');
      try {
        return await this.checkPaymentViaHistory(auctionId);
      } catch (fallbackError) {
        console.error('❌ Fallback payment check also failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Fallback method to check payment via payment history
   */
  async checkPaymentViaHistory(auctionId) {
    try {
      console.log(`💳 Checking payment via history for auction: ${auctionId}`);
      
      const paymentHistory = await this.getPaymentHistory();
      console.log('💳 Retrieved payment history:', paymentHistory);
      
      // Look for successful payments for this auction
      const auctionPayments = paymentHistory.filter(payment => {
        const matchesAuction = payment.auctionId === auctionId;
        const isSuccessful = payment.status === 'SUCCEEDED';
        const isEntryFee = payment.type === 'ENTRY_FEE';
        
        console.log(`💳 Checking payment ${payment.id}:`, {
          auctionId: payment.auctionId,
          matchesAuction,
          status: payment.status,
          isSuccessful,
          type: payment.type,
          isEntryFee
        });
        
        return matchesAuction && isSuccessful && isEntryFee;
      });
      
      const hasPaid = auctionPayments.length > 0;
      console.log(`💳 Payment found via history: ${hasPaid}`);
      
      if (hasPaid) {
        console.log('💳 Found payment via history:', auctionPayments[0]);
      }
      
      return hasPaid;
    } catch (error) {
      console.error('❌ Error checking payment via history:', error);
      return false;
    }
  }

  /**
   * Debug payment information for specific auction
   */
  async debugPaymentForAuction(auctionId) {
    try {
      console.log(`🔍 Debug: Analyzing payments for auction ${auctionId}`);
      
      const paymentHistory = await this.getPaymentHistory();
      const allAuctionPayments = paymentHistory.filter(p => p.auctionId === auctionId);
      
      console.log(`🔍 Debug: Found ${allAuctionPayments.length} payments for this auction:`, allAuctionPayments);
      
      allAuctionPayments.forEach((payment, index) => {
        console.log(`🔍 Debug: Payment ${index + 1}:`, {
          id: payment.id,
          auctionId: payment.auctionId,
          status: payment.status,
          type: payment.type,
          amount: payment.amount,
          amountInDollars: payment.amountInDollars,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt,
          paymentIntentId: payment.paymentIntentId
        });
      });
      
      const successfulEntryFees = allAuctionPayments.filter(p => 
        p.status === 'SUCCEEDED' && p.type === 'ENTRY_FEE'
      );
      
      console.log(`🔍 Debug: ${successfulEntryFees.length} successful entry fee payments found`);
      
      if (successfulEntryFees.length > 0) {
        console.log('🔍 Debug: Latest successful entry fee payment:', successfulEntryFees[0]);
      }
      
    } catch (error) {
      console.error('❌ Debug payment analysis failed:', error);
    }
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${this.baseURL}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.payments;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      return [];
    }
  }

  showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
    notification.innerHTML = `
      <i class="fas fa-check-circle mr-2"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
  }

  showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center';
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle mr-2"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
  }
}

// Global functions
function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    modal.remove();
  }
}

// Export for use in other modules
window.PaymentManager = PaymentManager; 