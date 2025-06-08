'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logoutUser());
    }
  };

  return (
    <header className="bg-white shadow-sm z-20 relative">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button
            className="md:hidden text-gray-500 hover:text-gray-700 mr-3"
            onClick={onMenuClick}
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* <div className="relative tooltip">
            <button className="text-gray-500 hover:text-gray-700 relative">
              <i className="fas fa-bell"></i>
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full badge-pulse"></span>
            </button>
            <span className="tooltip-text">3 new notifications</span>
          </div>
          <div className="relative tooltip">
            <button className="text-gray-500 hover:text-gray-700">
              <i className="fas fa-envelope"></i>
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-indigo-500 rounded-full"></span>
            </button>
            <span className="tooltip-text">5 unread messages</span>
          </div> */}
          
          {/* User Dropdown */}
          <div className="relative group">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=4f46e5&color=fff`}
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block">
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-user mr-2"></i>
                  Profile Settings
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <i className="fas fa-cog mr-2"></i>
                  Account Settings
                </button>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 