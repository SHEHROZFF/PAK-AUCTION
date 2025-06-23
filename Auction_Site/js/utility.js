/**
 * Utility functions for the Auction Site
 */

class UtilityManager {
  constructor() {
    // this.baseURL = 'http://localhost:5000/api';
    this.baseURL = 'https://pak-auc-back.com.phpnode.net/api';
    this.settings = {
      currency: 'PKR' // Default currency
    };
    this.init();
  }

  async init() {
    try {
      await this.loadSettings();
    } catch (error) {
      console.error('Error initializing utility manager:', error);
    }
  }

  async loadSettings() {
    try {
      const response = await fetch(`${this.baseURL}/settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Extract currency from settings
          this.settings.currency = data.data.paymentSettings?.general?.currency || 'PKR';
          console.log('✅ Settings loaded, currency:', this.settings.currency);
        }
      } else {
        console.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  formatCurrency(amount) {
    if (amount === undefined || amount === null) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.settings.currency || 'PKR'
    }).format(amount);
  }

  getCurrencySymbol() {
    switch (this.settings.currency) {
      case 'USD':
        return '$';
      case 'PKR':
        return 'Rs.';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return 'Rs.'; // Default to PKR
    }
  }
}

// Initialize the utility manager
const utilityManager = new UtilityManager();

// Export for global use
window.utilityManager = utilityManager; 