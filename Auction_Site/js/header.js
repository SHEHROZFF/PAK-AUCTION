/**
 * Unified Header Component
 * Matches index.html design with proper auth and notification integration
 */

class HeaderManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://app-c0af435a-abc2-4026-951e-e39dfcfe27c9.cleverapps.io/api';
    this.categories = [];
    this.init();
  }

  init() {
    this.renderHeader();
    this.bindHeaderEvents();
    this.setupAuthListener();
    this.loadCategories();
  }

  setupAuthListener() {
    const checkAuthAndUpdate = () => {
      if (window.authManager) {
        this.updateAuthSection();
      }
    };
    
    setTimeout(checkAuthAndUpdate, 500);
    setInterval(checkAuthAndUpdate, 5000);
  }

  updateAuthSection() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    
    if (!authButtons || !userMenu || !mobileAuthSection) return;
    
    if (window.authManager && window.authManager.currentUser) {
      const user = window.authManager.currentUser;
      
      // Hide auth buttons, show user menu
      authButtons.classList.add('hidden');
      userMenu.classList.remove('hidden');
      userMenu.classList.add('flex');
      
      // Update user display
      const userInitials = document.getElementById('user-initials');
      const userNameDisplay = document.getElementById('user-name-display');
      
      if (userInitials) {
        userInitials.textContent = user.firstName ? user.firstName.charAt(0) : 'U';
      }
      if (userNameDisplay) {
        userNameDisplay.textContent = user.firstName || 'User';
      }
      
      // Update mobile auth section
      mobileAuthSection.innerHTML = `
        <div class="flex flex-col space-y-3 pt-2 border-t border-gray-200">
          <div class="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              ${user.firstName ? user.firstName.charAt(0) : 'U'}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">${user.firstName || ''} ${user.lastName || ''}</p>
              <p class="text-xs text-gray-500">${user.email || ''}</p>
            </div>
          </div>
          <a href="profile.html" class="text-gray-700 hover:text-primary-600 font-medium py-2">
            <i class="fas fa-user mr-2"></i>Profile
          </a>
          <a href="dashboard.html" class="text-gray-700 hover:text-primary-600 font-medium py-2">
            <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
          </a>
          <a href="products.html?filter=my-bids" class="text-gray-700 hover:text-primary-600 font-medium py-2">
            <i class="fas fa-gavel mr-2"></i>My Bids
          </a>
          <a href="products.html?filter=watchlist" class="text-gray-700 hover:text-primary-600 font-medium py-2">
            <i class="fas fa-heart mr-2"></i>Favorites
          </a>
          <a href="#" class="text-gray-700 hover:text-primary-600 font-medium py-2">
            <i class="fas fa-cog mr-2"></i>Settings
          </a>
          <button id="mobile-logout-btn" class="text-left text-red-600 hover:text-red-700 font-medium py-2">
            <i class="fas fa-sign-out-alt mr-2"></i>Logout
          </button>
        </div>
      `;
      
      // Trigger notification system initialization only if needed
      setTimeout(() => {
        if (window.notificationSystem && window.notificationSystem.isConnected) {
          console.log('✅ NotificationSystem already initialized and connected');
        } else if (window.notificationSystem && !window.notificationSystem.isConnected) {
          console.log('🔄 NotificationSystem exists but not connected, reconnecting...');
          window.notificationSystem.connectWebSocket();
        } else if (window.initNotifications) {
          console.log('🚀 Initializing NotificationSystem from header');
          window.initNotifications();
        }
      }, 100);
      
    } else {
      // Show auth buttons, hide user menu
      authButtons.classList.remove('hidden');
      authButtons.classList.add('flex');
      userMenu.classList.add('hidden');
      userMenu.classList.remove('flex');
      
      // Update mobile auth section
      mobileAuthSection.innerHTML = `
        <div class="flex space-x-4 pt-2 border-t border-gray-200">
          <a href="login.html" class="text-gray-700 hover:text-primary-600 font-medium">Login</a>
          <a href="register.html" class="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition duration-300">Register</a>
        </div>
      `;
    }
    
    this.bindUserMenuEvents();
  }

  bindUserMenuEvents() {
    // User dropdown toggle
    const userDropdown = document.querySelector('#user-menu .relative.group');
    if (userDropdown) {
      const button = userDropdown.querySelector('button');
      const menu = userDropdown.querySelector('.absolute');
      
      if (button && menu) {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.classList.toggle('opacity-0');
          menu.classList.toggle('invisible');
        });
        
        document.addEventListener('click', (e) => {
          if (!userDropdown.contains(e.target)) {
            menu.classList.add('opacity-0');
            menu.classList.add('invisible');
          }
        });
      }
    }

    // Logout handlers
    const logoutBtns = document.querySelectorAll('#logout-btn, #mobile-logout-btn');
    logoutBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.authManager) {
            window.authManager.handleLogout();
          }
        });
      }
    });
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.baseURL}/categories`);
      if (response.ok) {
        const data = await response.json();
        const categories = data.data.categories || data.data || [];
        this.categories = categories;
        this.populateProductsDropdown(categories);
        console.log('✅ Header categories loaded:', categories.length);
      } else {
        console.warn('Failed to load categories from API, using defaults');
        this.useDefaultCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.useDefaultCategories();
    }
  }

  populateProductsDropdown(categories) {
    const dropdownMenu = document.querySelector('.dropdown-menu .py-1');
    if (!dropdownMenu) {
      console.warn('Header dropdown menu not found');
      return;
    }

    // Clear existing categories
    dropdownMenu.innerHTML = '';

    // Add "All Products" link first
    const allProductsLink = document.createElement('a');
    allProductsLink.href = 'products.html';
    allProductsLink.className = 'block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600';
    allProductsLink.textContent = 'All Products';
    dropdownMenu.appendChild(allProductsLink);

    // Add separator
    const separator = document.createElement('div');
    separator.className = 'border-t border-gray-100 my-1';
    dropdownMenu.appendChild(separator);

    // Add dynamic categories
    categories.forEach(category => {
      const link = document.createElement('a');
      link.href = `products.html?category=${encodeURIComponent(category.slug || category.name.toLowerCase().replace(/\s+/g, '-'))}`;
      link.className = 'block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600';
      link.textContent = category.name;
      dropdownMenu.appendChild(link);
    });
  }

  // Static method that can be called from any page to update header categories
  static async updateHeaderCategories() {
    const baseURL = '/api';
    try {
      const response = await fetch(`${baseURL}/categories`);
      if (response.ok) {
        const data = await response.json();
        const categories = data.data.categories || data.data || [];
        HeaderManager.populateStaticDropdown(categories);
        console.log('✅ Static header categories updated:', categories.length);
      } else {
        console.warn('Failed to load categories from API, using defaults');
        HeaderManager.useStaticDefaultCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      HeaderManager.useStaticDefaultCategories();
    }
  }

  static populateStaticDropdown(categories) {
    const dropdownMenu = document.querySelector('.dropdown-menu .py-1');
    if (!dropdownMenu) return;

    // Clear existing categories
    dropdownMenu.innerHTML = '';

    // Add "All Products" link first
    const allProductsLink = document.createElement('a');
    allProductsLink.href = 'products.html';
    allProductsLink.className = 'block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600';
    allProductsLink.textContent = 'All Products';
    dropdownMenu.appendChild(allProductsLink);

    // Add separator
    const separator = document.createElement('div');
    separator.className = 'border-t border-gray-100 my-1';
    dropdownMenu.appendChild(separator);

    // Add dynamic categories
    categories.forEach(category => {
      const link = document.createElement('a');
      link.href = `products.html?category=${encodeURIComponent(category.slug || category.name.toLowerCase().replace(/\s+/g, '-'))}`;
      link.className = 'block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600';
      link.textContent = category.name;
      dropdownMenu.appendChild(link);
    });
  }

  static useStaticDefaultCategories() {
    // These match the backend categories exactly
    const defaultCategories = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Computers', slug: 'computers' },
      { name: 'Phones & Tablets', slug: 'phones-tablets' },
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Books', slug: 'books' },
      { name: 'Vehicles', slug: 'vehicles' },
      { name: 'Antiques', slug: 'antiques' },
      { name: 'Art', slug: 'art' },
      { name: 'Jewelry', slug: 'jewelry' },
      { name: 'Collectibles', slug: 'collectibles' },
      { name: 'Other', slug: 'other' }
    ];

    HeaderManager.populateStaticDropdown(defaultCategories);
    console.log('✅ Using default categories for static header');
  }

  useDefaultCategories() {
    // These match the backend categories exactly
    const defaultCategories = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Computers', slug: 'computers' },
      { name: 'Phones & Tablets', slug: 'phones-tablets' },
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Books', slug: 'books' },
      { name: 'Vehicles', slug: 'vehicles' },
      { name: 'Antiques', slug: 'antiques' },
      { name: 'Art', slug: 'art' },
      { name: 'Jewelry', slug: 'jewelry' },
      { name: 'Collectibles', slug: 'collectibles' },
      { name: 'Other', slug: 'other' }
    ];

    this.categories = defaultCategories;
    this.populateProductsDropdown(defaultCategories);
    console.log('✅ Using default categories for header');
  }

  renderHeader() {
    const headerContainer = document.getElementById('header-container') || document.querySelector('header');
    
    if (!headerContainer) {
      // Create header container if it doesn't exist
      const headerDiv = document.createElement('div');
      headerDiv.id = 'header-container';
      document.body.insertBefore(headerDiv, document.body.firstChild);
      headerContainer = headerDiv;
    }

    const headerHTML = `
      <!-- Header -->
      <header class="bg-white shadow-md sticky top-0 z-10">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-center py-4">
            <!-- Logo -->
            <a href="index.html" class="flex items-center">
              <i class="fas fa-gavel text-primary-600 text-3xl mr-2"></i>
              <span class="text-2xl font-bold text-gray-800">
                Pak<span class="text-primary-600">Auction</span>
              </span>
            </a>

            <!-- Navigation & Search (Desktop) -->
            <div class="hidden md:flex items-center space-x-6">
              <!-- Nav Links -->
              <nav class="flex items-center space-x-6">
                <a href="index.html" class="text-gray-700 hover:text-primary-600 font-medium">Home</a>
                
                <!-- Products Dropdown -->
                <div class="dropdown relative">
                  <button class="flex items-center text-gray-700 hover:text-primary-600 font-medium">
                    Products <i class="fas fa-chevron-down ml-1 text-xs"></i>
                  </button>
                  <div class="dropdown-menu absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block z-50">
                    <div class="py-1">
                      <!-- Categories will be dynamically loaded here -->
                      <div class="flex items-center justify-center py-4">
                        <i class="fas fa-spinner fa-spin text-gray-400"></i>
                        <span class="ml-2 text-sm text-gray-500">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <a href="how-it-works.html" class="text-gray-700 hover:text-primary-600 font-medium">How It Works</a>
                <a href="about.html" class="text-gray-700 hover:text-primary-600 font-medium">About</a>
                <a href="contact.html" class="text-gray-700 hover:text-primary-600 font-medium">Contact</a>
              </nav>

              <!-- Search -->
              <div class="relative group pr-4">
                <button class="p-2 focus:outline-none">
                  <i class="fas fa-search text-gray-500 group-hover:text-primary-600 transition-colors duration-300"></i>
                </button>
                <input type="text" placeholder="Search auctions..." 
                       class="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 opacity-0 group-hover:opacity-100 group-hover:w-48 focus:opacity-100 focus:w-48 transition-all duration-300 ease-out rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent px-4 py-2" />
              </div>
            </div>

            <!-- Auth Buttons -->
            <div class="hidden md:flex items-center space-x-4">
              <!-- When NOT authenticated -->
              <div id="auth-buttons" class="flex items-center space-x-4">
                <a href="login.html" class="text-gray-700 hover:text-primary-600 font-medium">Login</a>
                <a href="sell-product.html" class="sell-your-product_Navbar">
                  <span class="sell-your-product_Navbar-text-container">
                    <span class="sell-your-product_Navbar-text">Sell Product</span>
                  </span>
                </a>
              </div>

              <!-- When authenticated -->
              <div id="user-menu" class="hidden items-center space-x-4">
                <a href="sell-product.html" class="sell-your-product_Navbar">
                  <span class="sell-your-product_Navbar-text-container">
                    <span class="sell-your-product_Navbar-text">Sell Product</span>
                  </span>
                </a>
                
                <!-- User Dropdown -->
                <div class="relative group">
                  <button class="flex items-center space-x-2 text-gray-700 hover:text-primary-600 font-medium">
                    <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      <span id="user-initials">U</span>
                    </div>
                    <span id="user-name-display">User</span>
                    <i class="fas fa-chevron-down text-xs"></i>
                  </button>
                  
                  <!-- Dropdown Menu -->
                  <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div class="py-1">
                      <a href="profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                        <i class="fas fa-user mr-2"></i>Profile
                      </a>
                      <a href="dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                        <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                      </a>
                      <a href="products.html?filter=my-bids" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                        <i class="fas fa-gavel mr-2"></i>My Bids
                      </a>
                      <a href="products.html?filter=watchlist" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                        <i class="fas fa-heart mr-2"></i>Favorites
                      </a>
                      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">
                        <i class="fas fa-cog mr-2"></i>Settings
                      </a>
                      <hr class="my-1">
                      <button id="logout-btn" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Menu Button -->
            <button id="mobile-menu-button" class="md:hidden text-gray-700 focus:outline-none">
              <i class="fas fa-bars text-2xl"></i>
            </button>
          </div>

          <!-- Mobile Search -->
          <div class="md:hidden pb-4">
            <form class="relative">
              <input type="text" placeholder="Search for auctions..." 
                     class="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <button type="submit" class="absolute right-0 top-0 mt-2 mr-4 text-gray-500 hover:text-primary-600">
                <i class="fas fa-search"></i>
              </button>
            </form>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div class="md:hidden fixed inset-y-0 left-0 w-64 bg-white transform -translate-x-full transition-transform duration-300 ease-in-out z-40 pt-16" id="mobile-menu">
          <div class="container mx-auto px-4 py-2">
            <nav class="flex flex-col space-y-3 py-3">
              <a href="index.html" class="text-gray-700 hover:text-primary-600 font-medium py-2">Home</a>
              
              <div class="relative">
                <button class="flex justify-between w-full text-gray-700 hover:text-primary-600 font-medium mobile-dropdown-button py-2">
                  Products <i class="fas fa-chevron-down text-xs"></i>
                </button>
                <div class="hidden bg-gray-50 rounded-md mt-1 py-2 mobile-dropdown-menu">
                  <a href="products.html?category=computers" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Computers</a>
                  <a href="products.html?category=antiques" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Antiques</a>
                  <a href="products.html?category=dvd" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">DVD</a>
                  <a href="products.html?category=retro-games" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Retro Games</a>
                  <a href="products.html?category=phones" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Phones</a>
                  <a href="products.html?category=art" class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600">Art</a>
                </div>
              </div>
              
              <a href="how-it-works.html" class="text-gray-700 hover:text-primary-600 font-medium py-2">How It Works</a>
              <a href="about.html" class="text-gray-700 hover:text-primary-600 font-medium py-2">About</a>
              <a href="contact.html" class="text-gray-700 hover:text-primary-600 font-medium py-2">Contact</a>
            </nav>

            <!-- Mobile Auth Section -->
            <div id="mobile-auth-section">
              <div class="flex space-x-4 pt-2 border-t border-gray-200">
                <a href="login.html" class="text-gray-700 hover:text-primary-600 font-medium">Login</a>
                <a href="register.html" class="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition duration-300">Register</a>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;

    headerContainer.innerHTML = headerHTML;
  }

  bindHeaderEvents() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('-translate-x-full');
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.add('-translate-x-full');
        }
      });
    }

    // Mobile dropdown toggles
    const mobileDropdownButtons = document.querySelectorAll('.mobile-dropdown-button');
    mobileDropdownButtons.forEach(button => {
      button.addEventListener('click', () => {
        const menu = button.nextElementSibling;
        if (menu) {
          menu.classList.toggle('hidden');
        }
      });
    });

    // Desktop dropdown hovers
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('.dropdown-menu');
      if (menu) {
        dropdown.addEventListener('mouseenter', () => {
          menu.classList.remove('hidden');
        });
        dropdown.addEventListener('mouseleave', () => {
          menu.classList.add('hidden');
        });
      }
    });
  }
}

// Initialize header when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.headerManager = new HeaderManager();
});

// Export for use in other scripts
window.HeaderManager = HeaderManager; 