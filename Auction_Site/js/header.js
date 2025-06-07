/**
 * Shared Header Component
 * Eliminates header duplication across HTML files
 */

class HeaderManager {
  constructor() {
    this.init();
  }

  init() {
    this.renderHeader();
    this.bindHeaderEvents();
  }

  renderHeader() {
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
                <a
                  href="index.html"
                  class="text-gray-700 hover:text-primary-600 font-medium"
                  >Home</a
                >
                <!-- Products Dropdown -->
                <div class="dropdown relative">
                  <button
                    class="flex items-center text-gray-700 hover:text-primary-600 font-medium"
                  >
                    Products <i class="fas fa-chevron-down ml-1 text-xs"></i>
                  </button>
                  <div
                    class="dropdown-menu absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block z-50"
                  >
                    <div class="py-1">
                      <a
                        href="products.html?category=computers"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        >Computers</a
                      >
                      <a
                        href="products.html?category=antiques"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        >Antiques</a
                      >
                      <a
                        href="products.html?category=dvd"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        >DVD</a
                      >
                      <a
                        href="products.html?category=retro-games"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        >Retro Games</a
                      >
                      <a
                        href="products.html?category=phones"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        >Phones</a
                      >
                      <a
                        href="products.html?category=art"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        >Art</a
                      >
                    </div>
                  </div>
                </div>
                <a
                  href="how-it-works.html"
                  class="text-gray-700 hover:text-primary-600 font-medium"
                  >How It Works</a
                >
                <a
                  href="about.html"
                  class="text-gray-700 hover:text-primary-600 font-medium"
                  >About</a
                >
                <a
                  href="contact.html"
                  class="text-gray-700 hover:text-primary-600 font-medium"
                  >Contact</a
                >
              </nav>

              <!-- Search -->
              <div class="relative group pr-4">
                <button class="p-2 focus:outline-none">
                  <i
                    class="fas fa-search text-gray-500 group-hover:text-primary-600 transition-colors duration-300"
                  ></i>
                </button>
                <input
                  type="text"
                  placeholder="Search auctions..."
                  class="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 opacity-0 group-hover:opacity-100 group-hover:w-48 focus:opacity-100 focus:w-48 transition-all duration-300 ease-out rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent px-4 py-2"
                />
              </div>
            </div>

            <!-- Auth Buttons -->
            <div class="hidden md:flex items-center space-x-4">
              <a
                href="login.html"
                class="text-gray-700 hover:text-primary-600 font-medium"
                >Login</a
              >
              <a href="sell-product.html" class="sell-your-product_Navbar">
                <span class="sell-your-product_Navbar-text-container">
                  <span class="sell-your-product_Navbar-text">Sell Product</span>
                </span>
              </a>
            </div>

            <!-- Mobile Menu Button -->
            <button
              id="mobile-menu-button"
              class="md:hidden text-gray-700 focus:outline-none"
            >
              <i class="fas fa-bars text-2xl"></i>
            </button>
          </div>

          <!-- Mobile Search -->
          <div class="md:hidden pb-4">
            <form class="relative">
              <input
                type="text"
                placeholder="Search for auctions..."
                class="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                class="absolute right-0 top-0 mt-2 mr-4 text-gray-500 hover:text-primary-600"
              >
                <i class="fas fa-search"></i>
              </button>
            </form>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div
          class="md:hidden fixed inset-y-0 left-0 w-64 bg-white transform -translate-x-full transition-transform duration-300 ease-in-out z-40 pt-16"
          id="mobile-menu"
        >
          <div class="container mx-auto px-4 py-2">
            <nav class="flex flex-col space-y-3 py-3">
              <a
                href="index.html"
                class="text-gray-700 hover:text-primary-600 font-medium py-2"
                >Home</a
              >
              <div class="relative">
                <button
                  class="flex justify-between w-full text-gray-700 hover:text-primary-600 font-medium mobile-dropdown-button py-2"
                >
                  Products <i class="fas fa-chevron-down text-xs"></i>
                </button>
                <div
                  class="hidden bg-gray-50 rounded-md mt-1 py-2 mobile-dropdown-menu"
                >
                  <a
                    href="products.html?category=computers"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >Computers</a
                  >
                  <a
                    href="products.html?category=antiques"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >Antiques</a
                  >
                  <a
                    href="products.html?category=dvd"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >DVD</a
                  >
                  <a
                    href="products.html?category=retro-games"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >Retro Games</a
                  >
                  <a
                    href="products.html?category=phones"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >Phones</a
                  >
                  <a
                    href="products.html?category=art"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >Art</a
                  >
                </div>
              </div>
              <a
                href="how-it-works.html"
                class="text-gray-700 hover:text-primary-600 font-medium py-2"
                >How It Works</a
              >
              <a
                href="about.html"
                class="text-gray-700 hover:text-primary-600 font-medium py-2"
                >About</a
              >
              <a
                href="contact.html"
                class="text-gray-700 hover:text-primary-600 font-medium py-2"
                >Contact</a
              >
              <div class="flex space-x-4 pt-2">
                <a
                  href="login.html"
                  class="text-gray-700 hover:text-primary-600 font-medium"
                  >Login</a
                >
                <a
                  href="register.html"
                  class="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 transition duration-300"
                  >Register</a
                >
              </div>
            </nav>
          </div>
        </div>
      </header>
    `;

    // Insert header at the beginning of body
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      headerContainer.innerHTML = headerHTML;
    } else {
      // If no container, insert after body opening
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }
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
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
          mobileMenu.classList.add('-translate-x-full');
        }
      });
    }

    // Mobile dropdown functionality
    const mobileDropdownButtons = document.querySelectorAll('.mobile-dropdown-button');
    mobileDropdownButtons.forEach(button => {
      button.addEventListener('click', () => {
        const menu = button.nextElementSibling;
        if (menu) {
          menu.classList.toggle('hidden');
        }
      });
    });

    // Desktop dropdown functionality
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('.dropdown-menu');
      
      dropdown.addEventListener('mouseenter', () => {
        if (menu) menu.classList.remove('hidden');
      });
      
      dropdown.addEventListener('mouseleave', () => {
        if (menu) menu.classList.add('hidden');
      });
    });
  }
}

// Initialize header manager
if (!window.headerManager) {
  window.headerManager = new HeaderManager();
} 