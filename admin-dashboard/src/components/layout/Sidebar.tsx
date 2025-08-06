'use client';

import { TabType } from '../AdminDashboard';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'products' as TabType, label: 'Products', icon: 'fas fa-box' },
    { id: 'product-submissions' as TabType, label: 'Product Submissions', icon: 'fas fa-upload' },
    { id: 'bids' as TabType, label: 'Bids Management', icon: 'fas fa-hand-paper' },
    { id: 'users' as TabType, label: 'User Management', icon: 'fas fa-users' },
    { id: 'categories' as TabType, label: 'Categories', icon: 'fas fa-tags' },
    { id: 'homepage' as TabType, label: 'Homepage Management', icon: 'fas fa-laptop-house' },
    { id: 'contact' as TabType, label: 'Contact Management', icon: 'fas fa-envelope' },
    { id: 'about' as TabType, label: 'About Management', icon: 'fas fa-info-circle' },
    { id: 'payment' as TabType, label: 'Payment Gateway', icon: 'fas fa-credit-card' },
    { id: 'whatsapp' as TabType, label: 'WhatsApp Integration', icon: 'fab fa-whatsapp' },
    { id: 'settings' as TabType, label: 'Website Settings', icon: 'fas fa-cog' },
    { id: 'notifications' as TabType, label: 'Notifications', icon: 'fas fa-bell' },
    // { id: 'pages' as TabType, label: 'Pages', icon: 'fas fa-file' },
    // { id: 'popups' as TabType, label: 'Popups', icon: 'fas fa-window-restore' },
  ];

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    // Close sidebar on mobile after tab change
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div
      className={`draggable-sidebar bg-white shadow-lg w-[280px] fixed h-full transition-all z-30 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <i className="fas fa-gavel"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-800">AuctionPro</h1>
        </div>
        <button
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="py-4 overflow-y-auto h-[calc(100%-64px)]">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar-link w-full flex items-center p-3 text-gray-700 rounded-lg group transition-all ${
                  activeTab === item.id ? 'active' : ''
                }`}
                onClick={() => handleTabClick(item.id)}
              >
                <i className={`${item.icon} w-5 h-5 text-indigo-600`}></i>
                <span className="ml-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* <div className="px-3 mt-8">
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-800 mb-2">
              Premium Plan
            </h3>
            <div className="flex items-center mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: '75%' }}
                ></div>
              </div>
              <span className="text-xs font-medium text-indigo-800 ml-2">
                75%
              </span>
            </div>
            <p className="text-xs text-indigo-700">
              Your plan renews on{' '}
              <span className="font-medium">July 12, 2023</span>
            </p>
            <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-4 rounded-lg transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div> */}

        {/* <div className="px-3 mt-8">
          <div className="flex items-center p-3 rounded-lg bg-gray-50">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Admin"
              className="w-10 h-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Alex Johnson</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="ml-auto">
              <button className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
} 