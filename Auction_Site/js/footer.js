/**
 * Dynamic Footer Component for PakAuction
 * Eliminates code duplication across HTML files
 */

class FooterManager {
  constructor() {
    this.init();
  }

  // Initialize footer
  init() {
    this.createFooter();
  }

  // Create and insert footer HTML
  createFooter() {
    const footerHTML = `
      <!-- Footer -->
      <footer class="bg-gray-800 text-white pt-16 pb-8">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <!-- Company Info -->
            <div>
              <div class="flex items-center space-x-2 mb-6">
                <i class="fas fa-gavel text-primary-400 text-3xl"></i>
                <span class="text-2xl font-bold">
                  Pak<span class="text-primary-400">Auction</span>
                </span>
              </div>
              <p class="text-gray-400 mb-6">
                The premier online auction platform for unique and valuable items.
              </p>
              <div class="flex space-x-4">
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition duration-300"
                  aria-label="Facebook"
                >
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition duration-300"
                  aria-label="Twitter"
                >
                  <i class="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition duration-300"
                  aria-label="Instagram"
                >
                  <i class="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition duration-300"
                  aria-label="LinkedIn"
                >
                  <i class="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div>
              <h3 class="text-lg font-semibold mb-6">Quick Links</h3>
              <ul class="space-y-3">
                <li>
                  <a
                    href="index.html"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Home</a>
                </li>
                <li>
                  <a
                    href="products.html"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Auctions</a>
                </li>
                <li>
                  <a
                    href="how-it-works.html"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >How It Works</a>
                </li>
                <li>
                  <a
                    href="about.html"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >About Us</a>
                </li>
                <li>
                  <a
                    href="contact.html"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Contact</a>
                </li>
              </ul>
            </div>

            <!-- Categories -->
            <div>
              <h3 class="text-lg font-semibold mb-6">Categories</h3>
              <ul class="space-y-3">
                <li>
                  <a
                    href="products.html?category=computers"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Computers</a>
                </li>
                <li>
                  <a
                    href="products.html?category=antiques"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Antiques</a>
                </li>
                <li>
                  <a
                    href="products.html?category=retro-games"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Retro Games</a>
                </li>
                <li>
                  <a
                    href="products.html?category=phones"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Phones</a>
                </li>
                <li>
                  <a
                    href="products.html?category=art"
                    class="text-gray-400 hover:text-white transition duration-300"
                  >Art</a>
                </li>
              </ul>
            </div>

            <!-- Contact -->
            <div>
              <h3 class="text-lg font-semibold mb-6">Contact Us</h3>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <i class="fas fa-map-marker-alt mt-1 mr-3 text-gray-400"></i>
                  <span class="text-gray-400">
                    123 Auction St, New York, NY 10001
                  </span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-phone-alt mr-3 text-gray-400"></i>
                  <span class="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-envelope mr-3 text-gray-400"></i>
                  <span class="text-gray-400">info@PakistanAuction.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <p class="text-gray-400 mb-4 md:mb-0">
                &copy; ${new Date().getFullYear()} PakAuction. All rights reserved.
              </p>
              <div class="flex space-x-6">
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition duration-300"
                >Privacy Policy</a>
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition duration-300"
                >Terms of Service</a>
                <a
                  href="#"
                  class="text-gray-400 hover:text-white transition duration-300"
                >Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;

    // Find existing footer or create placeholder
    let existingFooter = document.querySelector('footer');
    
    if (existingFooter) {
      // Replace existing footer
      existingFooter.outerHTML = footerHTML;
    } else {
      // Append to body if no footer exists
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    console.log('✅ Footer component loaded successfully');
  }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (!window.footerManager) {
    window.footerManager = new FooterManager();
  }
});

// Export for manual initialization if needed
window.FooterManager = FooterManager; 