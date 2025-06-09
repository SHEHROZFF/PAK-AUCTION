/**
 * About Page Dynamic Content Manager
 * Fetches content from API and renders it dynamically
 */

class AboutManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.content = null;
    this.init();
  }

  async init() {
    console.log('🔄 Initializing About Page...');
    
    // FORCE: Skip API and use fallback content immediately
    console.log('🔧 FORCING: Using fallback content immediately...');
    this.useFallbackContent();
    
    // Still try to load from API but don't wait for it
    this.loadContent().catch(error => {
      console.log('🔧 API failed as expected, already using fallback');
    });
  }

  async loadContent() {
    try {
      console.log('📡 Fetching about content...');
      const response = await fetch(`${this.baseURL}/about/content`);
      const data = await response.json();

      if (data.success) {
        this.content = data.data;
        this.renderContent();
        console.log('✅ About content loaded successfully');
      } else {
        console.error('❌ Failed to load content:', data.message);
        this.showError('Failed to load about information');
      }
    } catch (error) {
      console.error('❌ Error loading about content:', error);
      this.showError('Network error loading about information');
    }
  }

  renderContent() {
    if (!this.content) return;

    // Update all sections
    this.updateHeroSection();
    this.updateStorySection();
    this.updateMissionSection();
    this.updateTeamSection();
    this.updateStatsSection();
    this.updateTestimonialsSection();
  }

  updateHeroSection() {
    if (!this.content.hero) return;

    const heroTitle = document.querySelector('.bg-primary-600 h1');
    const heroSubtitle = document.querySelector('.bg-primary-600 p');

    if (heroTitle && this.content.hero.title) {
      heroTitle.textContent = this.content.hero.title;
    }

    if (heroSubtitle && this.content.hero.subtitle) {
      heroSubtitle.textContent = this.content.hero.subtitle;
    }
  }

  updateStorySection() {
    if (!this.content.story) return;

    // Update title - find the first section's h2 (Our Story section)
    const storySection = document.querySelector('section:nth-of-type(2)'); // Our Story is the 2nd section
    const storyTitle = storySection ? storySection.querySelector('h2') : null;
    if (storyTitle && this.content.story.title) {
      storyTitle.textContent = this.content.story.title;
    }

    // Update content paragraphs
    if (this.content.story.content && this.content.story.content.length > 0) {
      const storyContainer = storySection ? storySection.querySelector('.grid .lg\\:grid-cols-2 > div:first-child') : null;
      if (storyContainer) {
        const paragraphs = storyContainer.querySelectorAll('p.text-gray-600');
        
        // Clear existing paragraphs
        paragraphs.forEach(p => p.remove());

        // Add new paragraphs
        this.content.story.content.forEach(item => {
          const p = document.createElement('p');
          p.className = 'text-gray-600 mb-4';
          p.textContent = item.paragraph;
          storyContainer.insertBefore(p, storyContainer.lastElementChild);
        });
      }
    }

    // Update image
    if (this.content.story.image && this.content.story.image.url) {
      const storyImage = storySection ? storySection.querySelector('.relative img') : null;
      if (storyImage) {
        storyImage.src = this.content.story.image.url;
        if (this.content.story.image.alt) {
          storyImage.alt = this.content.story.image.alt;
        }
      }
    }
  }

  updateMissionSection() {
    if (!this.content.mission) return;

    const missionSection = document.querySelector('.bg-gray-100');
    
    // Update title
    const missionTitle = missionSection ? missionSection.querySelector('h2') : null;
    if (missionTitle && this.content.mission.title) {
      missionTitle.textContent = this.content.mission.title;
    }

    // Update subtitle
    const missionSubtitle = missionSection ? missionSection.querySelector('p.text-xl') : null;
    if (missionSubtitle && this.content.mission.subtitle) {
      missionSubtitle.textContent = this.content.mission.subtitle;
    }

    // Update values
    if (this.content.mission.values && this.content.mission.values.length > 0) {
      const valuesContainer = missionSection ? missionSection.querySelector('.grid.grid-cols-1.md\\:grid-cols-3') : null;
      if (valuesContainer) {
        valuesContainer.innerHTML = '';

        this.content.mission.values.forEach(value => {
          const valueEl = document.createElement('div');
          valueEl.className = 'bg-white p-6 rounded-lg shadow-md';
          valueEl.innerHTML = `
            <div class="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="${value.icon} text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">${value.title}</h3>
            <p class="text-gray-600">${value.description}</p>
          `;
          valuesContainer.appendChild(valueEl);
        });
      }
    }
  }

  updateTeamSection() {
    if (!this.content.team) return;

    // Find team section by looking for the section with "Meet Our Team" h2
    const allSections = document.querySelectorAll('section');
    let teamSection = null;
    
    allSections.forEach(section => {
      const h2 = section.querySelector('h2');
      if (h2 && h2.textContent.includes('Meet Our Team')) {
        teamSection = section;
      }
    });
    
    if (!teamSection) return;
    
    // Update title
    const teamTitle = teamSection.querySelector('h2');
    if (teamTitle && this.content.team.title) {
      teamTitle.textContent = this.content.team.title;
    }

    // Update team members
    if (this.content.team.members && this.content.team.members.length > 0) {
      const teamContainer = teamSection.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      if (teamContainer) {
        teamContainer.innerHTML = '';

        this.content.team.members.forEach(member => {
          const memberEl = document.createElement('div');
          memberEl.className = 'bg-white rounded-lg shadow-md overflow-hidden';
          
          const socialLinks = member.socialLinks || [];
          const socialHTML = socialLinks.map(link => {
            let iconClass = 'fas fa-envelope';
            if (link.platform === 'linkedin') iconClass = 'fab fa-linkedin-in';
            if (link.platform === 'twitter') iconClass = 'fab fa-twitter';
            if (link.platform === 'email') iconClass = 'fas fa-envelope';

            return `<a href="${link.url}" class="text-gray-400 hover:text-blue-600 transition duration-300"><i class="${iconClass}"></i></a>`;
          }).join('');

          memberEl.innerHTML = `
            <img src="${member.image}" alt="${member.name}" class="w-full h-64 object-cover" />
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-800 mb-1">${member.name}</h3>
              <p class="text-primary-600 mb-4">${member.position}</p>
              <p class="text-gray-600 mb-4">${member.bio}</p>
              <div class="flex space-x-3">
                ${socialHTML}
              </div>
            </div>
          `;
          teamContainer.appendChild(memberEl);
        });
      }
    }
  }

  updateStatsSection() {
    if (!this.content.stats) return;

    // Find stats section by the bg-primary-600 class
    const statsSection = document.querySelector('.bg-primary-600.text-white');
    
    if (!statsSection) return;
    
    // Update title
    const statsTitle = statsSection.querySelector('h2');
    if (statsTitle && this.content.stats.title) {
      statsTitle.textContent = this.content.stats.title;
    }

    // Update stats
    if (this.content.stats.items && this.content.stats.items.length > 0) {
      const statsContainer = statsSection.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      if (statsContainer) {
        statsContainer.innerHTML = '';

        this.content.stats.items.forEach(stat => {
          const statEl = document.createElement('div');
          statEl.className = 'text-center';
          statEl.innerHTML = `
            <div class="text-5xl font-bold mb-2">${stat.number}</div>
            <p class="text-xl opacity-90">${stat.label}</p>
          `;
          statsContainer.appendChild(statEl);
        });
      }
    }
  }

  updateTestimonialsSection() {
    if (!this.content.testimonials) return;

    // Find testimonials section by looking for "What Our Users Say" h2
    const allSections = document.querySelectorAll('section');
    let testimonialsSection = null;
    
    allSections.forEach(section => {
      const h2 = section.querySelector('h2');
      if (h2 && h2.textContent.includes('What Our Users Say')) {
        testimonialsSection = section;
      }
    });
    
    if (!testimonialsSection) return;
    
    // Update title
    const testimonialsTitle = testimonialsSection.querySelector('h2');
    if (testimonialsTitle && this.content.testimonials.title) {
      testimonialsTitle.textContent = this.content.testimonials.title;
    }

    // Update testimonials
    if (this.content.testimonials.items && this.content.testimonials.items.length > 0) {
      const testimonialsContainer = testimonialsSection.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
      if (testimonialsContainer) {
        testimonialsContainer.innerHTML = '';

        this.content.testimonials.items.forEach(testimonial => {
          const stars = this.generateStars(testimonial.rating);
          
          const testimonialEl = document.createElement('div');
          testimonialEl.className = 'bg-white p-8 rounded-lg shadow-md';
          testimonialEl.innerHTML = `
            <div class="flex items-center mb-4">
              <div class="text-yellow-400 flex">
                ${stars}
              </div>
            </div>
            <p class="text-gray-600 mb-6">${testimonial.content}</p>
            <div class="flex items-center">
              <img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-12 h-12 rounded-full mr-4" />
              <div>
                <h4 class="font-semibold text-gray-800">${testimonial.name}</h4>
                <p class="text-gray-500 text-sm">${testimonial.position}</p>
              </div>
            </div>
          `;
          testimonialsContainer.appendChild(testimonialEl);
        });
      }
    }
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }

    return stars;
  }

  showError(message) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.about-notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'about-notification fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-md bg-red-100 border border-red-400 text-red-700';
    notification.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-center">
          <i class="fas fa-exclamation-circle mr-2"></i>
          <div>${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg font-bold">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize about manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!window.aboutManager) {
    window.aboutManager = new AboutManager();
  }
}); 