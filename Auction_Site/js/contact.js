/**
 * Contact Page Dynamic Content Manager
 * Fetches content from API and handles form submissions
 */

class ContactManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';  
    this.baseURL = 'https://app-c0af435a-abc2-4026-951e-e39dfcfe27c9.cleverapps.io/api';
    this.content = null;
    this.init();
  }

  async init() {
    console.log('🔄 Initializing Contact Page...');
    await this.loadContent();
    this.bindEventListeners();
  }

  async loadContent() {
    try {
      console.log('📡 Fetching contact content...');
      const response = await fetch(`${this.baseURL}/contact/content`);
      const data = await response.json();

      if (data.success) {
        this.content = data.data;
        this.renderContent();
        console.log('✅ Contact content loaded successfully');
      } else {
        console.error('❌ Failed to load content:', data.message);
        this.showError('Failed to load contact information');
      }
    } catch (error) {
      console.error('❌ Error loading contact content:', error);
      this.showError('Network error loading contact information');
    }
  }

  renderContent() {
    if (!this.content) return;

    // Update page header
    this.updatePageHeader();
    
    // Update contact information
    this.updateContactInfo();
    
    // Update FAQ if exists
    this.updateFAQ();
  }

  updatePageHeader() {
    const headerTitle = document.querySelector('.bg-gradient-to-r h1, .bg-primary-600 h1');
    const headerSubtitle = document.querySelector('.bg-gradient-to-r p, .bg-primary-600 p');

    if (headerTitle && this.content.title) {
      headerTitle.textContent = this.content.title;
    }

    if (headerSubtitle && this.content.subtitle) {
      headerSubtitle.textContent = this.content.subtitle;
    }
  }

  updateContactInfo() {
    // Update address
    this.updateAddress();
    
    // Update phone numbers
    this.updatePhones();
    
    // Update emails
    this.updateEmails();
    
    // Update working hours
    this.updateWorkingHours();
    
    // Update social media
    this.updateSocialMedia();
    
    // Update map
    this.updateMap();
  }

  updateAddress() {
    const addressElement = document.querySelector('.fas.fa-map-marker-alt').parentElement.nextElementSibling;
    if (addressElement && this.content.address) {
      const { street, city, state, zipCode, country } = this.content.address;
      addressElement.innerHTML = `${street}, ${city}, ${state} ${zipCode}, ${country}`;
    }
  }

  updatePhones() {
    const phoneContainer = document.querySelector('.fas.fa-phone-alt').parentElement.parentElement;
    if (phoneContainer && this.content.phones && this.content.phones.length > 0) {
      const phoneContent = phoneContainer.querySelector('div:last-child');
      phoneContent.innerHTML = '';

      this.content.phones.forEach(phone => {
        const phoneEl = document.createElement('p');
        phoneEl.className = 'text-gray-600';
        phoneEl.innerHTML = `${phone.number} ${phone.label ? `(${phone.label})` : ''}`;
        phoneContent.appendChild(phoneEl);
      });
    }
  }

  updateEmails() {
    const emailContainer = document.querySelector('.fas.fa-envelope').parentElement.parentElement;
    if (emailContainer && this.content.emails && this.content.emails.length > 0) {
      const emailContent = emailContainer.querySelector('div:last-child');
      emailContent.innerHTML = '';

      this.content.emails.forEach(email => {
        const emailEl = document.createElement('p');
        emailEl.className = 'text-gray-600';
        emailEl.innerHTML = `<a href="mailto:${email.email}" class="hover:text-primary-600">${email.email}</a> ${email.label ? `(${email.label})` : ''}`;
        emailContent.appendChild(emailEl);
      });
    }
  }

  updateWorkingHours() {
    const hoursContainer = document.querySelector('.fas.fa-clock').parentElement.parentElement;
    if (hoursContainer && this.content.workingHours && this.content.workingHours.length > 0) {
      const hoursContent = hoursContainer.querySelector('div:last-child');
      hoursContent.innerHTML = '';

      this.content.workingHours.forEach(hours => {
        const hoursEl = document.createElement('p');
        hoursEl.className = 'text-gray-600';
        hoursEl.textContent = `${hours.day}: ${hours.hours}`;
        hoursContent.appendChild(hoursEl);
      });
    }
  }

  updateSocialMedia() {
    // Update footer social media
    const footerSocial = document.querySelector('footer .flex.space-x-4');
    if (footerSocial && this.content.socialMedia && this.content.socialMedia.length > 0) {
      footerSocial.innerHTML = '';

      this.content.socialMedia.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        link.className = 'text-gray-400 hover:text-white transition duration-300';
        link.innerHTML = `<i class="${social.icon}"></i>`;
        footerSocial.appendChild(link);
      });
    }

    // Update contact page social media
    const contactSocial = document.querySelector('.bg-white .flex.space-x-4');
    if (contactSocial && this.content.socialMedia && this.content.socialMedia.length > 0) {
      contactSocial.innerHTML = '';

      this.content.socialMedia.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        
        // Set color based on platform
        let colorClass = 'bg-gray-600 hover:bg-gray-700';
        if (social.platform.toLowerCase().includes('facebook')) {
          colorClass = 'bg-blue-600 hover:bg-blue-700';
        } else if (social.platform.toLowerCase().includes('twitter')) {
          colorClass = 'bg-blue-400 hover:bg-blue-500';
        } else if (social.platform.toLowerCase().includes('instagram')) {
          colorClass = 'bg-pink-600 hover:bg-pink-700';
        } else if (social.platform.toLowerCase().includes('linkedin')) {
          colorClass = 'bg-blue-700 hover:bg-blue-800';
        }

        link.className = `${colorClass} text-white w-10 h-10 rounded-full flex items-center justify-center transition duration-300`;
        link.innerHTML = `<i class="${social.icon}"></i>`;
        contactSocial.appendChild(link);
      });
    }
  }

  updateMap() {
    if (this.content.mapEmbedUrl) {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = this.content.mapEmbedUrl;
      }
    }
  }

  updateFAQ() {
    if (!this.content.faq || this.content.faq.length === 0) return;

    // Find FAQ container by looking for the section with FAQ title
    const faqSection = document.querySelector('section h2');
    let faqContainer = null;
    
    if (faqSection && faqSection.textContent.includes('Frequently Asked Questions')) {
      faqContainer = faqSection.parentElement.querySelector('.max-w-3xl.space-y-6');
    }
    
    if (!faqContainer) {
      // Fallback selector
      faqContainer = document.querySelector('.max-w-3xl.mx-auto.space-y-6');
    }
    
    if (!faqContainer) return;

    // Clear existing FAQ items
    faqContainer.innerHTML = '';

    // Sort FAQ by order field
    const sortedFAQ = this.content.faq.sort((a, b) => (a.order || 0) - (b.order || 0));

    sortedFAQ.forEach((faqItem, index) => {
      const faqElement = document.createElement('div');
      faqElement.className = 'bg-white rounded-lg shadow-md overflow-hidden';
      faqElement.innerHTML = `
        <button class="w-full text-left px-6 py-4 focus:outline-none faq-toggle">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800">
              ${faqItem.question}
            </h3>
            <i class="fas fa-chevron-down text-gray-500 transition-transform transform"></i>
          </div>
        </button>
        <div class="px-6 pb-4 hidden faq-content">
          <p class="text-gray-600">
            ${faqItem.answer}
          </p>
        </div>
      `;
      faqContainer.appendChild(faqElement);
    });

    // Re-bind FAQ toggle events with a small delay to ensure DOM is updated
    setTimeout(() => {
      this.bindFAQToggles();
    }, 100);
  }

  bindEventListeners() {
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleFormSubmission(e));
    }

    // FAQ toggles - bind initially for static content
    this.bindFAQToggles();
  }

  bindFAQToggles() {
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
      // Remove existing listeners to prevent duplicates
      toggle.removeEventListener('click', this.handleFAQToggle);
      // Add new listener
      toggle.addEventListener('click', this.handleFAQToggle);
    });
  }

  handleFAQToggle = (e) => {
    const toggle = e.currentTarget;
    const content = toggle.nextElementSibling;
    const icon = toggle.querySelector('i.fa-chevron-down');
    
    if (content && content.classList.contains('faq-content')) {
      content.classList.toggle('hidden');
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    }
  }

  async handleFormSubmission(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
      const response = await fetch(`${this.baseURL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccess(result.message);
        form.reset();
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map(err => err.msg).join('\n');
          this.showError(errorMessages);
        } else {
          this.showError(result.message || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      this.showError('Network error. Please try again.');
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.contact-notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `contact-notification fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-md`;
    
    if (type === 'success') {
      notification.className += ' bg-green-100 border border-green-400 text-green-700';
      notification.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <div>${message}</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg font-bold">&times;</button>
        </div>
      `;
    } else {
      notification.className += ' bg-red-100 border border-red-400 text-red-700';
      notification.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <div style="white-space: pre-line">${message}</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg font-bold">&times;</button>
        </div>
      `;
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize contact manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!window.contactManager) {
    window.contactManager = new ContactManager();
  }
}); 