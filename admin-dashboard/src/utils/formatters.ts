import { useAppSelector } from '../store/hooks';

/**
 * Format a number as currency based on the admin settings
 * @param amount - The amount to format
 * @param fallbackCurrency - Optional fallback currency code if settings are not available
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined, fallbackCurrency = 'PKR'): string => {
  if (amount === undefined) return '-';
  
  // Get settings from the store - this won't work in non-component contexts
  // For those cases, use the fallback or pass the currency explicitly
  let currency = fallbackCurrency;
  
  try {
    // Try to get the currency from localStorage as a fallback
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      currency = settings?.paymentSettings?.general?.currency || fallbackCurrency;
    }
  } catch (e) {
    console.error('Error getting currency from localStorage:', e);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * React hook to format currency based on admin settings
 */
export const useCurrencyFormatter = () => {
  const settings = useAppSelector((state) => state.settings);
  const currency = settings?.paymentSettings?.general?.currency || 'PKR';
  
  return (amount: number | undefined): string => {
    if (amount === undefined) return '-';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
};

/**
 * Get currency symbol based on currency code
 * @param currencyCode - The currency code
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currencyCode: string = 'PKR'): string => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'PKR':
      return 'Rs.';
    default:
      return currencyCode;
  }
}; 