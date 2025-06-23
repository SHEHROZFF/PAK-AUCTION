'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { DashboardTab } from './tabs/DashboardTab';
import { ProductsTab } from './tabs/ProductsTab';
import { BidsTab } from './tabs/BidsTab';
import { UsersTab } from './tabs/UsersTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { PaymentTab } from './tabs/PaymentTab';
import { SettingsTab } from './tabs/SettingsTab';
import { PagesTab } from './tabs/PagesTab';
import { PopupsTab } from './tabs/PopupsTab';
import NotificationsTab from './tabs/NotificationsTab';
import ContactManagementPage from '@/app/contact/page';
import AboutManagementPage from '@/app/about/page';
import HomepageManagementPage from '@/app/homepage/page';
import ProductSubmissionsPage from '@/app/product-submissions/page';

export type TabType = 'dashboard' | 'products' | 'bids' | 'users' | 'categories' | 'payment' | 'settings' | 'pages' | 'popups' | 'notifications' | 'contact' | 'about' | 'homepage' | 'product-submissions';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'products':
        return <ProductsTab />;
      case 'bids':
        return <BidsTab />;
      case 'users':
        return <UsersTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'payment':
        return <PaymentTab />;
      case 'settings':
        return <SettingsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'contact':
        return <ContactManagementPage />;
      case 'about':
        return <AboutManagementPage />;
      case 'homepage':
        return <HomepageManagementPage />;
      case 'product-submissions':
        return <ProductSubmissionsPage />;
    //   case 'pages':
    //     return <PagesTab />;
    //   case 'popups':
    //     return <PopupsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen overflow-auto relative bg-white">
      {/* Simple white background - no image */}
      <div className="absolute inset-0 bg-white pointer-events-none"></div>
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-[280px] transition-all relative z-10">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-4 md:p-6">
          {renderActiveTab()}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 