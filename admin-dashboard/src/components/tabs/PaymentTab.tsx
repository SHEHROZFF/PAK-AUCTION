'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSettings,
  updatePaymentSettings,
  clearError
} from '@/store/slices/settingsSlice';

export function PaymentTab() {
  const dispatch = useAppDispatch();
  const { paymentSettings, isLoading, error } = useAppSelector((state) => state.settings);

  const [formData, setFormData] = useState({
    stripe: {
      enabled: false,
      apiKey: '',
      publishableKey: '',
      webhookSecret: ''
    },
    general: {
      currency: 'USD',
      paymentMode: 'test',
      auctionDepositPercent: 10,
      invoicePrefix: 'INV-',
      enableReceiptEmails: true,
      requireVerificationHighValue: true
    }
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (paymentSettings) {
      setFormData(paymentSettings);
    }
  }, [paymentSettings]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updatePaymentSettings(formData)).unwrap();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save payment settings:', error);
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Gateway Settings</h2>
        <p className="text-gray-600">Configure your payment gateway options</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-800 bg-red-50 hover:bg-red-100 font-medium rounded-lg text-xs px-3 py-1.5"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-check-circle text-green-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Payment settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Payment Providers */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Provider</h3>

          {/* Stripe */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                  alt="Stripe"
                  className="h-8 mr-3"
                />
                <div>
                  <h4 className="font-medium text-gray-800">Stripe</h4>
                  <p className="text-sm text-gray-500">Accept credit cards, Apple Pay, Google Pay</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.stripe.enabled}
                  onChange={(e) => handleInputChange('stripe', 'enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>
            
            {formData.stripe.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                  <input
                    type="password"
                    value={formData.stripe.apiKey}
                    onChange={(e) => handleInputChange('stripe', 'apiKey', e.target.value)}
                    placeholder="sk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for server-side API calls</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                  <input
                    type="text"
                    value={formData.stripe.publishableKey}
                    onChange={(e) => handleInputChange('stripe', 'publishableKey', e.target.value)}
                    placeholder="pk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for client-side payment forms</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                  <input
                    type="password"
                    value={formData.stripe.webhookSecret}
                    onChange={(e) => handleInputChange('stripe', 'webhookSecret', e.target.value)}
                    placeholder="whsec_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used to verify webhook signatures</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* General Payment Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">General Payment Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select 
                value={formData.general.currency}
                onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select 
                value={formData.general.paymentMode}
                onChange={(e) => handleInputChange('general', 'paymentMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="live">Live</option>
                <option value="test">Test</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auction Deposit (%)</label>
              <input
                type="number"
                value={formData.general.auctionDepositPercent}
                onChange={(e) => handleInputChange('general', 'auctionDepositPercent', parseInt(e.target.value))}
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Percentage of bid amount required as deposit</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={formData.general.invoicePrefix}
                onChange={(e) => handleInputChange('general', 'invoicePrefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                  checked={formData.general.enableReceiptEmails}
                  onChange={(e) => handleInputChange('general', 'enableReceiptEmails', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Enable payment receipt emails</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                  checked={formData.general.requireVerificationHighValue}
                  onChange={(e) => handleInputChange('general', 'requireVerificationHighValue', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Require payment verification for high-value auctions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg transition-all inline-flex items-center"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 