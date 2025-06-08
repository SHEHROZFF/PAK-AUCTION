'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface ContactContent {
  _id?: string;
  title: string;
  subtitle: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phones: Array<{ number: string; label: string; }>;
  emails: Array<{ email: string; label: string; }>;
  workingHours: Array<{ day: string; hours: string; }>;
  socialMedia: Array<{ platform: string; url: string; icon: string; }>;
  faq: Array<{ question: string; answer: string; order: number; }>;
  mapEmbedUrl: string;
}

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminNotes: string;
  createdAt: string;
  respondedAt?: string;
  respondedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ContactManagementPage() {
  const [contactContent, setContactContent] = useState<ContactContent>({
    title: 'Contact Us',
    subtitle: "We're here to help. Reach out to us with any questions or concerns.",
    address: {
      street: '123 Auction St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    phones: [{ number: '', label: '' }],
    emails: [{ email: '', label: '' }],
    workingHours: [{ day: '', hours: '' }],
    socialMedia: [{ platform: '', url: '', icon: '' }],
    faq: [],
    mapEmbedUrl: ''
  });

  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadContactContent();
    loadSubmissions();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadContactContent = async () => {
    try {
      const data = await apiService.getContactContent();
      
      if (data.success) {
        setContactContent(data.data);
      }
    } catch (error) {
      console.error('Error loading contact content:', error);
      showNotification('error', 'Failed to load contact content: ' + (error as Error).message);
    }
  };

  const loadSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const data = await apiService.getContactSubmissions();
      
      if (data.success) {
        setSubmissions(data.data.submissions);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      showNotification('error', 'Failed to load contact submissions: ' + (error as Error).message);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const saveContactContent = async () => {
    try {
      setLoading(true);
      const data = await apiService.updateContactContent(contactContent);

      if (data.success) {
        showNotification('success', 'Contact content updated successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving contact content:', error);
      showNotification('error', 'Failed to save contact content: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const data = await apiService.updateContactSubmissionStatus(id, status, adminNotes);

      if (data.success) {
        loadSubmissions(); // Reload submissions
        showNotification('success', 'Submission updated successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      showNotification('error', 'Failed to update submission: ' + (error as Error).message);
    }
  };

  const addArrayItem = (field: keyof ContactContent, defaultItem: any) => {
    setContactContent(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), defaultItem]
    }));
  };

  const removeArrayItem = (field: keyof ContactContent, index: number) => {
    setContactContent(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof ContactContent, index: number, updatedItem: any) => {
    setContactContent(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => i === index ? updatedItem : item)
    }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg z-50 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex justify-between items-center">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 font-bold">×</button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contact Management</h1>
        <p className="text-gray-600">Manage contact page content and submissions</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Page Content
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              FAQ Management
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submissions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contact Submissions
            </button>
          </nav>
        </div>
      </div>

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Header Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={contactContent.title}
                  onChange={(e) => setContactContent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={contactContent.subtitle}
                  onChange={(e) => setContactContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-map-marker-alt mr-2"></i>
              Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  value={contactContent.address.street}
                  onChange={(e) => setContactContent(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={contactContent.address.city}
                  onChange={(e) => setContactContent(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={contactContent.address.state}
                  onChange={(e) => setContactContent(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  value={contactContent.address.zipCode}
                  onChange={(e) => setContactContent(prev => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={contactContent.address.country}
                onChange={(e) => setContactContent(prev => ({
                  ...prev,
                  address: { ...prev.address, country: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-phone mr-2"></i>
              Phone Numbers
            </h3>
            <div className="space-y-4">
              {contactContent.phones.map((phone, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone.number}
                      onChange={(e) => updateArrayItem('phones', index, { ...phone, number: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={phone.label}
                      onChange={(e) => updateArrayItem('phones', index, { ...phone, label: e.target.value })}
                      placeholder="Main Office"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => removeArrayItem('phones', index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('phones', { number: '', label: '' })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Phone
              </button>
            </div>
          </div>

          {/* Email Addresses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-envelope mr-2"></i>
              Email Addresses
            </h3>
            <div className="space-y-4">
              {contactContent.emails.map((email, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email.email}
                      onChange={(e) => updateArrayItem('emails', index, { ...email, email: e.target.value })}
                      placeholder="contact@company.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      value={email.label}
                      onChange={(e) => updateArrayItem('emails', index, { ...email, label: e.target.value })}
                      placeholder="General Inquiries"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => removeArrayItem('emails', index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('emails', { email: '', label: '' })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Email
              </button>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-clock mr-2"></i>
              Working Hours
            </h3>
            <div className="space-y-4">
              {contactContent.workingHours.map((hours, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <input
                      type="text"
                      value={hours.day}
                      onChange={(e) => updateArrayItem('workingHours', index, { ...hours, day: e.target.value })}
                      placeholder="Monday - Friday"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                    <input
                      type="text"
                      value={hours.hours}
                      onChange={(e) => updateArrayItem('workingHours', index, { ...hours, hours: e.target.value })}
                      placeholder="9:00 AM - 6:00 PM"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => removeArrayItem('workingHours', index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('workingHours', { day: '', hours: '' })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Working Hours
              </button>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-share-alt mr-2"></i>
              Social Media
            </h3>
            <div className="space-y-4">
              {contactContent.socialMedia.map((social, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-md font-medium">Social Media {index + 1}</h4>
                    <button
                      onClick={() => removeArrayItem('socialMedia', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                      <input
                        type="text"
                        value={social.platform}
                        onChange={(e) => updateArrayItem('socialMedia', index, { ...social, platform: e.target.value })}
                        placeholder="Facebook"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={social.url}
                        onChange={(e) => updateArrayItem('socialMedia', index, { ...social, url: e.target.value })}
                        placeholder="https://facebook.com/company"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon Class</label>
                      <input
                        type="text"
                        value={social.icon}
                        onChange={(e) => updateArrayItem('socialMedia', index, { ...social, icon: e.target.value })}
                        placeholder="fab fa-facebook-f"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('socialMedia', { platform: '', url: '', icon: '' })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Social Media
              </button>
            </div>
          </div>

          {/* Map Embed URL */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-map mr-2"></i>
              Map Embed URL
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
              <textarea
                value={contactContent.mapEmbedUrl}
                onChange={(e) => setContactContent(prev => ({ ...prev, mapEmbedUrl: e.target.value }))}
                placeholder="Paste Google Maps embed URL here..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={saveContactContent} 
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* FAQ Management Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-question-circle mr-2"></i>
              FAQ Management
            </h3>
            <div className="space-y-4">
              {contactContent.faq.map((faqItem, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-md font-medium">FAQ {index + 1}</h4>
                    <button
                      onClick={() => removeArrayItem('faq', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <input
                        type="text"
                        value={faqItem.question}
                        onChange={(e) => updateArrayItem('faq', index, { ...faqItem, question: e.target.value })}
                        placeholder="Enter the frequently asked question..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <textarea
                        value={faqItem.answer}
                        onChange={(e) => updateArrayItem('faq', index, { ...faqItem, answer: e.target.value })}
                        placeholder="Enter the answer to this question..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                      <input
                        type="number"
                        value={faqItem.order}
                        onChange={(e) => updateArrayItem('faq', index, { ...faqItem, order: parseInt(e.target.value) || 0 })}
                        placeholder="Display order (0 = first)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('faq', { question: '', answer: '', order: contactContent.faq.length })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add FAQ Item
              </button>
            </div>
          </div>

          {/* Save Button for FAQ */}
          <div className="flex justify-end">
            <button 
              onClick={saveContactContent} 
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save FAQ Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-envelope mr-2"></i>
              Contact Submissions
            </h3>
            {submissionsLoading ? (
              <div className="text-center py-8">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No submissions found</div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{submission.subject}</h4>
                        <p className="text-sm text-gray-600">
                          From: {submission.name} ({submission.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm">{submission.message}</p>
                    </div>

                    {submission.adminNotes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium">Admin Notes:</p>
                        <p className="text-sm">{submission.adminNotes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <select
                        value={submission.status}
                        onChange={(e) => updateSubmissionStatus(submission._id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 