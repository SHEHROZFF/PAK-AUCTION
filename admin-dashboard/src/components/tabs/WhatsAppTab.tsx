'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface WhatsAppStatus {
  configured: boolean;
  enabled: boolean;
  phoneNumberId: string | null;
  adminPhones: number;
  lastCheck: string;
  endpoints: {
    webhook: string;
    status: string;
    test: string;
  };
}

interface WhatsAppSettings {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
  businessAccountId: string;
  webhookSecret: string;
  adminPhoneNumbers: string[];
  notifications: {
    productSubmissions: boolean;
    statusUpdates: boolean;
    bidNotifications: boolean;
    auctionEndNotifications: boolean;
  };
}

interface TestMessageForm {
  phoneNumber: string;
  message: string;
}

export function WhatsAppTab() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [testForm, setTestForm] = useState<TestMessageForm>({
    phoneNumber: '',
    message: 'Test message from Pak Auction admin panel'
  });
  const [testLoading, setTestLoading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [setupGuide, setSetupGuide] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newAdminPhone, setNewAdminPhone] = useState('');

  useEffect(() => {
    fetchWhatsAppData();
  }, []);

  const fetchWhatsAppData = async () => {
    setLoading(true);
    try {
      const [statusResponse, settingsResponse] = await Promise.all([
        apiService.getWhatsAppStatus(),
        apiService.getWhatsAppSettings()
      ]);
      
      setStatus(statusResponse.data);
      
      console.log('Received WhatsApp settings from backend:', settingsResponse.data);
      
      // Ensure settings has all required fields with defaults
      const settingsData = settingsResponse.data || {};
      const processedSettings = {
        enabled: settingsData.enabled || false,
        phoneNumberId: settingsData.phoneNumberId || '',
        accessToken: settingsData.accessToken || '',
        verifyToken: settingsData.verifyToken || '',
        businessAccountId: settingsData.businessAccountId || '',
        webhookSecret: settingsData.webhookSecret || '',
        adminPhoneNumbers: settingsData.adminPhoneNumbers || [],
        notifications: {
          productSubmissions: settingsData.notifications?.productSubmissions !== undefined ? settingsData.notifications.productSubmissions : true,
          statusUpdates: settingsData.notifications?.statusUpdates !== undefined ? settingsData.notifications.statusUpdates : true,
          bidNotifications: settingsData.notifications?.bidNotifications !== undefined ? settingsData.notifications.bidNotifications : false,
          auctionEndNotifications: settingsData.notifications?.auctionEndNotifications !== undefined ? settingsData.notifications.auctionEndNotifications : false,
        }
      };
      
      console.log('Processed settings for frontend:', processedSettings);
      console.log('Admin phone numbers received:', processedSettings.adminPhoneNumbers);
      
      setSettings(processedSettings);
    } catch (error) {
      console.error('Failed to fetch WhatsApp data:', error);
      // Initialize with default settings on error
      setSettings({
        enabled: false,
        phoneNumberId: '',
        accessToken: '',
        verifyToken: '',
        businessAccountId: '',
        webhookSecret: '',
        adminPhoneNumbers: [],
        notifications: {
          productSubmissions: true,
          statusUpdates: true,
          bidNotifications: false,
          auctionEndNotifications: false,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    console.log('Updating WhatsApp settings:', settings);
    console.log('Admin phone numbers being saved:', settings.adminPhoneNumbers);

    setSettingsLoading(true);
    try {
      const response = await apiService.updateWhatsAppSettings(settings);
      
      if (response.success) {
        alert('WhatsApp settings updated successfully!');
        await fetchWhatsAppData(); // Refresh data
      } else {
        alert(`Failed to update settings: ${response.message}`);
      }
    } catch (error: any) {
      alert(`Error updating settings: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const testConfiguration = async () => {
    setTestLoading(true);
    try {
      const response = await apiService.testWhatsAppConfig();
      
      if (response.success) {
        alert('Configuration test completed! Check the status for results.');
        await fetchWhatsAppData();
      } else {
        alert(`Configuration test failed: ${response.message}`);
      }
    } catch (error: any) {
      alert(`Error testing configuration: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testForm.phoneNumber || !testForm.message) {
      alert('Please fill in both phone number and message');
      return;
    }

    setTestLoading(true);
    try {
      const response = await apiService.sendWhatsAppTest(testForm.phoneNumber, testForm.message);
      
      if (response.success) {
        alert('Test message sent successfully!');
        setTestForm({ ...testForm, phoneNumber: '' });
      } else {
        alert(`Failed to send test message: ${response.message}`);
      }
    } catch (error: any) {
      alert(`Error sending test message: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const addAdminPhone = () => {
    if (!newAdminPhone.trim()) {
      alert('Please enter a phone number');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(newAdminPhone.trim())) {
      alert('Please enter a valid phone number (10-15 digits only)');
      return;
    }

    if (settings && !settings.adminPhoneNumbers.includes(newAdminPhone.trim())) {
      const updatedSettings = {
        ...settings,
        adminPhoneNumbers: [...settings.adminPhoneNumbers, newAdminPhone.trim()]
      };
      setSettings(updatedSettings);
      setNewAdminPhone('');
      console.log('Added admin phone:', newAdminPhone.trim(), 'Total phones:', updatedSettings.adminPhoneNumbers);
    } else {
      alert('This phone number is already added');
    }
  };

  const removeAdminPhone = (phoneToRemove: string) => {
    if (settings) {
      const updatedSettings = {
        ...settings,
        adminPhoneNumbers: settings.adminPhoneNumbers.filter(phone => phone !== phoneToRemove)
      };
      setSettings(updatedSettings);
      console.log('Removed admin phone:', phoneToRemove, 'Remaining phones:', updatedSettings.adminPhoneNumbers);
    }
  };

  const fetchSetupGuide = async () => {
    try {
      const response = await apiService.getWhatsAppSetupGuide();
      setSetupGuide(response.data);
      setShowSetupGuide(true);
    } catch (error) {
      console.error('Error fetching setup guide:', error);
      alert('Failed to load setup guide');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Integration</h2>
          <p className="text-gray-600 mt-1">
            Manage WhatsApp Business API integration for automated notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={fetchSetupGuide}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            📱 Setup Guide
          </button>
        </div>
      </div>

      {/* Configuration Settings */}
      {showSettings && settings && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">WhatsApp Configuration</h3>
            <button
              onClick={testConfiguration}
              disabled={testLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {testLoading ? 'Testing...' : '🧪 Test Config'}
            </button>
          </div>

          <form onSubmit={handleSettingsUpdate} className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-gray-900">
                Enable WhatsApp Integration
              </label>
            </div>

            {/* API Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={settings.phoneNumberId}
                  onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="123456789012345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  value={settings.accessToken}
                  onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your WhatsApp access token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verify Token
                </label>
                <input
                  type="text"
                  value={settings.verifyToken}
                  onChange={(e) => setSettings({ ...settings, verifyToken: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your custom verify token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Account ID
                </label>
                <input
                  type="text"
                  value={settings.businessAccountId}
                  onChange={(e) => setSettings({ ...settings, businessAccountId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="123456789012345"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <input
                type="password"
                value={settings.webhookSecret}
                onChange={(e) => setSettings({ ...settings, webhookSecret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your webhook secret"
              />
            </div>

            {/* Admin Phone Numbers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Admin Phone Numbers
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (settings && !settings.adminPhoneNumbers.includes('923001234567')) {
                      setSettings({
                        ...settings,
                        adminPhoneNumbers: [...settings.adminPhoneNumbers, '923001234567']
                      });
                    }
                  }}
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                >
                  + Add Test Number
                </button>
              </div>
              <div className="space-y-2">
                {settings.adminPhoneNumbers.map((phone, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...settings.adminPhoneNumbers];
                        newPhones[index] = e.target.value;
                        setSettings({ ...settings, adminPhoneNumbers: newPhones });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="923001234567"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdminPhone(phone)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Add new admin phone (923001234567)"
                  />
                  <button
                    type="button"
                    onClick={addAdminPhone}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
                  >
                    ➕
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Phone numbers in international format without + (e.g., 923001234567)
              </p>
            </div>

            {/* Notification Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notification Types
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="productSubmissions"
                    checked={settings.notifications.productSubmissions}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, productSubmissions: e.target.checked }
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="productSubmissions" className="ml-2 text-sm text-gray-900">
                    Product Submissions
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="statusUpdates"
                    checked={settings.notifications.statusUpdates}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, statusUpdates: e.target.checked }
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="statusUpdates" className="ml-2 text-sm text-gray-900">
                    Status Updates to Sellers
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bidNotifications"
                    checked={settings.notifications.bidNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, bidNotifications: e.target.checked }
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="bidNotifications" className="ml-2 text-sm text-gray-900">
                    Bid Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auctionEndNotifications"
                    checked={settings.notifications.auctionEndNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, auctionEndNotifications: e.target.checked }
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auctionEndNotifications" className="ml-2 text-sm text-gray-900">
                    Auction End Notifications
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={settingsLoading}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {settingsLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
          <button
            onClick={fetchWhatsAppData}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${status.enabled ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Service</p>
                  <p className="text-sm text-gray-600">
                    {status.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${status.configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Configuration</p>
                  <p className="text-sm text-gray-600">
                    {status.configured ? 'Configured' : 'Not Configured'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-purple-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin Phones</p>
                  <p className="text-sm text-gray-600">
                    {status.adminPhones} configured
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-yellow-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Check</p>
                  <p className="text-sm text-gray-600">
                    {new Date(status.lastCheck).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Failed to load WhatsApp status
          </div>
        )}
      </div>

      {/* Test Message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Test Message</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (International format without +)
            </label>
            <input
              type="text"
              placeholder="923001234567"
              value={testForm.phoneNumber}
              onChange={(e) => setTestForm({ ...testForm, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: 923001234567 for Pakistan, 15551234567 for US
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              rows={3}
              value={testForm.message}
              onChange={(e) => setTestForm({ ...testForm, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your test message..."
            />
          </div>

          <button
            onClick={sendTestMessage}
            disabled={testLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {testLoading ? 'Sending...' : '📤 Send Test Message'}
          </button>
        </div>
      </div>

      {/* Setup Guide Modal */}
      {showSetupGuide && setupGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{setupGuide.title}</h3>
              <button
                onClick={() => setShowSetupGuide(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {setupGuide.steps.map((step: any, index: number) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-semibold text-gray-900">
                    Step {step.step}: {step.title}
                  </h4>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                  
                  {step.variables && (
                    <div className="mt-2 bg-gray-100 rounded p-3">
                      <code className="text-sm">
                        {step.variables.map((variable: string, i: number) => (
                          <div key={i}>{variable}</div>
                        ))}
                      </code>
                    </div>
                  )}
                  
                  {step.webhookUrl && (
                    <div className="mt-2 bg-blue-50 rounded p-3">
                      <p className="text-sm font-medium text-blue-900">Webhook URL:</p>
                      <code className="text-sm text-blue-700">{step.webhookUrl}</code>
                    </div>
                  )}
                </div>
              ))}
              
              {setupGuide.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {setupGuide.notes.map((note: string, index: number) => (
                      <li key={index}>• {note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 