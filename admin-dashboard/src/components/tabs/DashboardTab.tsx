'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDashboardStats,
  fetchRevenueData,
  fetchCategoryStats,
  fetchRecentActivity,
  fetchEndingSoonAuctions
} from '@/store/slices/dashboardSlice';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function DashboardTab() {
  const dispatch = useAppDispatch();
  const {
    stats,
    revenueData,
    categoryStats,
    recentActivity,
    endingSoonAuctions,
    isLoading
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchDashboardStats());
    dispatch(fetchRevenueData('6months'));
    dispatch(fetchCategoryStats());
    dispatch(fetchRecentActivity());
    dispatch(fetchEndingSoonAuctions());
  }, [dispatch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Default values for when data is loading or not available
  const defaultStats = {
    totalProducts: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    totalBids: 0,
    newUsersThisMonth: 0,
    revenueGrowth: 0
  };

  const currentStats = stats || defaultStats;

  // Chart configurations
  const revenueChartData = {
    labels: revenueData?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData?.data || [4500, 5200, 4800, 5800, 6000, 7200],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryStats?.labels || ['Antiques', 'Art', 'Collectibles', 'Jewelry', 'Vintage'],
    datasets: [
      {
        data: categoryStats?.data || [30, 20, 25, 15, 10],
        backgroundColor: [
          '#4F46E5',
          '#7C3AED',
          '#EC4899',
          '#EF4444',
          '#F59E0B',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{currentStats.totalProducts.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 text-sm font-medium">
                    <i className="fas fa-arrow-up mr-1 text-green-500"></i>
                    12%
                  </span>
                  <span className="text-gray-400 text-xs ml-1">from last month</span>
                </div>
              </div>
              <div className="bg-blue-600 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <i className="fas fa-box text-white"></i>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-blue-600"></div>
        </div>

        {/* Active Auctions Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Auctions</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{currentStats.activeAuctions.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 text-sm font-medium">
                    <i className="fas fa-arrow-up mr-1 text-green-500"></i>
                    8%
                  </span>
                  <span className="text-gray-400 text-xs ml-1">from last month</span>
                </div>
              </div>
              <div className="bg-green-600 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <i className="fas fa-gavel text-white"></i>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-green-600"></div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">${currentStats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 text-sm font-medium">
                    <i className="fas fa-arrow-up mr-1 text-green-500"></i>
                    {currentStats.revenueGrowth}%
                  </span>
                  <span className="text-gray-400 text-xs ml-1">from last month</span>
                </div>
              </div>
              <div className="bg-purple-600 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <i className="fas fa-dollar-sign text-white"></i>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-purple-600"></div>
        </div>

        {/* Total Bids Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bids</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{currentStats.totalBids.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-500 text-sm font-medium">
                    <i className="fas fa-arrow-up mr-1 text-green-500"></i>
                    18%
                  </span>
                  <span className="text-gray-400 text-xs ml-1">from last month</span>
                </div>
              </div>
              <div className="bg-orange-600 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                <i className="fas fa-hand-paper text-white"></i>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-orange-600"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-80">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h3>
          <div className="h-80">
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity and Ending Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg}`}>
                    <i className={`${activity.icon} text-white text-xs`} style={{color: 'white'}}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ending Soon Auctions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Ending Soon</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {endingSoonAuctions.slice(0, 5).map((auction) => (
                <div key={auction.id} className="flex items-center space-x-3">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {auction.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Current: ${auction.currentBid.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600">{auction.timeLeft} left</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {auction.bidCount} bids
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 