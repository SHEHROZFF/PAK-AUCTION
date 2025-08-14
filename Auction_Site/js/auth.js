/**
 * Frontend Authentication System
 * Complete integration with backend API without changing HTML design
 */

class AuthManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api/auth';
    this.baseURL = 'https://app-c0af435a-abc2-4026-951e-e39dfcfe27c9.cleverapps.io/api/auth';
    this.currentUser = null;
    this.verificationCheckInterval = null;
    this.isInitialized = false;
    this.refreshPromise = null;
    this.init();
  }

  // Initialize authentication system
  init() {
    // Prevent multiple initializations
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('🔐 Initializing PakAuction Authentication System...');
    
    // Quick check for immediate redirect (before API call)
    this.quickAuthPageCheck();
    
    this.checkAuthStatus();
    this.bindEventListeners();
    
    // Show email verification notice immediately if needed
    setTimeout(() => {
      this.updateUI();
      this.showEmailVerificationNotice();
    }, 500); // Small delay to ensure DOM is ready
    
    // Start periodic verification notice check
    this.startVerificationNoticeCheck();
  }

  // Quick check for auth pages before API call (instant redirect)
  quickAuthPageCheck() {
    const token = localStorage.getItem('accessToken');
    if (!token) return; // No token, allow access to auth pages
    
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes('login.html');
    const isRegisterPage = currentPath.includes('register.html');
    
    if (isLoginPage || isRegisterPage) {
      console.log('🚀 Token found, redirecting from auth page...');
      
      // Show brief message and redirect immediately
      this.showMessage('You are already logged in! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800); // Faster redirect for better UX
    }
  }

  // Check if user is authenticated
  async checkAuthStatus() {
    try {
      console.log('🔍 Checking authentication status...');
      
      // Get the token from localStorage
      const token = localStorage.getItem('accessToken');
      const storedUserInfo = localStorage.getItem('userInfo');
      
      console.log('📋 Current auth state:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        hasStoredUser: !!storedUserInfo,
        note: 'HttpOnly refresh token cookies are invisible to JavaScript'
      });
      
      // If we have stored user info, use it immediately for UI updates
      if (storedUserInfo) {
        try {
          this.currentUser = JSON.parse(storedUserInfo);
          console.log('📱 Using stored user info for immediate UI update:', this.currentUser.firstName);
          this.updateUI(); // Update UI immediately
        } catch (e) {
          console.warn('⚠️ Failed to parse stored user info');
          localStorage.removeItem('userInfo');
        }
      }
      
      // If no token, we're not authenticated
      if (!token) {
        console.log('❌ No token in localStorage, user not authenticated');
        this.currentUser = null;
        this.updateUI();
        return;
      }
      
      console.log('🔑 Token found, verifying with backend (will auto-refresh if expired)...');
      
      // Use makeAuthenticatedRequest to automatically handle token refresh
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/profile`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.data.user;
        console.log('✅ User authenticated via backend:', this.currentUser.firstName);
        
        // Update stored user info with fresh data
        localStorage.setItem('userInfo', JSON.stringify(this.currentUser));
        
        // Check if user should be redirected from auth pages
        this.checkAuthPageRedirect();
        
        // Update UI again with fresh data (if different)
        this.updateUI();
        
        // Show verification notice if needed
        setTimeout(() => {
          this.showEmailVerificationNotice();
        }, 300);
      } else {
        console.log('❌ Authentication failed after refresh attempts:', response.status);
        
        // Check if this is a real auth failure or just a network/server issue
        if (response.status === 401) {
          console.log('🔍 Token refresh failed - clearing stored data');
          
          // Note: We cannot check HttpOnly cookies from JavaScript
          // If the refresh failed with 401, it means the refresh token is invalid/expired
          console.log('🚪 Authentication failed after refresh attempt, logging out user');
          console.log('🗑️ AUTH CHECK: Clearing localStorage tokens');
          console.trace('🔍 AUTH CHECK: Call stack trace');
          this.currentUser = null;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userInfo');
          this.updateUI();
        } else if (response.status >= 500) {
          console.log('⚠️ Server error during auth check, keeping current state');
          // Keep current user state for server errors
        } else {
          console.log('⚠️ Unexpected auth response, keeping current state');
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      
      // For network errors, keep the stored user info if it exists
      if (!this.currentUser && !localStorage.getItem('userInfo')) {
        console.log('🔄 No stored user info, setting to logged out state');
        this.currentUser = null;
        this.updateUI();
      } else {
        console.log('📱 Keeping current user state due to network error');
      }
    }
  }

  // Check if authenticated user should be redirected from login/register pages
  checkAuthPageRedirect() {
    if (!this.currentUser) return;
    
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes('login.html');
    const isRegisterPage = currentPath.includes('register.html');
    
    if (isLoginPage || isRegisterPage) {
      console.log('🔄 User already authenticated, redirecting from auth page to index.html');
      this.showMessage(`Welcome back, ${this.currentUser.firstName}! Redirecting to home...`, 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  }

  // Bind event listeners to forms
  bindEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Forgot password links
    const forgotPasswordLinks = document.querySelectorAll('a[href="#"]');
    forgotPasswordLinks.forEach(link => {
      if (link.textContent.includes('Forgot Password')) {
        link.addEventListener('click', (e) => this.handleForgotPassword(e));
      }
    });

    // Password reset form (if exists)
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
    }

    // Change password form (if exists)
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
    }

    // Logout functionality
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('logout-btn') || e.target.textContent === 'Logout') {
        e.preventDefault();
        this.handleLogout();
      }
    });

    // Resend verification email
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('resend-verification-btn')) {
        e.preventDefault();
        this.handleResendVerification();
      }
    });
  }

  // Handle login form submission
  async handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = form.querySelector('input[type="checkbox"]')?.checked || false;

    // Client-side validation
    if (!email || !password) {
      this.showMessage('Please fill in all required fields', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (response.ok) {
        this.currentUser = data.data.user;
        console.log('✅ Login successful for:', this.currentUser.firstName);
        
        this.showMessage('Login successful! Redirecting...', 'success');
        
        // Store tokens - fix token field name mismatch
        if (data.data.token) {
          console.log('💾 LOGIN: Storing new access token in localStorage');
          console.log('🔑 LOGIN: Access token preview:', data.data.token.substring(0, 50) + '...');
          localStorage.setItem('accessToken', data.data.token);
        } else {
          console.log('❌ LOGIN: No access token in login response!');
        }

        // Store refresh token for cross-domain compatibility
        if (data.data.refreshToken) {
          console.log('💾 LOGIN: Storing refresh token in localStorage for cross-domain support');
          console.log('🔄 LOGIN: Refresh token preview:', data.data.refreshToken.substring(0, 50) + '...');
          localStorage.setItem('refreshToken', data.data.refreshToken);
        } else {
          console.log('⚠️ LOGIN: No refresh token in login response (relying on HttpOnly cookies)');
        }

        // Store user info for immediate access
        localStorage.setItem('userInfo', JSON.stringify(this.currentUser));

        // Update UI immediately with proper session
        this.updateUI();
        
        // Start verification notice check if needed
        this.startVerificationNoticeCheck();

        // Redirect to home page (index.html)
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        this.showMessage(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  // Handle register form submission
  async handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Get form data with correct field names
    const userData = {
      email: formData.get('email'),
      username: formData.get('username'),
      firstName: formData.get('first-name'),
      lastName: formData.get('last-name'),
      password: formData.get('password')?.trim(),
      confirmPassword: formData.get('confirm-password')?.trim(),
      phone: formData.get('phone'),
      dateOfBirth: formData.get('date-of-birth'),
      marketingEmails: form.querySelector('input[type="checkbox"]:last-of-type')?.checked || false
    };

    // Client-side validation
    const confirmPassword = userData.confirmPassword;
    const termsAccepted = form.querySelector('input[type="checkbox"]:first-of-type')?.checked;

    // Debug logging
    console.log('Password:', `"${userData.password}"`);
    console.log('Confirm Password:', `"${confirmPassword}"`);
    console.log('Passwords match:', userData.password === confirmPassword);
    console.log('Full userData being sent:', userData);

    if (!userData.email || !userData.username || !userData.firstName || !userData.lastName || !userData.password) {
      this.showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (!confirmPassword) {
      this.showMessage('Please confirm your password', 'error');
      return;
    }

    if (userData.password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    if (!termsAccepted) {
      this.showMessage('Please accept the Terms of Service and Privacy Policy', 'error');
      return;
    }

    // Password strength validation
    if (userData.password.length < 8) {
      this.showMessage('Password must be at least 8 characters long', 'error');
      return;
    }

    if (!/(?=.*[0-9])/.test(userData.password)) {
      this.showMessage('Password must contain at least one number', 'error');
      return;
    }

    if (!/(?=.*[!@#$%^&*])/.test(userData.password)) {
      this.showMessage('Password must contain at least one special character', 'error');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        this.showMessage('Registration successful! Please check your email to verify your account.', 'success');
        
        // Clear form
        form.reset();
        
        // Redirect to login page after a delay
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          // Show validation errors
          const errorMessages = data.errors.map(err => err.msg).join('<br>');
          this.showMessage(errorMessages, 'error');
        } else {
          this.showMessage(data.message || 'Registration failed', 'error');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  // Handle forgot password
  async handleForgotPassword(e) {
    e.preventDefault();
    
    // Create and show forgot password modal
    this.showForgotPasswordModal();
  }

  // Show forgot password modal
  showForgotPasswordModal() {
    // Remove existing modal if any
    const existingModal = document.querySelector('.forgot-password-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'forgot-password-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">Forgot Password</h3>
          <button class="close-modal text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        
        <p class="text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
        
        <form id="forgot-password-form">
          <div class="mb-4">
            <label for="forgot-email" class="block text-gray-700 font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="forgot-email"
              name="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div class="flex space-x-3">
            <button
              type="button"
              class="close-modal flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Send Reset Link
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#forgot-password-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleForgotPasswordSubmit(e, modal);
    });

    // Handle modal close
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.remove();
      });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Focus on email input
    setTimeout(() => {
      modal.querySelector('#forgot-email').focus();
    }, 100);
  }

  // Handle forgot password form submission
  async handleForgotPasswordSubmit(e, modal) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email')?.trim();

    if (!email) {
      this.showMessage('Please enter your email address', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${this.baseURL}/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.showMessage('✅ Password reset link sent! Please check your email and spam folder.', 'success');
        modal.remove();
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join('<br>');
          this.showMessage(errorMessages, 'error');
        } else {
          this.showMessage(data.message || 'Failed to send reset email', 'error');
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      this.showMessage('Network error. Please try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  // Handle password reset form submission
  async handlePasswordReset(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const password = formData.get('password')?.trim();
    const confirmPassword = formData.get('confirm-password')?.trim();
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      this.showMessage('Invalid reset link', 'error');
      return;
    }

    if (!password || !confirmPassword) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    if (password.length < 8) {
      this.showMessage('Password must be at least 8 characters long', 'error');
      return;
    }

    // Validate password strength
    if (!/(?=.*[a-z])/.test(password)) {
      this.showMessage('Password must contain at least one lowercase letter', 'error');
      return;
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      this.showMessage('Password must contain at least one uppercase letter', 'error');
      return;
    }

    if (!/(?=.*\d)/.test(password)) {
      this.showMessage('Password must contain at least one number', 'error');
      return;
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      this.showMessage('Password must contain at least one special character (@$!%*?&)', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Resetting Password...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${this.baseURL}/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          password,
          confirmPassword // Include confirmPassword for backend validation
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.showMessage('Password reset successful! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg).join('<br>');
          this.showMessage(errorMessages, 'error');
        } else {
          this.showMessage(data.message || 'Password reset failed', 'error');
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      this.showMessage('Network error. Please try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  // Handle change password form submission
  async handleChangePassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const currentPassword = formData.get('current-password');
    const newPassword = formData.get('new-password');
    const confirmPassword = formData.get('confirm-password');

    if (newPassword !== confirmPassword) {
      this.showMessage('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      this.showMessage('New password must be at least 8 characters long', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Changing Password...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(`${this.baseURL}/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        this.showMessage('Password changed successfully! Please login again.', 'success');
        this.currentUser = null;
        this.updateUI();
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        this.showMessage(data.message || 'Password change failed', 'error');
      }
    } catch (error) {
      console.error('Change password error:', error);
      this.showMessage('Network error. Please try again.', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  // Enhanced resend verification with better feedback
  async handleResendVerification() {
    if (!this.currentUser || this.currentUser.isEmailVerified) {
      this.showMessage('Email verification not needed', 'info');
      return;
    }

    // Show loading state on the button
    const resendBtn = document.querySelector('.resend-verification-btn');
    if (resendBtn) {
      const originalText = resendBtn.innerHTML;
      resendBtn.innerHTML = '⏳ Sending...';
      resendBtn.disabled = true;
      
      setTimeout(() => {
        if (resendBtn) {
          resendBtn.innerHTML = originalText;
          resendBtn.disabled = false;
        }
      }, 3000);
    }

    try {
      const response = await fetch(`${this.baseURL}/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: this.currentUser.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.showMessage('✅ Verification email sent! Please check your inbox and spam folder.', 'success');
      } else {
        this.showMessage(data.message || 'Failed to send verification email', 'error');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      this.showMessage('Network error. Please try again.', 'error');
    }
  }

  // Handle logout
  async handleLogout() {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Clear local storage
      console.log('🗑️ LOGOUT: Clearing localStorage tokens');
      console.trace('🔍 LOGOUT: Call stack trace');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      this.currentUser = null;
      
      // Stop verification notice check
      this.stopVerificationNoticeCheck();
      
      // Hide verification notice
      this.hideEmailVerificationNotice();
      
      this.updateUI();

      this.showMessage('Logged out successfully', 'success');
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      console.log('🗑️ LOGOUT ERROR: Clearing localStorage tokens after error');
      console.trace('🔍 LOGOUT ERROR: Call stack trace');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      this.currentUser = null;
      this.stopVerificationNoticeCheck();
      this.hideEmailVerificationNotice();
      this.updateUI();
      this.showMessage('Logged out', 'info');
    }
  }

  // Update UI based on authentication status - FIXED VERSION
  updateUI() {
    // Find auth buttons more reliably
    const loginButtons = document.querySelectorAll('a[href="login.html"]');
    const registerButtons = document.querySelectorAll('a[href="register.html"]');
    
    if (this.currentUser) {
      console.log('🔄 Updating UI for logged in user:', this.currentUser.firstName);
      
      // Update login buttons to show user name
      loginButtons.forEach((btn, index) => {
        // Avoid duplicate event listeners
        const newBtn = btn.cloneNode(true);
        newBtn.textContent = `Hi, ${this.currentUser.firstName}`;
        newBtn.href = '#';
        newBtn.classList.add('user-menu-btn');
        
        // Add click handler for user menu
        newBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.showUserMenu(e);
        });
        
        // Replace the old button
        btn.parentNode.replaceChild(newBtn, btn);
      });

      // Update register buttons (but preserve "Sell Product" button)
      registerButtons.forEach((btn) => {
        if (!btn.classList.contains('sell-your-product_Navbar')) {
          btn.textContent = 'Dashboard';
          btn.href = '#';
          btn.classList.add('dashboard-btn');
          
          // Clone to remove old event listeners
          const newBtn = btn.cloneNode(true);
          newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showDashboard();
          });
          btn.parentNode.replaceChild(newBtn, btn);
        }
      });

      // Show email verification notice if not verified
      if (!this.currentUser.isEmailVerified) {
        setTimeout(() => {
          this.showEmailVerificationNotice();
        }, 200);
      } else {
        this.hideEmailVerificationNotice();
      }
    } else {
      console.log('🔄 Updating UI for guest user');
      
      // Hide verification notice
      this.hideEmailVerificationNotice();
      
      // Reset login buttons
      loginButtons.forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        newBtn.textContent = 'Login';
        newBtn.href = 'login.html';
        newBtn.classList.remove('user-menu-btn');
        btn.parentNode.replaceChild(newBtn, btn);
      });

      // Reset register buttons (but preserve "Sell Product" button)
      registerButtons.forEach((btn) => {
        if (!btn.classList.contains('sell-your-product_Navbar')) {
          const newBtn = btn.cloneNode(true);
          newBtn.textContent = 'Register';
          newBtn.href = 'register.html';
          newBtn.classList.remove('dashboard-btn');
          btn.parentNode.replaceChild(newBtn, btn);
        }
      });
    }
  }

  // Show user menu dropdown
  showUserMenu(e) {
    const existingMenu = document.querySelector('.user-dropdown-menu');
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border';
    
    const verificationBadge = this.currentUser.isEmailVerified 
      ? '<span class="inline-block w-2 h-2 bg-green-500 rounded-full ml-1"></span>' 
      : '<span class="inline-block w-2 h-2 bg-red-500 rounded-full ml-1"></span>';

    menu.innerHTML = `
      <div class="py-1">
        <div class="px-4 py-2 text-sm text-gray-700 border-b">
          <div class="font-medium">${this.currentUser.firstName} ${this.currentUser.lastName} ${verificationBadge}</div>
          <div class="text-gray-500">${this.currentUser.email}</div>
          <div class="text-xs text-gray-400">${this.currentUser.role}</div>
        </div>
        <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <i class="fas fa-user mr-2"></i>Profile
        </a>
        ${!this.currentUser.isEmailVerified ? 
          '<a href="#" class="block px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 resend-verification-btn" onclick="authManager.handleResendVerification()"><i class="fas fa-envelope mr-2"></i>Verify Email</a>' : 
          ''
        }
        <a href="profile.html?tab=security" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <i class="fas fa-cog mr-2"></i>Settings
        </a>
        <div class="border-t border-gray-100"></div>
        <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onclick="authManager.handleLogout()">
          <i class="fas fa-sign-out-alt mr-2"></i>Logout
        </a>
      </div>
    `;

    const button = e.target;
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;

    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 100);
  }

  // Show email verification notice
  showEmailVerificationNotice() {
    // Remove any existing notice first
    const existingNotice = document.querySelector('.email-verification-notice');
    if (existingNotice) {
      existingNotice.remove();
    }

    // Only show if user is logged in and email is not verified
    if (!this.currentUser || this.currentUser.isEmailVerified) {
      return;
    }

    const notice = document.createElement('div');
    notice.className = 'email-verification-notice fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-3 text-center z-50 shadow-lg';
    notice.innerHTML = `
      <div class="flex justify-center items-center space-x-3 text-sm md:text-base">
        <i class="fas fa-exclamation-triangle text-yellow-200 animate-pulse"></i>
        <span class="font-medium">⚠️ Please verify your email address to access all features and secure your account!</span>
        <button class="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-semibold hover:bg-orange-50 transition-colors resend-verification-btn" onclick="authManager.handleResendVerification()">
          📧 Resend Email
        </button>
        <button onclick="authManager.hideEmailVerificationNotice()" class="text-white hover:text-yellow-200 text-xl font-bold ml-2" title="Hide (will show again on page refresh)">&times;</button>
      </div>
    `;

    // Insert at the very top of the page
    document.body.insertBefore(notice, document.body.firstChild);

    // Adjust page content to account for the notice
    const header = document.querySelector('header');
    if (header) {
      header.style.marginTop = '52px'; // Adjust based on notice height
    }

    // Show notice again after 30 seconds if still not verified
    setTimeout(() => {
      if (this.currentUser && !this.currentUser.isEmailVerified) {
        this.showEmailVerificationNotice();
      }
    }, 30000);
  }

  // Hide email verification notice temporarily
  hideEmailVerificationNotice() {
    const notice = document.querySelector('.email-verification-notice');
    if (notice) {
      notice.remove();
      
      // Reset header margin
      const header = document.querySelector('header');
      if (header) {
        header.style.marginTop = '0';
      }
    }
  }

  // Show user profile (navigate to profile page)
  showProfile() {
    window.location.href = 'profile.html';
  }

  // Show dashboard (navigate to dashboard page)
  showDashboard() {
    window.location.href = 'dashboard.html';
  }

  // Show settings (navigate to profile security tab)
  showSettings() {
    window.location.href = 'profile.html?tab=security';
  }

  // Show message to user
  showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-md`;
    
    if (type === 'success') {
      messageEl.className += ' bg-green-100 border border-green-400 text-green-700';
      messageEl.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <div>${message}</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg font-bold">&times;</button>
        </div>
      `;
    } else if (type === 'error') {
      messageEl.className += ' bg-red-100 border border-red-400 text-red-700';
      messageEl.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <div>${message}</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg font-bold">&times;</button>
        </div>
      `;
    } else {
      messageEl.className += ' bg-blue-100 border border-blue-400 text-blue-700';
      messageEl.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center">
            <i class="fas fa-info-circle mr-2"></i>
            <div>${message}</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg font-bold">&times;</button>
        </div>
      `;
    }

    document.body.appendChild(messageEl);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.remove();
      }
    }, 5000);
  }

  // Utility method to make authenticated API calls
  async makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('accessToken');
    
    const defaultOptions = {
      credentials: 'include',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers['Content-Type'] = 'application/json';
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, mergedOptions);
      
      // Handle token refresh if needed (but NOT for refresh-token endpoint itself)
      if (response.status === 401 && token && !url.includes('/refresh-token')) {
        console.log('🔄 Access token expired, attempting refresh...');
        
        // Use shared refresh promise to prevent concurrent refreshes
        if (!this.refreshPromise) {
          this.refreshPromise = this.performRefresh();
        }

        try {
          const newAccessToken = await this.refreshPromise;
          this.refreshPromise = null; // Reset after completion

          if (newAccessToken) {
            // Retry original request with new token
            mergedOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
            console.log('🔄 Retrying original request with new token');
            const retryResponse = await fetch(url, mergedOptions);
            
            // Check if retry was successful
            if (retryResponse.ok) {
              console.log('✅ Request successful after token refresh');
              return retryResponse;
            } else {
              console.log('❌ Request failed even after token refresh:', retryResponse.status);
              // Only logout if it's still a 401 after refresh
              if (retryResponse.status === 401 && (url.includes('/auth/profile') || url.includes('/users/'))) {
                console.log('❌ Critical auth endpoint still failing after refresh, logging out user');
                this.handleLogout();
              }
              return retryResponse;
            }
          } else {
            // Refresh failed - check if we should logout or just return error
            console.log('❌ Token refresh failed');
            
            // If this is a critical auth endpoint, logout user
            if (url.includes('/auth/profile') || url.includes('/users/')) {
              console.log('❌ Critical auth endpoint failed, logging out user');
              this.handleLogout();
            } else {
              console.log('⚠️ Non-critical endpoint failed, returning 401 response');
            }
            return response;
          }
        } catch (refreshError) {
          this.refreshPromise = null; // Reset on error
          console.log('❌ Token refresh failed, logging out user');
          this.handleLogout();
          return response;
        }
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Centralized refresh method to prevent concurrent refreshes
  async performRefresh() {
    try {
              console.log('🔑 Web: Making refresh request...');
        console.log('🍪 Web: Sending request with credentials (HttpOnly cookies will be sent automatically)');
      
      // Check if we have refresh token in localStorage (for cross-domain scenarios)
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const requestBody = storedRefreshToken ? { refreshToken: storedRefreshToken } : {};
      
      if (storedRefreshToken) {
        console.log('🔄 Web: Using stored refresh token for cross-domain compatibility');
      } else {
        console.log('🍪 Web: No stored refresh token, relying on HttpOnly cookies');
      }
      
      const refreshResponse = await fetch(`${this.baseURL}/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🔄 Web: Refresh response status:', refreshResponse.status);
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        console.log('✅ Web: Token refreshed successfully:', {
          success: refreshData.success,
          message: refreshData.message,
          hasToken: !!refreshData.data?.token,
          hasRefreshToken: !!refreshData.data?.refreshToken
        });
        
        // Use the correct property name from backend response
        const newAccessToken = refreshData.data.token;
        
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          console.log('💾 Web: New access token stored in localStorage');
          console.log('🔑 Web: New token preview:', newAccessToken.substring(0, 50) + '...');
          
          // Store new refresh token if provided (for cross-domain scenarios)
          if (refreshData.data.refreshToken) {
            localStorage.setItem('refreshToken', refreshData.data.refreshToken);
            console.log('🔄 Web: New refresh token stored in localStorage');
          }
          
          return newAccessToken;
        } else {
          console.log('❌ Web: No access token in refresh response');
          return null;
        }
      } else {
        const errorData = await refreshResponse.json().catch(() => ({}));
        console.log('❌ Web: Refresh response not ok:', {
          status: refreshResponse.status,
          error: errorData,
          note: 'Cannot check HttpOnly refresh token from JavaScript'
        });
        return null;
      }
    } catch (error) {
      console.error('❌ Web: Refresh request failed with exception:', error);
      return null; // Return null instead of throwing to prevent unhandled rejections
    }
  }

  // Start periodic check for email verification notice
  startVerificationNoticeCheck() {
    // Clear any existing interval
    if (this.verificationCheckInterval) {
      clearInterval(this.verificationCheckInterval);
    }
    
    // Check every 10 seconds if verification notice should be shown
    this.verificationCheckInterval = setInterval(() => {
      if (this.currentUser && !this.currentUser.isEmailVerified) {
        const existingNotice = document.querySelector('.email-verification-notice');
        if (!existingNotice) {
          this.showEmailVerificationNotice();
        }
      }
    }, 10000); // Check every 10 seconds
  }

  // Stop verification notice check
  stopVerificationNoticeCheck() {
    if (this.verificationCheckInterval) {
      clearInterval(this.verificationCheckInterval);
      this.verificationCheckInterval = null;
    }
  }

  // Handle email verification from URL token
  async handleEmailVerification(token, callbacks = {}) {
    const {
      onLoading = () => {},
      onSuccess = () => {},
      onError = () => {},
      onNoToken = () => {}
    } = callbacks;

    // Check if token exists
    if (!token) {
      console.log('❌ No verification token provided');
      onNoToken();
      return;
    }

    console.log('🔍 Verifying email with token...');
    onLoading();

    try {
      const response = await fetch(`${this.baseURL}/verify-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Email verification successful');
        
        // Update current user if logged in
        if (this.currentUser) {
          this.currentUser.isEmailVerified = true;
          // Update stored user info
          localStorage.setItem('userInfo', JSON.stringify(this.currentUser));
          this.updateUI();
          this.hideEmailVerificationNotice();
        }
        
        onSuccess(data);
        this.showMessage('Email verified successfully! 🎉', 'success');
      } else {
        console.log('❌ Email verification failed:', data.message);
        onError(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Email verification error:', error);
      onError('Network error. Please check your connection and try again.');
    }
  }

  // Handle resend verification with email parameter (for verify page)
  async handleResendVerificationWithEmail(email) {
    if (!email) {
      this.showMessage('Email address is required', 'error');
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.showMessage('✅ Verification email sent! Please check your inbox and spam folder.', 'success');
        return true;
      } else {
        this.showMessage(data.message || 'Failed to send verification email', 'error');
        return false;
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      this.showMessage('Network error. Please try again.', 'error');
      return false;
    }
  }
}

// Initialize authentication manager only once
if (!window.authManager) {
  const authManager = new AuthManager();
  window.authManager = authManager;
} 

// Global utility function for authenticated requests with auto-refresh
window.makeAuthenticatedRequest = async function(url, options = {}) {
  if (window.authManager && window.authManager.makeAuthenticatedRequest) {
    return await window.authManager.makeAuthenticatedRequest(url, options);
  } else {
    // Fallback to regular fetch if auth manager not available
    const token = localStorage.getItem('accessToken');
    const defaultOptions = {
      credentials: 'include',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers['Content-Type'] = 'application/json';
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    return await fetch(url, mergedOptions);
  }
}; 