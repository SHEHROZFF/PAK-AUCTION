import { store } from '../store';

/**
 * Format a number as currency using the selected currency from settings
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined): string => {
  // Get the currency from the store
  const state = store.getState();
  const currency = state.settings?.currency || 'PKR';
  
  // Handle undefined amount
  const numAmount = amount !== undefined ? amount : 0;
  
  // Get the currency symbol
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'CA$',
    'AUD': 'A$',
    'PKR': 'Rs.'
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Format the number with thousand separators
  const formattedAmount = numAmount.toLocaleString();
  
  // Return the formatted currency
  return `${symbol} ${formattedAmount}`;
};

/**
 * Get the currency symbol for the selected currency
 * @returns The currency symbol
 */
export const getCurrencySymbol = (): string => {
  // Get the currency from the store
  const state = store.getState();
  const currency = state.settings?.currency || 'PKR';
  
  // Get the currency symbol
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': 'CA$',
    'AUD': 'A$',
    'PKR': 'Rs.'
  };

  return currencySymbols[currency] || currency;
}; 