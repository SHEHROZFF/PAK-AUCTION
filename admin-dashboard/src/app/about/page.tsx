'use client';

import { useState, useEffect } from 'react';

interface AboutContent {
  _id?: string;
  hero: {
    title: string;
    subtitle: string;
  };
  story: {
    title: string;
    content: Array<{ paragraph: string; }>;
    image: {
      url: string;
      alt: string;
    };
  };
  mission: {
    title: string;
    subtitle: string;
    values: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  team: {
    title: string;
    members: Array<{
      name: string;
      position: string;
      bio: string;
      image: string;
      socialLinks: Array<{
        platform: string;
        url: string;
      }>;
    }>;
  };
  stats: {
    title: string;
    items: Array<{
      number: string;
      label: string;
      icon: string;
    }>;
  };
  testimonials: {
    title: string;
    items: Array<{
      name: string;
      position: string;
      content: string;
      rating: number;
      avatar: string;
    }>;
  };
}

export default function AboutManagementPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    hero: { title: '', subtitle: '' },
    story: { title: '', content: [], image: { url: '', alt: '' } },
    mission: { title: '', subtitle: '', values: [] },
    team: { title: '', members: [] },
    stats: { title: '', items: [] },
    testimonials: { title: '', items: [] }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadAboutContent();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadAboutContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/about/content`);
      const data = await response.json();

      if (data.success) {
        setAboutContent(data.data);
      }
    } catch (error) {
      console.error('Error loading about content:', error);
      showNotification('error', 'Failed to load about content');
    }
  };

  const saveAboutContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/about/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aboutContent)
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'About content updated successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving about content:', error);
      showNotification('error', 'Failed to save about content');
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (section: keyof AboutContent, data: any) => {
    setAboutContent(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const addArrayItem = (section: keyof AboutContent, field: string, defaultItem: any) => {
    setAboutContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: [...((prev[section] as any)[field] || []), defaultItem]
      }
    }));
  };

  const removeArrayItem = (section: keyof AboutContent, field: string, index: number) => {
    setAboutContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: ((prev[section] as any)[field] || []).filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const updateArrayItem = (section: keyof AboutContent, field: string, index: number, updatedItem: any) => {
    setAboutContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: ((prev[section] as any)[field] || []).map((item: any, i: number) => 
          i === index ? updatedItem : item
        )
      }
    }));
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'fas fa-home' },
    { id: 'story', label: 'Our Story', icon: 'fas fa-book' },
    { id: 'mission', label: 'Mission & Values', icon: 'fas fa-bullseye' },
    { id: 'team', label: 'Team', icon: 'fas fa-users' },
    { id: 'stats', label: 'Statistics', icon: 'fas fa-chart-bar' },
    { id: 'testimonials', label: 'Testimonials', icon: 'fas fa-quote-left' }
  ];

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
        <h1 className="text-2xl font-bold text-gray-800">About Page Management</h1>
        <p className="text-gray-600">Manage all sections of the about page</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      {activeTab === 'hero' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={aboutContent.hero.title}
                onChange={(e) => updateSection('hero', { ...aboutContent.hero, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea
                value={aboutContent.hero.subtitle}
                onChange={(e) => updateSection('hero', { ...aboutContent.hero, subtitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Story Section */}
      {activeTab === 'story' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Story Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={aboutContent.story.title}
                  onChange={(e) => updateSection('story', { 
                    ...aboutContent.story, 
                    title: e.target.value 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Paragraphs</label>
                {aboutContent.story.content.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <textarea
                        value={item.paragraph}
                        onChange={(e) => updateArrayItem('story', 'content', index, { paragraph: e.target.value })}
                        placeholder="Enter paragraph content..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={() => removeArrayItem('story', 'content', index)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('story', 'content', { paragraph: '' })}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Paragraph
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={aboutContent.story.image.url}
                    onChange={(e) => updateSection('story', {
                      ...aboutContent.story,
                      image: { ...aboutContent.story.image, url: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
                  <input
                    type="text"
                    value={aboutContent.story.image.alt}
                    onChange={(e) => updateSection('story', {
                      ...aboutContent.story,
                      image: { ...aboutContent.story.image, alt: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Section */}
      {activeTab === 'mission' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Mission Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={aboutContent.mission.title}
                  onChange={(e) => updateSection('mission', {
                    ...aboutContent.mission,
                    title: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={aboutContent.mission.subtitle}
                  onChange={(e) => updateSection('mission', {
                    ...aboutContent.mission,
                    subtitle: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Values</label>
                {aboutContent.mission.values.map((value, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-md font-medium">Value {index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('mission', 'values', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={value.title}
                          onChange={(e) => updateArrayItem('mission', 'values', index, {
                            ...value,
                            title: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon (FontAwesome class)</label>
                        <input
                          type="text"
                          value={value.icon}
                          onChange={(e) => updateArrayItem('mission', 'values', index, {
                            ...value,
                            icon: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="fas fa-shield-alt"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={value.description}
                        onChange={(e) => updateArrayItem('mission', 'values', index, {
                          ...value,
                          description: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('mission', 'values', { title: '', description: '', icon: '' })}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Value
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Section */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Team Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={aboutContent.team.title}
                  onChange={(e) => updateSection('team', {
                    ...aboutContent.team,
                    title: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                {aboutContent.team.members.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-md font-medium">Team Member {index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('team', 'members', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateArrayItem('team', 'members', index, {
                            ...member,
                            name: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={member.position}
                          onChange={(e) => updateArrayItem('team', 'members', index, {
                            ...member,
                            position: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={member.bio}
                        onChange={(e) => updateArrayItem('team', 'members', index, {
                          ...member,
                          bio: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        value={member.image}
                        onChange={(e) => updateArrayItem('team', 'members', index, {
                          ...member,
                          image: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                      {member.socialLinks.map((link, linkIndex) => (
                        <div key={linkIndex} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => {
                              const newSocialLinks = [...member.socialLinks];
                              newSocialLinks[linkIndex] = { ...link, platform: e.target.value };
                              updateArrayItem('team', 'members', index, {
                                ...member,
                                socialLinks: newSocialLinks
                              });
                            }}
                            placeholder="Platform (e.g., linkedin)"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => {
                              const newSocialLinks = [...member.socialLinks];
                              newSocialLinks[linkIndex] = { ...link, url: e.target.value };
                              updateArrayItem('team', 'members', index, {
                                ...member,
                                socialLinks: newSocialLinks
                              });
                            }}
                            placeholder="URL"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const newSocialLinks = member.socialLinks.filter((_, i) => i !== linkIndex);
                              updateArrayItem('team', 'members', index, {
                                ...member,
                                socialLinks: newSocialLinks
                              });
                            }}
                            className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newSocialLinks = [...member.socialLinks, { platform: '', url: '' }];
                          updateArrayItem('team', 'members', index, {
                            ...member,
                            socialLinks: newSocialLinks
                          });
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Add Social Link
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('team', 'members', { 
                    name: '', 
                    position: '', 
                    bio: '', 
                    image: '', 
                    socialLinks: [] 
                  })}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Team Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Statistics Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={aboutContent.stats.title}
                  onChange={(e) => updateSection('stats', {
                    ...aboutContent.stats,
                    title: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statistics</label>
                {aboutContent.stats.items.map((stat, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-md font-medium">Stat {index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('stats', 'items', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                        <input
                          type="text"
                          value={stat.number}
                          onChange={(e) => updateArrayItem('stats', 'items', index, {
                            ...stat,
                            number: e.target.value
                          })}
                          placeholder="1000+"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => updateArrayItem('stats', 'items', index, {
                            ...stat,
                            label: e.target.value
                          })}
                          placeholder="Happy Customers"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon (FontAwesome)</label>
                        <input
                          type="text"
                          value={stat.icon}
                          onChange={(e) => updateArrayItem('stats', 'items', index, {
                            ...stat,
                            icon: e.target.value
                          })}
                          placeholder="fas fa-users"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('stats', 'items', { number: '', label: '', icon: '' })}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Statistic
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Testimonials Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={aboutContent.testimonials.title}
                  onChange={(e) => updateSection('testimonials', {
                    ...aboutContent.testimonials,
                    title: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Testimonials</label>
                {aboutContent.testimonials.items.map((testimonial, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-md font-medium">Testimonial {index + 1}</h4>
                      <button
                        onClick={() => removeArrayItem('testimonials', 'items', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateArrayItem('testimonials', 'items', index, {
                            ...testimonial,
                            name: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={testimonial.position}
                          onChange={(e) => updateArrayItem('testimonials', 'items', index, {
                            ...testimonial,
                            position: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        value={testimonial.content}
                        onChange={(e) => updateArrayItem('testimonials', 'items', index, {
                          ...testimonial,
                          content: e.target.value
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="0.5"
                          value={testimonial.rating}
                          onChange={(e) => updateArrayItem('testimonials', 'items', index, {
                            ...testimonial,
                            rating: parseFloat(e.target.value) || 5
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                        <input
                          type="url"
                          value={testimonial.avatar}
                          onChange={(e) => updateArrayItem('testimonials', 'items', index, {
                            ...testimonial,
                            avatar: e.target.value
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('testimonials', 'items', { 
                    name: '', 
                    position: '', 
                    content: '', 
                    rating: 5, 
                    avatar: '' 
                  })}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Testimonial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button 
          onClick={saveAboutContent} 
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
} 