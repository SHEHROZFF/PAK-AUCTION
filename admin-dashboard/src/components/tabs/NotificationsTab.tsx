import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { sendNotificationToUsers } from '../../store/slices/notificationsSlice';

interface NotificationForm {
  title: string;
  message: string;
  type: 'GENERAL' | 'SYSTEM' | 'ANNOUNCEMENT';
  targetUsers: 'all' | 'specific';
  userIds: string[];
}

const NotificationsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'GENERAL',
    targetUsers: 'all',
    userIds: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [specificUserEmails, setSpecificUserEmails] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const notificationData = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        targetUsers: form.targetUsers,
        userEmails: form.targetUsers === 'specific' ? 
          specificUserEmails.split(',').map(email => email.trim()).filter(Boolean) : 
          undefined
      };

      await dispatch(sendNotificationToUsers(notificationData)).unwrap();
      
      // Reset form
      setForm({
        title: '',
        message: '',
        type: 'GENERAL',
        targetUsers: 'all',
        userIds: []
      });
      setSpecificUserEmails('');
      
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NotificationForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Quick notification templates
  const quickTemplates = [
    {
      title: 'System Maintenance',
      message: 'The system will be under maintenance from 2:00 AM to 4:00 AM. Please plan accordingly.',
      type: 'SYSTEM' as const
    },
    {
      title: 'New Features Available',
      message: 'We\'ve added exciting new features to improve your auction experience!',
      type: 'ANNOUNCEMENT' as const
    },
    {
      title: 'Welcome to PakAuction',
      message: 'Thank you for joining our auction platform. Start bidding on amazing items today!',
      type: 'GENERAL' as const
    }
  ];

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    setForm(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Notifications</h2>
        <p className="text-gray-600">
          Send notifications to users for testing the notification system or important announcements.
        </p>
      </div>

      {/* Quick Templates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickTemplates.map((template, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
              onClick={() => applyTemplate(template)}
            >
              <h4 className="font-medium text-gray-900 mb-2">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{template.message}</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                template.type === 'SYSTEM' ? 'bg-red-100 text-red-800' :
                template.type === 'ANNOUNCEMENT' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {template.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title *
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter notification title"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={form.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter notification message"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Notification Type
            </label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="GENERAL">General</option>
              <option value="SYSTEM">System</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          {/* Target Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send To
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetUsers"
                  value="all"
                  checked={form.targetUsers === 'all'}
                  onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                  className="mr-2"
                />
                All Users
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="targetUsers"
                  value="specific"
                  checked={form.targetUsers === 'specific'}
                  onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                  className="mr-2"
                />
                Specific Users (by email)
              </label>
            </div>
          </div>

          {/* Specific User Emails */}
          {form.targetUsers === 'specific' && (
            <div>
              <label htmlFor="userEmails" className="block text-sm font-medium text-gray-700 mb-2">
                User Emails (comma-separated)
              </label>
              <textarea
                id="userEmails"
                value={specificUserEmails}
                onChange={(e) => setSpecificUserEmails(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="user1@example.com, user2@example.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter email addresses separated by commas
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">
                    {form.title || 'Notification Title'}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {form.message || 'Notification message will appear here'}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      form.type === 'SYSTEM' ? 'bg-red-100 text-red-800' :
                      form.type === 'ANNOUNCEMENT' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {form.type}
                    </span>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !form.title.trim() || !form.message.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Notification'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Testing Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Instructions</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Web Testing:</strong> Send a notification and check if it appears in the notification bell on the website</p>
          <p>• <strong>Mobile Testing:</strong> Send a notification and check if you receive a push notification on your mobile device</p>
          <p>• <strong>Real-time Testing:</strong> Keep the website open and send a notification to see real-time updates via WebSocket</p>
          <p>• <strong>Badge Testing:</strong> Check if the notification badge count updates correctly</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab; 