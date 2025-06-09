/**
 * Homepage Dynamic Content Manager
 * Loads all homepage sections from API and renders them dynamically
 */

class HomepageManager {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    // this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.content = null;
    this.init();
  }

  async init() {
    console.log('🏠 Initializing Homepage Dynamic Content...');
    await this.loadContent();
  }

  async loadContent() {
    try {
      console.log('📡 Fetching homepage content...');
      const response = await fetch(`${this.baseURL}/homepage/content`);
      
      if (response.ok) {
        const data = await response.json();
        this.content = data.data;
        console.log('📦 Homepage content loaded:', this.content);
        this.renderAllSections();
      } else {
        console.log('⚠️ API not available, using static content');
      }
    } catch (error) {
      console.log('⚠️ Network error, using static content:', error.message);
    }
  }

  renderAllSections() {
    console.log('🎨 Rendering all homepage sections...');
    
    this.updateHeroSection();
    this.updateExploreStoreSection();
    this.updateSellToUsSection();
    this.updateHowItWorksSection();
    this.updateTestimonialsSection();
    this.updateNewsletterSection();
    
    console.log('✨ All homepage sections rendered successfully!');
  }

  updateHeroSection() {
    if (!this.content.hero) return;

    console.log('🎯 Updating Hero Section...');
    
    // Fix selectors to match EXACT DOM structure in index.html
    const heroTitle = document.querySelector('section.hero-pattern h1');
    const heroSubtitle = document.querySelector('section.hero-pattern p.text-xl');
    const primaryBtnSpan = document.querySelector('section.hero-pattern a[href="products.html"] span');
    const secondaryBtn = document.querySelector('section.hero-pattern a[href="register.html"]');
    const statsSpan = document.querySelector('section.hero-pattern .flex.items-center.space-x-4 > span');
    const bgImage = document.querySelector('section.hero-pattern .floating img');

    console.log('📍 Found elements:', {
      heroTitle: !!heroTitle,
      heroSubtitle: !!heroSubtitle,
      primaryBtnSpan: !!primaryBtnSpan,
      secondaryBtn: !!secondaryBtn,
      statsSpan: !!statsSpan,
      bgImage: !!bgImage
    });

    if (heroTitle) {
      // Handle the nested span structure properly
      const title = this.content.hero.title;
      if (title.includes('Unbeatable Prices')) {
        const parts = title.split('Unbeatable Prices');
        heroTitle.innerHTML = `${parts[0]}<span class="text-primary-200">Unbeatable Prices</span>${parts[1] || ''}`;
      } else {
        // If custom title doesn't have "Unbeatable Prices", put last part in span
        const words = title.split(' ');
        if (words.length > 2) {
          const lastTwo = words.slice(-2).join(' ');
          const firstPart = words.slice(0, -2).join(' ');
          heroTitle.innerHTML = `${firstPart} <span class="text-primary-200">${lastTwo}</span>`;
        } else {
          heroTitle.innerHTML = `<span class="text-primary-200">${title}</span>`;
        }
      }
      console.log('✅ Hero title updated:', heroTitle.innerHTML);
    } else {
      console.log('❌ Hero title element not found');
    }
    
    if (heroSubtitle) {
      heroSubtitle.textContent = this.content.hero.subtitle;
      console.log('✅ Hero subtitle updated:', heroSubtitle.textContent.substring(0, 50) + '...');
    } else {
      console.log('❌ Hero subtitle element not found');
    }
    
    if (primaryBtnSpan) {
      primaryBtnSpan.textContent = this.content.hero.primaryButtonText;
      console.log('✅ Primary button updated:', primaryBtnSpan.textContent);
    } else {
      console.log('❌ Primary button span not found');
    }
    
    if (secondaryBtn) {
      secondaryBtn.textContent = this.content.hero.secondaryButtonText;
      console.log('✅ Secondary button updated:', secondaryBtn.textContent);
    } else {
      console.log('❌ Secondary button not found');
    }
    
    if (statsSpan) {
      statsSpan.textContent = this.content.hero.statsText;
      console.log('✅ Stats text updated:', statsSpan.textContent);
    } else {
      console.log('❌ Stats span not found');
    }
    
    // Handle featured auction or background image
    if (this.content.hero.featuredAuctionId) {
      console.log('🎯 Featured auction ID found, loading auction data...');
      this.loadFeaturedAuction();
    } else {
      console.log('🖼️ No featured auction, using background image...');
    if (bgImage) {
      bgImage.src = this.content.hero.backgroundImage;
      bgImage.alt = "Dynamic Hero Image";
      console.log('✅ Background image updated:', bgImage.src);
    } else {
      console.log('❌ Background image not found');
      }
    }
  }

  async loadFeaturedAuction() {
    try {
      console.log('📡 Fetching featured auction data...');
      const response = await fetch(`${this.baseURL}/homepage/featured-auction`);
      
      console.log('📊 Featured auction response status:', response.status);
      console.log('📊 Featured auction response URL:', response.url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Featured auction response data:', data);
        
        if (data.success && data.data) {
          console.log('🎯 Featured auction loaded:', data.data);
          console.log('📸 Images found:', data.data.images);
          this.renderFeaturedAuction(data.data);
          
          // Start countdown timer
          this.startCountdownTimer(data.data);
        } else {
          console.log('⚠️ No featured auction data, using background image');
          this.useFallbackImage();
        }
      } else {
        console.error('❌ Featured auction API failed with status:', response.status);
        console.log('⚠️ Failed to fetch featured auction, using background image');
        this.useFallbackImage();
      }
    } catch (error) {
      console.error('❌ Error loading featured auction:', error.message);
      console.error('❌ Full error:', error);
      console.log('⚠️ Network error, using background image');
      this.useFallbackImage();
    }
  }

  renderFeaturedAuction(auction) {
    const bgImage = document.querySelector('section.hero-pattern .floating img');
    const auctionCard = document.querySelector('section.hero-pattern .absolute.bottom-6');
    
    console.log('🎯 Rendering featured auction:', auction);
    console.log('📍 Found elements for auction render:', {
      bgImage: !!bgImage,
      auctionCard: !!auctionCard
    });
    
    // Update the background image
    if (bgImage) {
      if (auction.images && auction.images.length > 0) {
        // Use the primary image or first image from auction
        const primaryImage = auction.images.find(img => img.isPrimary) || auction.images[0];
        console.log('📸 Using image:', primaryImage.url);
        
        // Create a new image to test if it loads
        const testImage = new Image();
        testImage.onload = () => {
          console.log('✅ Image loaded successfully:', primaryImage.url);
          bgImage.src = primaryImage.url;
          bgImage.alt = auction.title;
        };
        testImage.onerror = () => {
          console.error('❌ Image failed to load:', primaryImage.url);
          console.log('🔄 Falling back to background image');
          bgImage.src = this.content.hero.backgroundImage || 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg';
          bgImage.alt = auction.title;
        };
        testImage.src = primaryImage.url;
        
        console.log('✅ Featured auction image updated:', primaryImage.url);
      } else {
        // Fallback to default background image if no auction images
        console.log('⚠️ No auction images found, using fallback image');
        bgImage.src = this.content.hero.backgroundImage || 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg';
        bgImage.alt = auction.title;
      }
    }
    
    // Update the auction card with real data
    if (auctionCard) {
      const titleElement = auctionCard.querySelector('h3');
      const bidElement = auctionCard.querySelector('p');
      const timerElement = auctionCard.querySelector('.bg-primary-600');
      
      console.log('📍 Found auction card elements:', {
        titleElement: !!titleElement,
        bidElement: !!bidElement,
        timerElement: !!timerElement
      });
      
      if (titleElement) {
        titleElement.textContent = auction.title;
        titleElement.className = 'text-primary-700 font-bold';
        console.log('✅ Auction title updated:', auction.title);
      }
      
      if (bidElement) {
        const formattedBid = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(auction.currentBid);
        bidElement.textContent = `Current bid: ${formattedBid}`;
        bidElement.className = 'text-gray-600';
        console.log('✅ Current bid updated:', formattedBid);
      }
      
      if (timerElement) {
        timerElement.textContent = auction.timeRemaining;
        timerElement.setAttribute('data-end-time', auction.endTime);
        timerElement.className = auction.isActive ? 'bg-primary-600 text-white px-3 py-1 rounded-full text-sm' : 'bg-red-600 text-white px-3 py-1 rounded-full text-sm';
        console.log('✅ Timer updated:', auction.timeRemaining);
      }
      
      // Make the entire auction card clickable
      auctionCard.style.cursor = 'pointer';
      auctionCard.style.transition = 'transform 0.2s ease';
      
      // Add hover effect
      auctionCard.onmouseenter = () => {
        auctionCard.style.transform = 'scale(1.02)';
      };
      auctionCard.onmouseleave = () => {
        auctionCard.style.transform = 'scale(1)';
      };
      
      // Add click handler to view auction details
      auctionCard.onclick = () => {
        console.log('🔗 Navigating to auction details:', auction.id);
        // Check if auction details page exists, otherwise go to products page
        window.location.href = `products.html?auction=${auction.id}`;
      };
      
      // Add a subtle indicator that it's clickable
      const clickIndicator = auctionCard.querySelector('.click-indicator');
      if (!clickIndicator) {
        const indicator = document.createElement('div');
        indicator.className = 'click-indicator absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-2';
        indicator.innerHTML = '<i class="fas fa-external-link-alt text-white text-xs"></i>';
        auctionCard.appendChild(indicator);
      }
      
      console.log('✅ Featured auction card fully configured');
    } else {
      console.log('❌ Auction card element not found - check HTML structure');
    }
  }

  startCountdownTimer(auction) {
    const timerElement = document.querySelector('section.hero-pattern .bg-primary-600');
    if (!timerElement || !auction.isActive) return;
    
    const endTime = new Date(auction.endTime).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const timeLeft = endTime - now;
      
      if (timeLeft <= 0) {
        timerElement.textContent = 'ENDED';
        timerElement.classList.remove('bg-primary-600');
        timerElement.classList.add('bg-red-600');
        return;
      }
      
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Update immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    // Store interval ID to clear it later if needed
    timerElement.setAttribute('data-interval-id', interval);
    
    console.log('⏰ Countdown timer started for featured auction');
  }

  useFallbackImage() {
    const bgImage = document.querySelector('section.hero-pattern .floating img');
    if (bgImage && this.content.hero.backgroundImage) {
      bgImage.src = this.content.hero.backgroundImage;
      bgImage.alt = "Dynamic Hero Image";
      console.log('✅ Fallback background image used:', bgImage.src);
    }
  }

  updateExploreStoreSection() {
    if (!this.content.exploreStore) return;

    console.log('🏪 Updating Explore Store Section...');
    
    // Fix selectors to match EXACT DOM structure in index.html
    const section = document.querySelector('section.py-24.bg-white[data-aos="fade-up"]');
    if (!section) {
      console.log('❌ Explore Store section not found');
      return;
    }

    const title = section.querySelector('h2');
    const subtitle = section.querySelector('p.mt-4');
    
    console.log('📍 Found Explore Store elements:', {
      section: !!section,
      title: !!title,
      subtitle: !!subtitle
    });
    
    if (title) {
      title.textContent = this.content.exploreStore.title;
      console.log('✅ Explore Store title updated:', title.textContent);
    } else {
      console.log('❌ Explore Store title not found');
    }
    
    if (subtitle) {
      subtitle.textContent = this.content.exploreStore.subtitle;
      console.log('✅ Explore Store subtitle updated:', subtitle.textContent);
    } else {
      console.log('❌ Explore Store subtitle not found');
    }

    // Update category cards
    const cardsContainer = section.querySelector('.grid.gap-10');
    console.log('📍 Cards container found:', !!cardsContainer);
    
    if (cardsContainer && this.content.exploreStore.categories?.length > 0) {
      console.log('🔄 Updating', this.content.exploreStore.categories.length, 'categories...');
      
      cardsContainer.innerHTML = this.content.exploreStore.categories.map((category, index) => `
        <div class="group relative rounded-xl border border-gray-200 overflow-hidden shadow-sm transition hover:shadow-xl" data-aos="fade-up" data-aos-delay="${index * 100}">
          <img src="${category.image}" alt="${category.title}" class="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div class="p-6 bg-white">
            <h3 class="text-xl font-semibold text-gray-800">${category.title}</h3>
            <p class="text-gray-500 text-sm mt-1 mb-4">${category.itemCount}</p>
            <p class="text-gray-600 mb-4">${category.description}</p>
            <a href="${category.link}" class="inline-flex items-center text-primary-600 font-medium hover:underline">
              Browse Collection →
            </a>
          </div>
        </div>
      `).join('');
      
      console.log('✅ Explore Store categories updated successfully');
      
      // Re-initialize AOS animations for new content
      if (window.AOS && typeof window.AOS.refresh === 'function') {
        window.AOS.refresh();
      }
    } else {
      console.log('❌ Categories container not found or no categories to display');
    }
  }

  updateSellToUsSection() {
    if (!this.content.sellToUs) return;

    console.log('💰 Updating Sell To Us Section...');
    
    // Find the Sell To Us section (usually has specific classes or content)
    const sections = document.querySelectorAll('section.py-20, section.py-24');
    let sellSection = null;
    
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      if (heading && heading.textContent.includes('Sell')) {
        sellSection = section;
      }
    });

    if (!sellSection) {
      console.log('❌ Sell To Us section not found');
      return;
    }

    const title = sellSection.querySelector('h2');
    const subtitle = sellSection.querySelector('p.text-gray-600');
    
    if (title) {
      title.textContent = this.content.sellToUs.title;
      console.log('✅ Sell To Us title updated');
    }
    
    if (subtitle) {
      subtitle.textContent = this.content.sellToUs.subtitle;
      console.log('✅ Sell To Us subtitle updated');
    }

    // Update features
    const featuresContainer = sellSection.querySelector('.space-y-6');
    if (featuresContainer && this.content.sellToUs.features?.length > 0) {
      featuresContainer.innerHTML = this.content.sellToUs.features.map(feature => `
        <div class="flex items-start">
          <div class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
            <i class="${feature.icon}"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-gray-800">${feature.title}</h3>
            <p class="text-gray-600">${feature.description}</p>
          </div>
        </div>
      `).join('');
      console.log('✅ Sell To Us features updated');
    }

    // Update buttons
    const buttons = sellSection.querySelectorAll('a');
    buttons.forEach(btn => {
      if (btn.href.includes('sell') || btn.textContent.includes('Sell')) {
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = this.content.sellToUs.primaryButtonText;
        } else {
          btn.textContent = this.content.sellToUs.primaryButtonText;
        }
        console.log('✅ Sell To Us primary button updated');
      } else if (btn.href.includes('how-it-works') || btn.textContent.includes('Learn')) {
        btn.textContent = this.content.sellToUs.secondaryButtonText;
        console.log('✅ Sell To Us secondary button updated');
      }
    });
  }

  updateHowItWorksSection() {
    if (!this.content.howItWorks) return;

    console.log('⚙️ Updating How It Works Section...');
    
    // Find How It Works section
    const sections = document.querySelectorAll('section');
    let howItWorksSection = null;
    
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      if (heading && heading.textContent.includes('How It Works')) {
        howItWorksSection = section;
      }
    });

    if (!howItWorksSection) {
      console.log('❌ How It Works section not found');
      return;
    }

    const title = howItWorksSection.querySelector('h2');
    const subtitle = howItWorksSection.querySelector('p.text-gray-600');
    
    if (title) {
      title.textContent = this.content.howItWorks.title;
      console.log('✅ How It Works title updated');
    }
    
    if (subtitle) {
      subtitle.textContent = this.content.howItWorks.subtitle;
      console.log('✅ How It Works subtitle updated');
    }

    // Update steps
    const stepsContainer = howItWorksSection.querySelector('.grid');
    if (stepsContainer && this.content.howItWorks.steps?.length > 0) {
      stepsContainer.innerHTML = this.content.howItWorks.steps.map(step => {
        const featuresHTML = step.features?.map(feature => `
          <li class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            ${feature}
          </li>
        `).join('') || '';

        return `
          <div class="relative">
            <div class="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2 h-full flex flex-col">
              <div class="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <span class="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-bold">${step.stepNumber}</span>
                <i class="${step.icon} text-2xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-center mb-4">${step.title}</h3>
              <p class="text-gray-600 text-center mb-6 flex-grow">${step.description}</p>
              <div class="bg-gray-50 p-4 rounded-lg">
                <ul class="text-sm text-gray-600 space-y-2">
                  ${featuresHTML}
                </ul>
              </div>
            </div>
          </div>
        `;
      }).join('');
      console.log('✅ How It Works steps updated');
    }
  }

  updateTestimonialsSection() {
    if (!this.content.testimonials) return;

    console.log('💬 Updating Testimonials Section...');
    
    // Find testimonials section
    const sections = document.querySelectorAll('section');
    let testimonialsSection = null;
    
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      if (heading && (heading.textContent.includes('Testimonial') || heading.textContent.includes('Review') || heading.textContent.includes('Users Say'))) {
        testimonialsSection = section;
      }
    });

    if (!testimonialsSection) {
      console.log('❌ Testimonials section not found');
      return;
    }

    const title = testimonialsSection.querySelector('h2');
    const subtitle = testimonialsSection.querySelector('p.text-gray-600');
    
    if (title) {
      title.textContent = this.content.testimonials.title;
      console.log('✅ Testimonials title updated');
    }
    
    if (subtitle) {
      subtitle.textContent = this.content.testimonials.subtitle;
      console.log('✅ Testimonials subtitle updated');
    }

    // Update testimonials
    const testimonialsContainer = testimonialsSection.querySelector('.grid');
    if (testimonialsContainer && this.content.testimonials.items?.length > 0) {
      testimonialsContainer.innerHTML = this.content.testimonials.items.map(testimonial => {
        const starsHTML = this.generateStars(testimonial.rating);
        
        return `
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2 relative">
            <div class="flex items-center mb-6">
              <div class="text-yellow-400 flex">
                ${starsHTML}
              </div>
            </div>
            <p class="text-gray-600 mb-6 leading-relaxed">${testimonial.content}</p>
            <div class="flex items-center">
              <img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-12 h-12 rounded-full object-cover mr-4">
              <div>
                <h4 class="text-gray-800 font-semibold">${testimonial.name}</h4>
                <p class="text-gray-500 text-sm">${testimonial.position}</p>
              </div>
            </div>
          </div>
        `;
      }).join('');
      console.log('✅ Testimonials updated');
    }
  }

  updateNewsletterSection() {
    if (!this.content.newsletter) return;

    console.log('📧 Updating Newsletter Section...');
    
    // Find newsletter section
    const sections = document.querySelectorAll('section');
    let newsletterSection = null;
    
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      if (heading && (heading.textContent.includes('Newsletter') || heading.textContent.includes('Subscribe') || heading.textContent.includes('Stay Updated'))) {
        newsletterSection = section;
      }
    });

    if (!newsletterSection) {
      console.log('❌ Newsletter section not found');
      return;
    }

    const title = newsletterSection.querySelector('h2');
    const subtitle = newsletterSection.querySelector('p');
    const button = newsletterSection.querySelector('button');
    
    if (title) {
      title.textContent = this.content.newsletter.title;
      console.log('✅ Newsletter title updated');
    }
    
    if (subtitle) {
      subtitle.textContent = this.content.newsletter.subtitle;
      console.log('✅ Newsletter subtitle updated');
    }
    
    if (button) {
      button.textContent = this.content.newsletter.buttonText;
      console.log('✅ Newsletter button updated');
    }
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>';
    }
    
    if (hasHalfStar) {
      stars += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
      stars += '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>';
    }

    return stars;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Don't initialize if already exists (to avoid conflicts with index.js)
  if (!window.homepageManager) {
    window.homepageManager = new HomepageManager();
  }
}); 