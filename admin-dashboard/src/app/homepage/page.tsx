'use client';

import { useState, useEffect } from 'react';

interface Hero {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  statsText: string;
  backgroundImage: string;
  featuredAuctionId?: string;
}

interface Category {
  title: string;
  description: string;
  itemCount: string;
  image: string;
  link: string;
}

interface ExploreStore {
  title: string;
  subtitle: string;
  categories: Category[];
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface SellToUs {
  title: string;
  subtitle: string;
  features: Feature[];
  primaryButtonText: string;
  secondaryButtonText: string;
}

interface Step {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

interface HowItWorks {
  title: string;
  subtitle: string;
  steps: Step[];
}

interface Testimonial {
  name: string;
  position: string;
  rating: number;
  content: string;
  avatar: string;
}

interface Testimonials {
  title: string;
  subtitle: string;
  items: Testimonial[];
}

interface Newsletter {
  title: string;
  subtitle: string;
  buttonText: string;
  privacyText: string;
}

interface HomepageContent {
  hero: Hero;
  exploreStore: ExploreStore;
  sellToUs: SellToUs;
  howItWorks: HowItWorks;
  testimonials: Testimonials;
  newsletter: Newsletter;
}

export default function HomepageManagementPage() {
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [auctions, setAuctions] = useState<any[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'fas fa-home' },
    { id: 'exploreStore', label: 'Explore Store', icon: 'fas fa-store' },
    { id: 'sellToUs', label: 'Sell To Us', icon: 'fas fa-dollar-sign' },
    { id: 'howItWorks', label: 'How It Works', icon: 'fas fa-cogs' },
    { id: 'testimonials', label: 'Testimonials', icon: 'fas fa-quote-left' },
    { id: 'newsletter', label: 'Newsletter', icon: 'fas fa-envelope' }
  ];

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  const fetchHomepageContent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/homepage/content');
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      setMessage('Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctions = async () => {
    setAuctionsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/homepage/auctions-for-selection', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAuctions(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} auctions for selection`);
      } else {
        console.error('Failed to fetch auctions:', data.message);
        setMessage('Failed to load auctions: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
      // Fallback to public auctions endpoint if admin endpoint fails
      try {
        const fallbackResponse = await fetch('http://localhost:5000/api/auctions?status=ACTIVE&limit=50');
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) {
          setAuctions(fallbackData.data || []);
          console.log('✅ Loaded auctions from fallback endpoint');
        }
      } catch (fallbackError) {
        console.error('Fallback auction fetch failed:', fallbackError);
        setMessage('Failed to load auctions. Please check your connection.');
      }
    } finally {
      setAuctionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'hero') {
      fetchAuctions();
    }
  }, [activeTab]);

  const saveContent = async () => {
    if (!content) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/homepage/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Homepage content updated successfully! Check index.html now');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('Failed to update content: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section: string, field: string, value: any) => {
    if (!content) return;

    setContent(prev => ({
      ...prev!,
      [section]: {
        ...prev![section as keyof HomepageContent],
        [field]: value
      }
    }));
  };

  const updateArrayItem = (section: string, field: string, index: number, itemField: string, value: any) => {
    if (!content) return;

    setContent(prev => {
      const sectionData = prev![section as keyof HomepageContent] as any;
      const newArray = [...sectionData[field]];
      newArray[index] = {
        ...newArray[index],
        [itemField]: value
      };

      return {
        ...prev!,
        [section]: {
          ...sectionData,
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (section: string, field: string, newItem: any) => {
    if (!content) return;

    setContent(prev => {
      const sectionData = prev![section as keyof HomepageContent] as any;
      return {
        ...prev!,
        [section]: {
          ...sectionData,
          [field]: [...sectionData[field], newItem]
        }
      };
    });
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    if (!content) return;

    setContent(prev => {
      const sectionData = prev![section as keyof HomepageContent] as any;
      const newArray = sectionData[field].filter((_: any, i: number) => i !== index);
      return {
        ...prev!,
        [section]: {
          ...sectionData,
          [field]: newArray
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load homepage content</p>
        <button 
          onClick={fetchHomepageContent}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderHeroTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-blue-400"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 mb-2">
              💡 <strong>Hero Section Features:</strong>
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Title with "Unbeatable Prices" automatically highlighted</li>
              <li>🆕 <strong>Featured Auction:</strong> Select a real auction to showcase instead of static content</li>
              <li>📸 Auction image replaces background image automatically</li>
              <li>💰 Real-time current bid and countdown timer</li>
              <li>🔗 Clickable card that leads to auction details</li>
              <li>⏰ Automatic fallback to background image if auction expires</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
        <input
          type="text"
          value={content.hero.title}
          onChange={(e) => updateContent('hero', 'title', e.target.value)}
          placeholder="e.g., Discover Unique Items at Unbeatable Prices"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
        <textarea
          value={content.hero.subtitle}
          onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
          rows={3}
          placeholder="Join thousands of bidders in the most exciting online auction platform..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
          <input
            type="text"
            value={content.hero.primaryButtonText}
            onChange={(e) => updateContent('hero', 'primaryButtonText', e.target.value)}
            placeholder="Browse Auctions"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
          <input
            type="text"
            value={content.hero.secondaryButtonText}
            onChange={(e) => updateContent('hero', 'secondaryButtonText', e.target.value)}
            placeholder="Start Bidding"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stats Text</label>
        <input
          type="text"
          value={content.hero.statsText}
          onChange={(e) => updateContent('hero', 'statsText', e.target.value)}
          placeholder="Joined by 10,000+ bidders this month"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Image URL</label>
        <input
          type="url"
          value={content.hero.backgroundImage}
          onChange={(e) => updateContent('hero', 'backgroundImage', e.target.value)}
          placeholder="https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Featured Auction for Hero Section
        </label>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-lightbulb text-yellow-400"></i>
    </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>New Feature:</strong> Select a real auction to display in the hero section instead of hardcoded data. The selected auction's image, title, current bid, and countdown will be shown dynamically.
              </p>
            </div>
          </div>
        </div>
        
        {auctionsLoading ? (
          <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading auctions...</span>
          </div>
        ) : auctions.length === 0 ? (
          <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-yellow-50">
            <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
            <span className="text-yellow-700">No active auctions available. Create some auctions first!</span>
          </div>
        ) : (
          <select
            value={content.hero.featuredAuctionId || ''}
            onChange={(e) => updateContent('hero', 'featuredAuctionId', e.target.value || null)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">🚫 No featured auction (use background image only)</option>
            {auctions.map((auction) => {
              const endDate = new Date(auction.endTime);
              const isExpiringSoon = endDate.getTime() - Date.now() < 24 * 60 * 60 * 1000; // Less than 24 hours
              const formattedEndDate = endDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <option key={auction._id} value={auction._id}>
                  🎯 {auction.title} | 💰 ${auction.currentBid || auction.basePrice} | 
                  📅 Ends {formattedEndDate} | 📁 {auction.category} | 
                  {isExpiringSoon ? '⚠️ URGENT' : '✅ ACTIVE'}
                </option>
              );
            })}
          </select>
        )}
        
        {content.hero.featuredAuctionId && (
          <div className="mt-3">
            {(() => {
              const selectedAuction = auctions.find(a => a._id === content.hero.featuredAuctionId);
              if (!selectedAuction) return null;
              
              return (
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-4">
                    {selectedAuction.primaryImage && (
                      <img 
                        src={selectedAuction.primaryImage} 
                        alt={selectedAuction.title}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        ✅ <strong>Featured auction selected!</strong>
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>{selectedAuction.title}</strong> by {selectedAuction.seller}
                      </p>
                      <p className="text-sm text-gray-600">
                        Current bid: <strong>${selectedAuction.currentBid || selectedAuction.basePrice}</strong> | 
                        Category: <strong>{selectedAuction.category}</strong>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        This auction will be displayed in the hero section with real-time data.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  const renderExploreStoreTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={content.exploreStore.title}
          onChange={(e) => updateContent('exploreStore', 'title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={content.exploreStore.subtitle}
          onChange={(e) => updateContent('exploreStore', 'subtitle', e.target.value)}
          rows={2}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Categories</h3>
          <button
            onClick={() => addArrayItem('exploreStore', 'categories', {
              title: 'New Category',
              description: 'Category description',
              itemCount: '50+ items',
              image: 'https://via.placeholder.com/800x600',
              link: 'products.html?category=new'
            })}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Category
          </button>
        </div>
        
        {content.exploreStore.categories.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Category {index + 1}</h4>
              <button
                onClick={() => removeArrayItem('exploreStore', 'categories', index)}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Category Title"
                value={category.title}
                onChange={(e) => updateArrayItem('exploreStore', 'categories', index, 'title', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Item Count (e.g., 150+ items)"
                value={category.itemCount}
                onChange={(e) => updateArrayItem('exploreStore', 'categories', index, 'itemCount', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="url"
                placeholder="Image URL"
                value={category.image}
                onChange={(e) => updateArrayItem('exploreStore', 'categories', index, 'image', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Link (e.g., products.html?category=art)"
                value={category.link}
                onChange={(e) => updateArrayItem('exploreStore', 'categories', index, 'link', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <textarea
              placeholder="Category Description"
              value={category.description}
              onChange={(e) => updateArrayItem('exploreStore', 'categories', index, 'description', e.target.value)}
              rows={2}
              className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSellToUsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={content.sellToUs.title}
          onChange={(e) => updateContent('sellToUs', 'title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={content.sellToUs.subtitle}
          onChange={(e) => updateContent('sellToUs', 'subtitle', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
          <input
            type="text"
            value={content.sellToUs.primaryButtonText}
            onChange={(e) => updateContent('sellToUs', 'primaryButtonText', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
          <input
            type="text"
            value={content.sellToUs.secondaryButtonText}
            onChange={(e) => updateContent('sellToUs', 'secondaryButtonText', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Features</h3>
          <button
            onClick={() => addArrayItem('sellToUs', 'features', {
              icon: 'fas fa-check-circle',
              title: 'New Feature',
              description: 'Feature description'
            })}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Feature
          </button>
        </div>
        
        {content.sellToUs.features.map((feature, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Feature {index + 1}</h4>
              <button
                onClick={() => removeArrayItem('sellToUs', 'features', index)}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Icon (e.g., fas fa-check-circle)"
                value={feature.icon}
                onChange={(e) => updateArrayItem('sellToUs', 'features', index, 'icon', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Feature Title"
                value={feature.title}
                onChange={(e) => updateArrayItem('sellToUs', 'features', index, 'title', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <textarea
              placeholder="Feature Description"
              value={feature.description}
              onChange={(e) => updateArrayItem('sellToUs', 'features', index, 'description', e.target.value)}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderHowItWorksTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={content.howItWorks.title}
          onChange={(e) => updateContent('howItWorks', 'title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={content.howItWorks.subtitle}
          onChange={(e) => updateContent('howItWorks', 'subtitle', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Steps</h3>
          <button
            onClick={() => addArrayItem('howItWorks', 'steps', {
              stepNumber: content.howItWorks.steps.length + 1,
              title: 'New Step',
              description: 'Step description',
              icon: 'fas fa-arrow-right',
              features: []
            })}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Step
          </button>
        </div>
        
        {content.howItWorks.steps.map((step, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Step {step.stepNumber}</h4>
              <button
                onClick={() => removeArrayItem('howItWorks', 'steps', index)}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="number"
                placeholder="Step Number"
                value={step.stepNumber}
                onChange={(e) => updateArrayItem('howItWorks', 'steps', index, 'stepNumber', parseInt(e.target.value))}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Icon (e.g., fas fa-user)"
                value={step.icon}
                onChange={(e) => updateArrayItem('howItWorks', 'steps', index, 'icon', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Step Title"
                value={step.title}
                onChange={(e) => updateArrayItem('howItWorks', 'steps', index, 'title', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <textarea
              placeholder="Step Description"
              value={step.description}
              onChange={(e) => updateArrayItem('howItWorks', 'steps', index, 'description', e.target.value)}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Step Features (one per line)</label>
              <textarea
                placeholder="Enter features, one per line..."
                value={step.features.join('\n')}
                onChange={(e) => updateArrayItem('howItWorks', 'steps', index, 'features', e.target.value.split('\n').filter(f => f.trim()))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestimonialsTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={content.testimonials.title}
          onChange={(e) => updateContent('testimonials', 'title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={content.testimonials.subtitle}
          onChange={(e) => updateContent('testimonials', 'subtitle', e.target.value)}
          rows={2}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Testimonials</h3>
          <button
            onClick={() => addArrayItem('testimonials', 'items', {
              name: 'New Customer',
              position: 'Happy Customer',
              rating: 5,
              content: 'Great experience!',
              avatar: 'https://via.placeholder.com/100'
            })}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Add Testimonial
          </button>
        </div>
        
        {content.testimonials.items.map((testimonial, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Testimonial {index + 1}</h4>
              <button
                onClick={() => removeArrayItem('testimonials', 'items', index)}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={testimonial.name}
                onChange={(e) => updateArrayItem('testimonials', 'items', index, 'name', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Position/Title"
                value={testimonial.position}
                onChange={(e) => updateArrayItem('testimonials', 'items', index, 'position', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={testimonial.rating}
                onChange={(e) => updateArrayItem('testimonials', 'items', index, 'rating', parseInt(e.target.value))}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
              <input
                type="url"
                placeholder="Avatar Image URL"
                value={testimonial.avatar}
                onChange={(e) => updateArrayItem('testimonials', 'items', index, 'avatar', e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <textarea
              placeholder="Testimonial Content"
              value={testimonial.content}
              onChange={(e) => updateArrayItem('testimonials', 'items', index, 'content', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewsletterTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={content.newsletter.title}
          onChange={(e) => updateContent('newsletter', 'title', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={content.newsletter.subtitle}
          onChange={(e) => updateContent('newsletter', 'subtitle', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
          <input
            type="text"
            value={content.newsletter.buttonText}
            onChange={(e) => updateContent('newsletter', 'buttonText', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Text</label>
          <input
            type="text"
            value={content.newsletter.privacyText}
            onChange={(e) => updateContent('newsletter', 'privacyText', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'hero':
        return renderHeroTab();
      case 'exploreStore':
        return renderExploreStoreTab();
      case 'sellToUs':
        return renderSellToUsTab();
      case 'howItWorks':
        return renderHowItWorksTab();
      case 'testimonials':
        return renderTestimonialsTab();
      case 'newsletter':
        return renderNewsletterTab();
      default:
        return renderHeroTab();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">🏠 Homepage Management</h1>
          <p className="text-gray-600">Manage all homepage content sections - changes will appear on index.html</p>
        </div>
        
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {renderActiveTabContent()}

        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            💡 After saving, refresh index.html to see changes
          </div>
          <button
            onClick={saveContent}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
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
      </div>
    </div>
  );
} 