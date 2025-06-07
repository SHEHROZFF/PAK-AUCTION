'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSettings,
  updateWebsiteSettings,
  clearError
} from '@/store/slices/settingsSlice';

export function SettingsTab() {
  const dispatch = useAppDispatch();
  const { websiteSettings, isLoading, error } = useAppSelector((state) => state.settings);

  const [formData, setFormData] = useState({
    general: {
      websiteName: 'Premium Auctions',
      websiteUrl: 'https://premiumauctions.com',
      adminEmail: 'admin@premiumauctions.com',
      contactPhone: '+1 (555) 123-4567',
      websiteDescription: 'Premium Auctions is your trusted platform for high-quality collectibles, antiques, and unique items.'
    },
    logo: {
      logoUrl: '',
      faviconUrl: ''
    },
    auction: {
      defaultDurationDays: 7,
      minimumBidIncrementPercent: 5,
      autoExtendTimeMinutes: 10,
      featuredAuctionFee: 25,
      enableAutoExtend: true,
      allowReservePrices: true,
      enableBuyNow: true
    }
  });

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (websiteSettings) {
      setFormData(websiteSettings);
    }
  }, [websiteSettings]);

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
      await dispatch(updateWebsiteSettings(formData)).unwrap();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save website settings:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Website Settings</h2>
        <p className="text-gray-600">Configure your auction website settings</p>
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
                Website settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
              <input
                type="text"
                value={formData.general.websiteName}
                onChange={(e) => handleInputChange('general', 'websiteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.general.websiteUrl}
                onChange={(e) => handleInputChange('general', 'websiteUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={formData.general.adminEmail}
                onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.general.contactPhone}
                onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website Description</label>
            <textarea
              rows={3}
              value={formData.general.websiteDescription}
              onChange={(e) => handleInputChange('general', 'websiteDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Logo Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Logo & Branding</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="url"
                value={formData.logo.logoUrl}
                onChange={(e) => handleInputChange('logo', 'logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended size: 200x60px</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
              <input
                type="url"
                value={formData.logo.faviconUrl}
                onChange={(e) => handleInputChange('logo', 'faviconUrl', e.target.value)}
                placeholder="https://example.com/favicon.ico"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended size: 32x32px</p>
            </div>
          </div>
        </div>

        {/* Auction Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Auction Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Auction Duration (days)</label>
              <input
                type="number"
                value={formData.auction.defaultDurationDays}
                onChange={(e) => handleInputChange('auction', 'defaultDurationDays', parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Bid Increment (%)</label>
              <input
                type="number"
                value={formData.auction.minimumBidIncrementPercent}
                onChange={(e) => handleInputChange('auction', 'minimumBidIncrementPercent', parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auto-extend Time (minutes)</label>
              <input
                type="number"
                value={formData.auction.autoExtendTimeMinutes}
                onChange={(e) => handleInputChange('auction', 'autoExtendTimeMinutes', parseInt(e.target.value))}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Extend auction if bid placed within this time of ending</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Auction Fee ($)</label>
              <input
                type="number"
                value={formData.auction.featuredAuctionFee}
                onChange={(e) => handleInputChange('auction', 'featuredAuctionFee', parseInt(e.target.value))}
                min="0"
                max="1000"
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
                  checked={formData.auction.enableAutoExtend}
                  onChange={(e) => handleInputChange('auction', 'enableAutoExtend', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Enable auto-extend on auctions</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                  checked={formData.auction.allowReservePrices}
                  onChange={(e) => handleInputChange('auction', 'allowReservePrices', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Allow reserve prices</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" 
                  checked={formData.auction.enableBuyNow}
                  onChange={(e) => handleInputChange('auction', 'enableBuyNow', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Enable buy now option</span>
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